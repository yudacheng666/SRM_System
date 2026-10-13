/* 中文：离线 ZIP Store 格式打包多个供应商独立 XLSX，不引入网络依赖。
 * English: Small offline ZIP archive with CRC32 and UTF-8 names; no network dependencies. */
(function(root){
"use strict";
const MAX_ENTRY_BYTES=16*1024*1024,MAX_TOTAL_BYTES=80*1024*1024,MAX_ENTRIES=200;
const table=new Uint32Array(256);
for(let n=0;n<256;n++){let c=n;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0}
function crc32(bytes){let c=0xffffffff;for(const x of bytes)c=(c>>>8)^table[(c^x)&255];return (c^0xffffffff)>>>0}
function fail(message){throw Error("ZIP: "+message)}
function u16(bytes,pos,n){bytes[pos]=n&255;bytes[pos+1]=(n>>>8)&255}
function u32(bytes,pos,n){u16(bytes,pos,n);u16(bytes,pos+2,n>>>16)}
async function create(entries){
 if(!Array.isArray(entries)||!entries.length||entries.length>MAX_ENTRIES)fail("文件数量必须在 1 到 200 之间");
 const enc=new TextEncoder(),seen=new Set(),local=[],central=[];
 let offset=0,total=0;
 for(const entry of entries){
  if(!entry||typeof entry.name!=="string"||!(entry.blob instanceof Blob))fail("文件格式错误");
  const name=entry.name.trim();
  if(!name||name.includes("/")||name.includes("\\")||name.includes("..")||!/\.(xlsx|pdf|json|zip)$/i.test(name)||seen.has(name))
   fail("文件名冲突或无效");
  seen.add(name);
  const data=new Uint8Array(await entry.blob.arrayBuffer()),nameBytes=enc.encode(name);
  if(nameBytes.length>65535||data.length>MAX_ENTRY_BYTES)fail("单个文件过大");
  total+=data.length;
  if(total>MAX_TOTAL_BYTES)fail("打包文件总量超过安全限制");
  const crc=crc32(data),header=new Uint8Array(30+nameBytes.length);
  u32(header,0,0x04034b50);u16(header,4,20);u16(header,6,0x0800);
  u16(header,8,0);u32(header,10,0);u32(header,14,crc);
  u32(header,18,data.length);u32(header,22,data.length);
  u16(header,26,nameBytes.length);header.set(nameBytes,30);
  const c=new Uint8Array(46+nameBytes.length);
  u32(c,0,0x02014b50);u16(c,4,20);u16(c,6,20);
  u16(c,8,0x0800);u16(c,10,0);u32(c,12,0);
  u32(c,16,crc);u32(c,20,data.length);u32(c,24,data.length);
  u16(c,28,nameBytes.length);u32(c,42,offset);c.set(nameBytes,46);
  local.push(header,data);central.push(c);
  offset+=header.length+data.length;
 }
 const centerSize=central.reduce((n,x)=>n+x.length,0);
 const end=new Uint8Array(22);
 u32(end,0,0x06054b50);u16(end,8,entries.length);u16(end,10,entries.length);
 u32(end,12,centerSize);u32(end,16,offset);
 return new Blob([...local,...central,end],{type:"application/zip"});
}

/* 中文：只接受本项目生成的无压缩 Store ZIP；对文件名、CRC、大小和结构严格校验。
 * English: Read only bounded uncompressed ZIPs produced by this app; reject malformed, encrypted or traversing entries. */
async function read(blob){
 if(!(blob instanceof Blob)||blob.size>MAX_TOTAL_BYTES+2000000)fail("ZIP 太大或格式无效");
 const bytes=new Uint8Array(await blob.arrayBuffer()),dv=new DataView(bytes.buffer),dec=new TextDecoder("utf-8",{fatal:true});
 const u16=p=>dv.getUint16(p,true),u32=p=>dv.getUint32(p,true);
 const end=bytes.length-22;
 if(end<0||u32(end)!==0x06054b50||u16(end+20)!==0)fail("ZIP 结尾结构不正确");
 const count=u16(end+10),start=u32(end+16),size=u32(end+12);
 if(count<1||count>MAX_ENTRIES||u16(end+8)!==count||start+size!==end)fail("ZIP 目录结构不完整");
 let pos=start,localEnds=0,total=0;
 const records=[],seen=new Set();
 for(let i=0;i<count;i++){
  if(pos+46>end||u32(pos)!==0x02014b50)fail("ZIP 中央目录损坏");
  const flags=u16(pos+8),method=u16(pos+10),expectedCRC=u32(pos+16);
  const compressed=u32(pos+20),length=u32(pos+24),nameLength=u16(pos+28);
  const extra=u16(pos+30),comment=u16(pos+32),offset=u32(pos+42);
  if((flags&0x0800)===0||(flags&1)||method!==0||compressed!==length||
     length>MAX_ENTRY_BYTES||nameLength<1||pos+46+nameLength+extra+comment>end)fail("ZIP 条目不支持");
  const name=dec.decode(bytes.slice(pos+46,pos+46+nameLength));
  if(name.includes("/")||name.includes("\\")||name.includes("..")||
     !/\.(xlsx|pdf|json|zip)$/i.test(name)||seen.has(name))fail("ZIP 文件名不安全或重复");
  seen.add(name);total+=length;if(total>MAX_TOTAL_BYTES)fail("ZIP 解压内容超出限额");
  if(offset+30+nameLength>start||u32(offset)!==0x04034b50||
     u16(offset+8)!==0||u32(offset+14)!==expectedCRC||
     u32(offset+18)!==length||u32(offset+22)!==length||
     u16(offset+26)!==nameLength||u16(offset+28)!==0)fail("ZIP 本地条目与目录不一致");
  const dataStart=offset+30+nameLength;
  if(dataStart+length>start||dec.decode(bytes.slice(offset+30,dataStart))!==name)fail("ZIP 文件范围冲突");
  const data=bytes.slice(dataStart,dataStart+length);
  if(crc32(data)!==expectedCRC)fail("ZIP 文件 CRC 校验失败");
  localEnds=Math.max(localEnds,dataStart+length);
  records.push({name,blob:new Blob([data],{type:name.endsWith(".pdf")?"application/pdf":"application/octet-stream"})});
  pos+=46+nameLength+extra+comment;
 }
 if(pos!==end||localEnds!==start)fail("ZIP 数据和目录范围不吻合");
 return records;
}
root.SRMZip=Object.freeze({create,read,MAX_ENTRIES,MAX_TOTAL_BYTES});
if(typeof module!=="undefined"&&module.exports)module.exports=root.SRMZip;
})(typeof window!=="undefined"?window:globalThis);
