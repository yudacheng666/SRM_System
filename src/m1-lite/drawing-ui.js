/* 中文：本机正式询价的真实 PDF 关联/复用/解除，所有操作仅在当前 RFQ 中生效。
 * English: Buyer-only, explicit line-based PDF association with revision-safe reuse. */
{
 const line=document.getElementById("pilotDrawingLine"),files=document.getElementById("pilotDrawingFiles");
 const version=document.getElementById("pilotDrawingVersion"),upload=document.getElementById("pilotDrawingUpload");
 const existing=document.getElementById("pilotDrawingExisting"),attach=document.getElementById("pilotDrawingLink");
 const linked=document.getElementById("pilotDrawingLinked"),unlink=document.getElementById("pilotDrawingUnlink");
 const statusChoice=document.getElementById("pilotDrawingRequirement"),applyStatus=document.getElementById("pilotDrawingStatusSet");
 const info=document.getElementById("pilotDrawingInfo");
 const service=window.SRMDrawings;
 function chosen(){return items.find(it=>it.lineId===line.value)}
 function active(){return window.SRMPilot?.isBuyer()&&!document.getElementById("pilotSaveWorkspace").disabled}
 function tell(message,error=false){info.textContent=message;info.className=error?"small dangertext":"small muted"}
 function copies(){
  const map=new Map();
  for(const it of items)for(const d of service.docsForItem(it))map.set(d.sha256,d);
  return [...map.values()];
 }
 function sync(){
  const old=line.value,ls=items.slice().sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
  line.replaceChildren();
  for(const it of ls){
   const op=document.createElement("option");op.value=it.lineId;
   op.textContent=it.id+" · "+it.name+" · "+it.lineId;line.appendChild(op);
  }
  if(ls.some(x=>x.lineId===old))line.value=old;
  const it=chosen(),all=copies();
  existing.replaceChildren();linked.replaceChildren();
  for(const d of all){
   const op=document.createElement("option");op.value=d.sha256;
   op.textContent=d.name+" · Rev "+d.revision+" · "+d.sha256.slice(0,8);
   existing.appendChild(op);
  }
  if(it)for(const d of service.docsForItem(it)){
   const op=document.createElement("option");op.value=d.sha256;
   op.textContent=d.name+" · Rev "+d.revision;linked.appendChild(op);
  }
  statusChoice.value=it?.drawingStatus||"required";
  const available=!!it&&active(),locked=it?itemHasAnyQuoteHistory(it.lineId):false;
  for(const el of [files,version,upload,existing,attach,linked,unlink,statusChoice,applyStatus])
   el.disabled=!available||locked;
  if(it&&locked)tell("该行已有报价历史，不能静默修改或删除关联图纸；请新建询价版本。");
 }
 line.onchange=sync;
 line.addEventListener("focus",sync);
 upload.onclick=async()=>{
  const it=chosen(),ws=window.SRMPilot?.snapshot();
  if(!it||!ws||itemHasAnyQuoteHistory(it.lineId))return;
  const batch=[...files.files];
  if(!batch.length){tell("请先选择至少一个 PDF 文件",true);return}
  upload.disabled=true;tell("正在校验并保存原始 PDF……");
  try{
   const additions=[];
   for(const f of batch){
    const d=await service.store(ws.workspaceId,f,version.value);
    if([...service.docsForItem(it),...additions].some(x=>x.name===d.name&&x.revision===d.revision&&x.sha256!==d.sha256))
     throw Error("同名且同版本图纸已有不同内容，必须更换版本号："+d.name);
    if(!service.docsForItem(it).some(x=>x.sha256===d.sha256))additions.push(d);
   }
   it.drawings=[...service.docsForItem(it),...additions];
   if(additions.length){
    window.SRMPilot.noteDrawingChange();
    renderItemList();renderAssignAll();
   }
   files.value="";sync();
   tell("已保存 "+additions.length+" 份真实 PDF 原件并关联此询价行；请点击“保存到本机”提交关联。");
  }catch(e){tell("图纸导入未完成："+e.message,true)}
  finally{upload.disabled=false}
 };
 attach.onclick=()=>{
  const it=chosen(),doc=copies().find(x=>x.sha256===existing.value);
  if(!it||!doc||itemHasAnyQuoteHistory(it.lineId))return;
  if(service.docsForItem(it).some(d=>d.sha256===doc.sha256)){tell("当前 RFQ 行已关联这份文件");return}
  if(service.docsForItem(it).some(d=>d.name===doc.name&&d.revision===doc.revision)){
   tell("同名同版本图纸不能同时关联两个不同内容",true);return;
  }
  it.drawings=[...service.docsForItem(it),doc];window.SRMPilot.noteDrawingChange();
  renderItemList();renderAssignAll();sync();
  tell("已复用现有图纸到当前 RFQ 行；关联尚未保存。");
 };
 unlink.onclick=()=>{
  const it=chosen(),hash=linked.value;
  if(!it||!hash||itemHasAnyQuoteHistory(it.lineId))return;
  if(!confirm("解除当前物料与这份图纸的关联？PDF 原件和其他物料的关联仍会保留。"))return;
  it.drawings=service.docsForItem(it).filter(d=>d.sha256!==hash);
  window.SRMPilot.noteDrawingChange();renderItemList();renderAssignAll();sync();
  tell("已解除当前行关联；原始 PDF 不会删除，请保存工作。");
 };
 applyStatus.onclick=()=>{
  const it=chosen();
  if(!it||itemHasAnyQuoteHistory(it.lineId))return;
  if(statusChoice.value==="not_required"&&service.docsForItem(it).length){
   tell("已关联图纸的物料不能直接标记为无需图纸；请先核对关联。",true);return;
  }
  it.drawingStatus=statusChoice.value;window.SRMPilot.noteDrawingChange();
  renderItemList();sync();tell("已更新本行图纸状态，请保存工作。");
 };
 const refresh=()=>sync();
 window.SRMDrawUI=Object.freeze({refresh});
}
