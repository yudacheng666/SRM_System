/* 中文：PDF 原件存于现有 IndexedDB 工作区对象库的独立 asset 键中，不进入 JSON。
 * English: Persist real PDF binaries alongside RFQ records under separate asset keys in the existing DB. */
(function(root){
"use strict";
const DB="srm-lite-local-v1",STORE="workspaces",MAX_PDF_BYTES=12*1024*1024;
const isPdfName=name=>/\.pdf$/i.test(name||"");
const key=(ws,sha)=>"asset:"+ws+":"+sha;
function fail(s){throw Error("图纸："+s)}
function openDB(){
 return new Promise((resolve,reject)=>{
  const r=indexedDB.open(DB,1);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||Error("无法打开图纸存储"));
  r.onblocked=()=>reject(Error("其他 SRM 页面阻止图纸数据库操作"));
 });
}
async function digest(bytes){
 if(!root.crypto?.subtle)fail("当前离线环境无法进行 SHA-256 校验，拒绝接收原件");
 const data=await root.crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(data)).map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function verify(file){
 if(!file||!isPdfName(file.name)||!file.size||file.size>MAX_PDF_BYTES)
  fail("只接收不超过 12MB 的真实 PDF 文件");
 const bytes=await file.arrayBuffer(),head=new TextDecoder("ascii").decode(bytes.slice(0,8));
 if(!head.startsWith("%PDF-"))fail("文件不是有效 PDF 格式");
 const tail=new TextDecoder("ascii").decode(bytes.slice(Math.max(0,bytes.byteLength-2048)));
 if(!tail.includes("%%EOF"))fail("PDF 缺少文件结束标记，可能已损坏");
 return{sha256:await digest(bytes),size:bytes.byteLength,blob:new Blob([bytes],{type:"application/pdf"})};
}
async function write(workspaceId,hash,blob){
 const db=await openDB();
 try{
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,"readwrite"),st=tx.objectStore(STORE);
   const r=st.get(key(workspaceId,hash));let error=null;
   r.onsuccess=()=>{try{
    if(r.result){if(r.result.size!==blob.size)throw Error("同校验值的原件大小冲突");}
    else st.put(blob,key(workspaceId,hash));
   }catch(e){error=e;tx.abort()}};
   tx.oncomplete=()=>resolve();
   tx.onerror=()=>reject(error||tx.error||Error("写入失败"));
   tx.onabort=()=>reject(error||tx.error||Error("图纸写入取消"));
  });
 }finally{db.close()}
}
async function get(workspaceId,hash){
 const db=await openDB();
 try{
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,"readonly"),r=tx.objectStore(STORE).get(key(workspaceId,hash));
   let result;
   r.onsuccess=()=>{result=r.result||null};
   tx.oncomplete=()=>resolve(result);
   tx.onerror=()=>reject(tx.error||Error("读取图纸失败"));
  });
 }finally{db.close()}
}
async function store(workspaceId,file,revision){
 const obj=await verify(file);await write(workspaceId,obj.sha256,obj.blob);
 const version=String(revision||"A").trim().slice(0,80);
 if(!version)fail("必须指定版本");
 return{id:obj.sha256.slice(0,16),sha256:obj.sha256,name:file.name,revision:version,
  size:obj.size,createdAt:new Date().toISOString()};
}
function docsForItem(item){return Array.isArray(item.drawings)?item.drawings:[]}
function scoped(ws,supplierId){
 const assigned=new Map(ws.state.assignments.map(x=>[x.key,new Set(x.values)]));
 const items=ws.state.items.filter(x=>assigned.get(x.lineId)?.has(supplierId));
 if(!items.length)fail("供应商没有获分配物料");
 const uniq=new Map(),missing=[],pending=[];
 for(const it of items){
  const docs=docsForItem(it);
  if(it.drawingStatus==="pending"){pending.push(it.lineId);continue}
  if(!docs.length){if(it.drawingStatus!=="not_required")missing.push(it.lineId);continue}
  for(const doc of docs){
   if(!doc.sha256||!doc.name||!doc.revision)fail("图纸关联记录缺失必要信息");
   uniq.set(doc.sha256,doc);
  }
 }
 return{items,docs:[...uniq.values()],missing,pending};
}
async function packageFor(ws,supplierId,excel,name){
 const scope=scoped(ws,supplierId),entries=[{name,blob:excel}];
 const manifest={format:"srm-supplier-drawing-manifest",version:1,workspaceId:ws.workspaceId,
  supplierId,items:scope.items.map(it=>({lineId:it.lineId,itemCode:it.id,
   drawingStatus:it.drawingStatus||"required",
   drawings:it.drawingStatus==="pending"?[]:docsForItem(it).map(d=>({sha256:d.sha256,name:d.name,revision:d.revision}))})),
  missingLineIds:scope.missing,pendingRevisionLineIds:scope.pending,documents:[]};
 let n=0;
 for(const doc of scope.docs){
  const blob=await get(ws.workspaceId,doc.sha256);
  if(!blob)fail("图纸原件缺失："+doc.name+"，请重新导入或恢复完整资料包");
  if(await digest(await blob.arrayBuffer())!==doc.sha256)fail("图纸校验值不符："+doc.name);
  const filename="PDF_"+String(++n).padStart(3,"0")+"_"+doc.sha256.slice(0,12)+".pdf";
  entries.push({name:filename,blob});
  manifest.documents.push({...doc,file:filename});
 }
 entries.push({name:"图纸关联清单.json",blob:new Blob([JSON.stringify(manifest,null,2)],{type:"application/json"})});
 const zipped=await root.SRMZip.create(entries);
 return{zip:zipped,missing:scope.missing,pending:scope.pending,docCount:scope.docs.length,manifest};
}
async function completeBackup(workspaces){
 const json=root.M1Backup.createAll(workspaces);
 const entries=[{name:"全部询价结构化数据.json",blob:new Blob([json],{type:"application/json"})}],seen=new Set();
 for(const ws of workspaces)for(const it of ws.state.items)for(const doc of docsForItem(it)){
  const identity=ws.workspaceId+"|"+doc.sha256;
  if(seen.has(identity))continue;seen.add(identity);
  const blob=await get(ws.workspaceId,doc.sha256);
  if(!blob)fail("不能创建完整备份，原件缺失："+doc.name);
  if(await digest(await blob.arrayBuffer())!==doc.sha256)fail("完整备份发现文件校验不一致："+doc.name);
  const filename="pdf_"+entries.length.toString().padStart(4,"0")+".pdf";
  entries.push({name:filename,blob});
 }
 const files=[],allDocs=new Set();
 let pdfIndex=1;
 for(const ws of workspaces)for(const it of ws.state.items)for(const doc of docsForItem(it)){
  const id=ws.workspaceId+"|"+doc.sha256;
  if(allDocs.has(id))continue;
  allDocs.add(id);
  files.push({workspaceId:ws.workspaceId,sha256:doc.sha256,name:doc.name,size:doc.size,
    file:"pdf_"+String(pdfIndex++).padStart(4,"0")+".pdf"});
 }
 entries.push({name:"图纸文件索引.json",blob:new Blob([JSON.stringify({format:"srm-pdf-files",version:1,files},null,2)],{type:"application/json"})});
 return root.SRMZip.create(entries);
}
async function unpackComplete(file){
 if(!file||file.size>80*1024*1024)fail("完整包不能超过 80MB");
 const data=await root.SRMZip.read(file),items=new Map(data.map(x=>[x.name,x.blob]));
 if(!items.has("全部询价结构化数据.json")||!items.has("图纸文件索引.json"))
  fail("不是有效的完整资料备份 ZIP");
 const records=root.M1Backup.parseAll(await items.get("全部询价结构化数据.json").text()).workspaces;
 const index=JSON.parse(await items.get("图纸文件索引.json").text());
 if(index.format!=="srm-pdf-files"||index.version!==1||!Array.isArray(index.files))fail("图纸索引格式错误");
 const all=new Map(),assets=[];
 for(const ws of records)for(const it of ws.state.items)for(const d of docsForItem(it))all.set(ws.workspaceId+"|"+d.sha256,{ws,d});
 const listed=new Set();
 for(const ent of index.files){
  const identity=ent.workspaceId+"|"+ent.sha256;
  if(listed.has(identity)||!all.has(identity))fail("索引存在多余或重复图纸");
  listed.add(identity);
  const blob=items.get(ent.file);
  if(!blob||await digest(await blob.arrayBuffer())!==ent.sha256)fail("图纸原件校验失败："+ent.file);
  assets.push({workspaceId:ent.workspaceId,sha256:ent.sha256,blob});
 }
 if(listed.size!==all.size)fail("完整备份缺少部分 PDF 原件");
 return{records,assets};
}
root.SRMDrawings=Object.freeze({MAX_PDF_BYTES,openDB,verify,store,get,digest,docsForItem,scoped,packageFor,completeBackup,unpackComplete,key});
if(typeof module!=="undefined"&&module.exports)module.exports=root.SRMDrawings;
})(typeof window!=="undefined"?window:globalThis);
