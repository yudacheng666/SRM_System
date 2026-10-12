/* SRM-Lite strict XLSX subset for small RFQ tabular worksheets.
 * 中文：离线读取真实 OOXML XLSX（ZIP/DEFLATE），生成可由 Excel 打开的标准 XLSX；
 * 不解析公式、不支持加密文件、宏和复杂表格布局，以明确报错代替猜测数据。
 * English: Strict small-tabular OOXML XLSX reader/writer. Reject formulas, encrypted books,
 * macros and unsupported layouts rather than silently fabricating procurement data.
 * No network, server, or third-party binaries required (Chromium/Edge DecompressionStream).
 */
(function(root){
"use strict";
const MAX_INPUT=12*1024*1024,MAX_PART=32*1024*1024,MAX_PARTS=160,MAX_ROWS=20000,MAX_COLS=80;
const u8=s=>new TextEncoder().encode(s),str=b=>new TextDecoder("utf-8",{fatal:true}).decode(b);
const byteLen=s=>u8(s).length;
function err(message){throw Error("XLSX: "+message)}
function u16(b,i){return b[i]|(b[i+1]<<8)}
function u32(b,i){return (b[i]|(b[i+1]<<8)|(b[i+2]<<16)|(b[i+3]<<24))>>>0}
function w16(b,i,n){b[i]=n&255;b[i+1]=(n>>>8)&255}
function w32(b,i,n){w16(b,i,n);w16(b,i+2,n>>>16)}
const CRC=new Uint32Array(256);
for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;CRC[i]=c>>>0}
function crc32(bytes){let c=0xffffffff;for(const x of bytes)c=CRC[(c^x)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function join(parts){const n=parts.reduce((a,b)=>a+b.length,0),out=new Uint8Array(n);let p=0;for(const b of parts){out.set(b,p);p+=b.length}return out}
function zipStore(files){
 const locals=[],centers=[];let offset=0,count=0;
 for(const [name,value] of Object.entries(files)){
  if(!/^[\w.[\]\/-]+$/.test(name)||name.includes(".."))err("不安全的 ZIP 文件名");
  const body=value instanceof Uint8Array?value:u8(value),nameBytes=u8(name);
  const local=new Uint8Array(30+nameBytes.length),central=new Uint8Array(46+nameBytes.length),crc=crc32(body);
  w32(local,0,0x04034b50);w16(local,4,20);w16(local,6,0x800);
  w32(local,14,crc);w32(local,18,body.length);w32(local,22,body.length);w16(local,26,nameBytes.length);
  local.set(nameBytes,30);
  w32(central,0,0x02014b50);w16(central,4,20);w16(central,6,20);w16(central,8,0x800);
  w32(central,16,crc);w32(central,20,body.length);w32(central,24,body.length);
  w16(central,28,nameBytes.length);w32(central,42,offset);central.set(nameBytes,46);
  locals.push(local,body);centers.push(central);offset+=local.length+body.length;count++;
 }
 if(count>MAX_PARTS||offset>100*1024*1024)err("导出超过容量限制");
 const center=join(centers),end=new Uint8Array(22);
 w32(end,0,0x06054b50);w16(end,8,count);w16(end,10,count);
 w32(end,12,center.length);w32(end,16,offset);
 return join([...locals,center,end]);
}
async function unzip(bytes){
 if(bytes.length>MAX_INPUT)err("文件超过 12MB");
 let end=-1;
 for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)
  if(u32(bytes,p)===0x06054b50&&p+22+u16(bytes,p+20)<=bytes.length){end=p;break}
 if(end<0)err("这不是有效的 .xlsx ZIP 文件");
 const count=u16(bytes,end+10),total=u32(bytes,end+12),start=u32(bytes,end+16);
 if(count>MAX_PARTS||count===0||start+total>bytes.length||count===65535)err("ZIP 目录不符合安全限制");
 let p=start,size=0;const entries={};
 for(let i=0;i<count;i++){
  if(u32(bytes,p)!==0x02014b50||p+46>bytes.length)err("ZIP 目录损坏");
  const flags=u16(bytes,p+8),method=u16(bytes,p+10),crc=u32(bytes,p+16),
     zipped=u32(bytes,p+20),plain=u32(bytes,p+24),nl=u16(bytes,p+28),
     extra=u16(bytes,p+30),comment=u16(bytes,p+32),pos=u32(bytes,p+42);
  if(p+46+nl+extra+comment>bytes.length||pos+30>bytes.length)err("ZIP 文件偏移错误");
  if(flags&1||![0,8].includes(method)||plain>MAX_PART||zipped>MAX_INPUT)err("文件被加密或包含不支持的压缩");
  size+=plain;if(size>MAX_PART*2)err("解压体积超过安全限制");
  const name=str(bytes.subarray(p+46,p+46+nl));
  p+=46+nl+extra+comment;
  if(name.endsWith("/"))continue;
  if(name.includes("..")||name.startsWith("/")||Object.hasOwn(entries,name))err("存在重复或不安全的 ZIP 路径");
  if(u32(bytes,pos)!==0x04034b50)err("ZIP 内容损坏");
  const dataStart=pos+30+u16(bytes,pos+26)+u16(bytes,pos+28);
  if(dataStart+zipped>bytes.length)err("ZIP 内容越界");
  entries[name]={method,crc,plain,compressed:bytes.slice(dataStart,dataStart+zipped)};
 }
 const needed=Object.keys(entries).filter(name=>
  name==="[Content_Types].xml"||name==="xl/workbook.xml"||name==="xl/_rels/workbook.xml.rels"||
  name==="xl/sharedStrings.xml"||/^xl\/worksheets\/[^/]+\.xml$/.test(name));
 if(!entries["xl/workbook.xml"])err("缺少 Excel 工作簿主体");
 const out={};
 for(const name of needed){
  const e=entries[name];let data;
  if(e.method===0)data=e.compressed;
  else{
   if(typeof DecompressionStream==="undefined")err("浏览器不支持离线 ZIP 解压，请更新 Edge/Chrome");
   try{
    const stream=new Blob([e.compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    data=new Uint8Array(await new Response(stream).arrayBuffer());
   }catch(_){err("压缩的 Excel 工作表无法解析，请检查文件是否损坏")}
  }
  if(data.length!==e.plain||crc32(data)!==e.crc)err("Excel ZIP 校验失败："+name);
  out[name]=str(data);
 }
 return out;
}
function xmlDoc(text){
 if(!text||/<!DOCTYPE|<!ENTITY/i.test(text))err("Excel XML 含不支持的声明");
 const doc=new DOMParser().parseFromString(text,"application/xml");
 if(doc.getElementsByTagName("parsererror").length)err("Excel XML 格式错误");
 return doc;
}
function elements(parent,name){return [...parent.getElementsByTagName("*")].filter(x=>x.localName===name)}
function first(parent,name){return elements(parent,name)[0]}
function allText(el){return el?elements(el,"t").map(x=>x.textContent||"").join(""):""}
function excelCol(cell){
 const m=/^([A-Z]+)\d+$/.exec(cell||"");if(!m)err("单元格地址异常："+cell);
 let n=0;for(const x of m[1])n=n*26+x.charCodeAt(0)-64;
 return n-1;
}
function parseSheet(text,shared){
 const doc=xmlDoc(text),data=first(doc,"sheetData");
 if(!data)err("工作表没有 sheetData");
 const rows=[];
 for(const row of elements(data,"row")){
  const cells=[];
  for(const cell of [...row.children].filter(x=>x.localName==="c")){
   if(first(cell,"f"))err("发现公式单元格；请在 Excel 中粘贴为值后重新导入");
   const col=excelCol(cell.getAttribute("r"));
   if(col>=MAX_COLS)err("列数超过 80 列限制");
   const type=cell.getAttribute("t")||"n",v=first(cell,"v")?.textContent||"";
   let value;
   if(type==="s"){
    const ix=Number(v);if(!Number.isInteger(ix)||ix<0||ix>=shared.length)err("共享字符串引用错误");
    value=shared[ix];
   }else if(type==="inlineStr")value=allText(first(cell,"is"));
   else if(type==="str"||type==="n"||type==="b")value=v;
   else if(type==="e")err("工作表存在错误值，请先修正 Excel 文件");
   else err("工作表包含不支持的单元格类型");
   cells[col]=value;
  }
  if(cells.some(v=>v!==undefined&&v!==""))rows.push(Array.from({length:cells.length},(_,i)=>cells[i]??""));
  if(rows.length>MAX_ROWS)err("行数超过 20,000 行限制");
 }
 return rows;
}
function resolveTarget(target){
 let s=String(target||"").replace(/\\/g,"/");
 if(!s||/^https?:|^file:/i.test(s))err("不允许外部工作表链接");
 s=s.startsWith("/")?s.slice(1):"xl/"+s;
 const parts=[];
 for(const seg of s.split("/")){if(seg===".."){if(!parts.length)err("无效工作表位置");parts.pop()}else if(seg&&seg!==".")parts.push(seg)}
 const result=parts.join("/");if(!result.startsWith("xl/"))err("工作表不在 Excel 文件目录中");
 return result;
}
async function read(arrayBuffer,headers){
 const files=await unzip(new Uint8Array(arrayBuffer));
 const book=xmlDoc(files["xl/workbook.xml"]);
 const relationship=xmlDoc(files["xl/_rels/workbook.xml.rels"]||"");
 const relationships={};
 for(const rel of elements(relationship,"Relationship"))
  relationships[rel.getAttribute("Id")]=rel.getAttribute("Target");
 const sheets=elements(book,"sheet");
 if(!sheets.length)err("没有工作表");
 const shared=files["xl/sharedStrings.xml"]?
  elements(xmlDoc(files["xl/sharedStrings.xml"]),"si").map(si=>allText(si)):[];
 const matches=[];
 for(const sheet of sheets.slice(0,20)){
  const rid=sheet.getAttribute("r:id")||sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id");
  const path=resolveTarget(relationships[rid]);
  if(!files[path])err("工作表内容缺失："+sheet.getAttribute("name"));
  const rows=parseSheet(files[path],shared);
  if(!rows.length)continue;
  const firstRow=rows[0].map(s=>s.trim());
  if(headers.some(h=>firstRow.includes(h)))
   matches.push({sheetName:sheet.getAttribute("name")||"",rows,headers:firstRow});
 }
 if(!matches.length)err("没有找到包含必要列标题的工作表："+headers.join(" 或 "));
 const target=matches[0];
 // Hard fail on multiple matching sheets to prevent silently dropping material lines.
 if(matches.length>1)err("有多张匹配的工作表（"+matches.map(m=>m.sheetName).join("、")+"），请另存单张数据工作表再导入");
 if(target.rows.length<2)err("工作表没有数据行");
 if(target.headers.some(h=>!h))err("表头存在空列名");
 if(target.headers.length!==new Set(target.headers).size)err("存在重复列标题");
 const lines=target.rows.map(row=>row.map(v=>String(v??"")));
 return {sheetName:target.sheetName,rows:lines,tsv:lines.map(row=>row.map(v=>/[\t\n"]/g.test(v)?'"'+v.replace(/"/g,'""')+'"':v).join("\t")).join("\n")};
}
const esc=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
function colLabel(n){let s="";do{s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)-1}while(n>=0);return s}
function worksheet(rows){
 if(rows.length>MAX_ROWS||rows.some(row=>row.length>MAX_COLS))err("导出行列超过限额");
 const lines=rows.map((row,i)=>{
  const cells=row.map((raw,j)=>{
   if(raw===null||raw===undefined||raw==="")return"";
   const pos=colLabel(j)+(i+1);
   if(typeof raw==="number"&&Number.isFinite(raw))return'<c r="'+pos+'"><v>'+raw+'</v></c>';
   // Trusted report formula descriptors only; raw supplier text stays literal.
   if(raw&&typeof raw==="object"&&typeof raw.formula==="string"){
     if(!/^=(ROUND\([A-Z]+\d+\*[A-Z]+\d+,2\)|SUMIF\([A-Z]+\d+:[A-Z]+\d+,"是",[A-Z]+\d+:[A-Z]+\d+\))$/.test(raw.formula))
       err("导出计算公式无效");
     return'<c r="'+pos+'"><f>'+esc(raw.formula.slice(1))+'</f></c>';
   }
   // Always inline string: protects inventory IDs with leading zeros and formula injection.
   return'<c r="'+pos+'" t="inlineStr"><is><t xml:space="preserve">'+esc(raw)+'</t></is></c>';
  }).join("");
  return'<row r="'+(i+1)+'">'+cells+"</row>";
 }).join("");
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
 '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>'+lines+'</sheetData>'+
 (rows.length>1?'<autoFilter ref="A1:'+colLabel(Math.max(0,rows[0].length-1))+rows.length+'"/>':"")+'</worksheet>';
}
function create(sheets){
 if(!Array.isArray(sheets)||!sheets.length||sheets.length>8)err("导出工作表数量无效");
 const names=new Set(),files={};
 const namespaces='xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
 const types=[],tabs=[],rels=[];
 sheets.forEach((sheet,i)=>{
  if(!sheet||!Array.isArray(sheet.rows)||typeof sheet.name!=="string")err("工作表结构错误");
  let name=sheet.name.trim();
  if(!name||name.length>31||/[\[\]\\/:*?]/.test(name)||names.has(name))err("工作表名称无效或重复");
  names.add(name);
  const n=i+1;
  files["xl/worksheets/sheet"+n+".xml"]=worksheet(sheet.rows);
  tabs.push('<sheet name="'+esc(name)+'" sheetId="'+n+'" r:id="rId'+n+'"/>');
  rels.push('<Relationship Id="rId'+n+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+n+'.xml"/>');
  types.push('<Override PartName="/xl/worksheets/sheet'+n+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>');
 });
 files["xl/workbook.xml"]='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook '+namespaces+'><sheets>'+tabs.join("")+'</sheets></workbook>';
 files["xl/_rels/workbook.xml.rels"]='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+rels.join("")+'</Relationships>';
 files["_rels/.rels"]='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
 files["[Content_Types].xml"]='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+types.join("")+'</Types>';
 return new Blob([zipStore(files)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}
root.SRMExcel=Object.freeze({read,create,MAX_INPUT,MAX_ROWS});
if(typeof module!=="undefined"&&module.exports)module.exports=root.SRMExcel;
})(typeof window!=="undefined"?window:globalThis);
