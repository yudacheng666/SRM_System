/* 中文：批量 PDF 文件名匹配预览；所有对应关系仅在采购员确认后落入当前 RFQ。
 * English: Review-first bulk drawing matcher; never silently attach tentative candidates. */
{
 const service=window.SRMDrawings,matcher=window.SRMDrawingMatcher;
 const input=document.getElementById("pilotBatchDrawingFiles");
 const analyze=document.getElementById("pilotBatchDrawingAnalyze");
 const accept=document.getElementById("pilotBatchDrawingConfirm");
 const clear=document.getElementById("pilotBatchDrawingClear");
 const table=document.getElementById("pilotBatchDrawingPreview");
 const summary=document.getElementById("pilotBatchDrawingSummary");
 const defaultVersion=document.getElementById("pilotBatchDrawingVersion");
 const manualLine=document.getElementById("pilotBatchDrawingManualLine");
 const manualSet=document.getElementById("pilotBatchDrawingManualAssign");
 const manualFocus=document.getElementById("pilotBatchDrawingFocus");
 const MAX_FILES=100,MAX_TOTAL=64*1024*1024;
 let staged=[],baseline=null,focused=-1,busy=false;
 const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const isBuyer=()=>!!window.SRMPilot?.isBuyer();
 const model=()=>window.SRMPilot?.snapshot();
 const sig=()=>JSON.stringify(items.map(it=>({
  lineId:it.lineId,id:it.id,drawingNo:it.drawingNo,drawingNumber:it.drawingNumber,
  drawingCode:it.drawingCode,custom:it.custom,drawings:it.drawings,
  drawingStatus:it.drawingStatus,locked:itemHasAnyQuoteHistory(it.lineId)
 })));
 function lineName(it){return it.id+" · "+(it.drawingNo?"图号 "+it.drawingNo+" · ":"")+it.lineId}
 function tell(message,bad=false){
  summary.textContent=message;
  summary.className=bad?"small dangertext":"small muted";
 }
 function render(){
  table.replaceChildren();
  if(!staged.length){accept.disabled=true;manualSet.disabled=true;return}
  const labels={unique:"单候选匹配",multiple:"多个候选·需确认",review:"编码后缀需确认",missing:"未匹配·手工指定",
   invalid:"文件校验失败",duplicate:"重复内容"};
  const head='<thead><tr><th>选中</th><th>PDF 文件／检测结果</th><th>关联的物料行</th><th>图纸版本</th><th>人工复核</th></tr></thead>';
  const body=staged.map((r,i)=>{
   const options=['<option value="">— 尚未指定 —</option>'];
   for(const candidate of r.match.candidates){
    const item=items.find(x=>x.lineId===candidate.lineId);
    if(item)options.push('<option value="'+esc(item.lineId)+'" '+
      (r.lineId===item.lineId?'selected':'')+'>'+esc(lineName(item))+' ['+esc(candidate.source)+']</option>');
   }
   // 中文：手动指定的行不一定原属于文件名候选，需要显示完整且可追溯的目标。
   // English: Explicit manual override may refer to a non-candidate RFQ line.
   if(r.lineId&&!r.match.candidates.some(c=>c.lineId===r.lineId)){
    const target=items.find(x=>x.lineId===r.lineId);
    if(target)options.push('<option value="'+esc(target.lineId)+'" selected>'+esc(lineName(target))+' [人工指定]</option>');
   }
   const selectable=!!r.data&&!r.duplicate;
   return '<tr data-batch-row="'+i+'">'+
    '<td><input type="checkbox" data-batch-check="'+i+'" '+(r.checked?'checked':'')+
      (selectable?'':' disabled')+'></td>'+
    '<td><b>'+esc(r.file.name)+'</b><div class="pdfMeta">'+esc(labels[r.duplicate?'duplicate':r.status]||r.status)+
    ' · '+esc(r.reason)+'</div></td>'+
    '<td><select data-batch-target="'+i+'" '+(selectable?'':'disabled')+'>'+options.join("")+'</select></td>'+
    '<td><input type="text" data-batch-version="'+i+'" maxlength="80" style="width:90px" value="'+esc(r.version)+'" '+(selectable?'':'disabled')+'></td>'+
    '<td><button type="button" class="btn '+(focused===i?'soft':'')+'" data-batch-focus="'+i+'">指定此文件</button></td>'+
    '</tr>';
  }).join("");
  table.innerHTML=head+'<tbody>'+body+'</tbody>';
  accept.disabled=!staged.some(x=>x.checked&&x.data&&!x.duplicate);
  manualSet.disabled=focused<0||!staged[focused]?.data||!!staged[focused]?.duplicate;
  const selected=staged.filter(x=>x.checked&&x.data&&!x.duplicate).length;
  const unique=staged.filter(x=>x.status==="unique").length;
  const multiple=staged.filter(x=>x.status==="multiple").length;
  const unresolved=staged.filter(x=>["missing","review"].includes(x.status)).length;
  const invalid=staged.filter(x=>!x.data||x.duplicate).length;
  tell("批量匹配预览："+staged.length+" 个文件；唯一候选 "+unique+
   "；多候选 "+multiple+"；未匹配/待核对 "+unresolved+
   "；无效/重复 "+invalid+"；当前选中待确认 "+selected+
   "。此时尚未写入 PDF 原件或关联关系。");
 }
 function loadManualOptions(){
  const old=manualLine.value;
  manualLine.replaceChildren();
  for(const it of items){
   const opt=document.createElement("option");opt.value=it.lineId;opt.textContent=lineName(it);
   manualLine.appendChild(opt);
  }
  if(items.some(it=>it.lineId===old))manualLine.value=old;
 }
 function reset(){
  staged=[];baseline=null;focused=-1;input.value="";table.replaceChildren();
  manualFocus.textContent="未选择待人工指定的 PDF";accept.disabled=true;manualSet.disabled=true;
  tell("请选择一组真实 PDF 并执行匹配预览；所有候选均需核对确认，未自动关联。");
 }
 async function preview(){
  if(busy||!isBuyer())return;
  reset();
  const files=[...input.files];
  if(!files.length){tell("请选择需要匹配的 PDF 文件",true);return}
  if(!items.length){tell("请先导入本次询价的物料清单",true);return}
  if(files.length>MAX_FILES||files.reduce((sum,f)=>sum+f.size,0)>MAX_TOTAL){
   tell("单批最多 100 份 PDF、合计不超过 64MB；请分批导入。",true);return;
  }
  busy=true;analyze.disabled=true;accept.disabled=true;
  try{
   const ws=model();baseline={workspaceId:ws.workspaceId,revision:ws.revision,items:sig()};
   loadManualOptions();staged=[];const seen=new Set();
   for(let i=0;i<files.length;i++){
    const file=files[i],match=matcher.propose(file.name,items);
    let data=null,reason=match.reason,status=match.status,duplicate=false;
    try{
     data=await service.verify(file);
     if(seen.has(data.sha256)){duplicate=true;status="duplicate";reason="本批次已有相同内容；请仅保留一份"}
     seen.add(data.sha256);
    }catch(e){reason=e.message;status="invalid"}
    const lineId=status==="unique"?match.selectedLineId:"";
    const version=match.revision||defaultVersion.value.trim();
    staged.push({file,data,match,status,reason,lineId,version,duplicate,checked:status==="unique"&&!!data});
   }
   render();
  }catch(e){reset();tell("匹配预览失败："+e.message,true)}
  finally{busy=false;analyze.disabled=false}
 }
 async function confirmBatch(){
  if(busy||!staged.length||!baseline||!isBuyer())return;
  const ws=model();
  if(ws.workspaceId!==baseline.workspaceId||ws.revision!==baseline.revision||sig()!==baseline.items){
   tell("询价物料、报价历史或图纸关联已变化；请重新执行匹配预览。",true);return;
  }
  const chosen=staged.filter(r=>r.checked&&r.data&&!r.duplicate);
  if(!chosen.length){tell("请至少勾选一份要关联的有效图纸",true);return}
  const edits=new Map(),written=new Set(),checks=[];
  try{
   for(const r of chosen){
    const it=items.find(x=>x.lineId===r.lineId);
    if(!it)throw Error("文件 "+r.file.name+" 尚未选择有效的物料行");
    if(itemHasAnyQuoteHistory(it.lineId))throw Error("物料 "+it.id+" 已有报价历史，不能修改图纸");
    if(it.drawingStatus==="not_required")throw Error("物料 "+it.id+" 已设置无需图纸，请先更正其图纸要求");
    const revision=r.version.trim();
    if(!revision||revision.length>80)throw Error("文件 "+r.file.name+" 的图纸版本不能为空或超过80字符");
    const before=edits.has(it.lineId)?edits.get(it.lineId):[...service.docsForItem(it)];
    if(before.some(d=>d.sha256===r.data.sha256)){
     throw Error("文件 "+r.file.name+" 已关联到物料 "+it.id+"，请取消勾选重复记录");
    }
    if(before.some(d=>d.name===r.file.name&&d.revision===revision&&d.sha256!==r.data.sha256))
     throw Error("文件 "+r.file.name+" 与已有同名同版本 PDF 内容不同，请先核对版本");
    const known=items.flatMap(x=>service.docsForItem(x)).find(d=>d.sha256===r.data.sha256);
    if(known&&(known.name!==r.file.name||known.revision!==revision))
     throw Error("相同 PDF 内容已有不同名称或版本，请核对 "+r.file.name);
    before.push({id:r.data.sha256.slice(0,16),sha256:r.data.sha256,
      name:r.file.name,revision,size:r.data.size,createdAt:new Date().toISOString()});
    edits.set(it.lineId,before);checks.push(r);
   }
  }catch(e){tell("不能确认关联："+e.message,true);return}
  if(!window.confirm("确认将 "+checks.length+" 份 PDF 关联到 "+edits.size+
      " 条 RFQ 物料？请先核对编码、图号、行号和版本。保存后再用于供应商询价包。"))return;
  busy=true;analyze.disabled=true;accept.disabled=true;manualSet.disabled=true;
  try{
   if(sig()!==baseline.items||model().workspaceId!==baseline.workspaceId)
    throw Error("业务数据发生变化，需重新预览");
   for(const r of checks){
    const stored=await service.store(baseline.workspaceId,r.file,r.version.trim());
    if(stored.sha256!==r.data.sha256)throw Error("PDF 在预览后发生内容变化，已拒绝建立关系");
    written.add(stored.sha256);
   }
   if(sig()!==baseline.items||model().workspaceId!==baseline.workspaceId)
    throw Error("写入原件期间业务数据发生变化，未建立关联");
   for(const [id,docs]of edits){
    const item=items.find(x=>x.lineId===id);
    if(!item)throw Error("目标物料已改变");
    item.drawings=docs;
   }
   window.SRMPilot.noteDrawingChange();
   renderItemList();renderAssignAll();window.SRMDrawUI?.refresh();
   const done=checks.length,affected=edits.size;
   reset();
   tell("已确认 "+done+" 份 PDF 与 "+affected+" 条物料行的关联；原件保存在本机。请点击“保存到本机”提交业务关系，并另外备份完整资料 ZIP。");
  }catch(e){
   tell("批量导入未完成："+e.message+"。未完成业务关联，原件可能留有未引用副本。",true);
  }finally{busy=false;analyze.disabled=false;render()}
 }
 input.addEventListener("change",()=>{staged=[];baseline=null;focused=-1;table.replaceChildren();accept.disabled=true;
  tell("PDF 文件已选择；请点击“执行匹配预览”，不会自动建立关联。")});
 analyze.addEventListener("click",preview);
 accept.addEventListener("click",confirmBatch);
 clear.addEventListener("click",reset);
 table.addEventListener("change",e=>{
  const el=e.target,i=Number(el.dataset.batchCheck??el.dataset.batchTarget??el.dataset.batchVersion);
  if(!Number.isSafeInteger(i)||i<0||i>=staged.length)return;
  if(el.hasAttribute("data-batch-check"))staged[i].checked=el.checked;
  else if(el.hasAttribute("data-batch-target"))staged[i].lineId=el.value;
  else if(el.hasAttribute("data-batch-version"))staged[i].version=el.value;
  render();
 });
 table.addEventListener("click",e=>{
  const btn=e.target.closest("[data-batch-focus]");if(!btn)return;
  focused=Number(btn.dataset.batchFocus);
  const row=staged[focused];manualFocus.textContent=row?"待指定："+row.file.name:"未选择";
  if(row?.lineId)manualLine.value=row.lineId;
  render();
 });
 manualSet.addEventListener("click",()=>{
  const row=staged[focused];
  if(!row?.data||row.duplicate)return;
  if(!items.some(it=>it.lineId===manualLine.value))return;
  row.lineId=manualLine.value;row.checked=true;
  row.reason="采购员手工指定 RFQ 行（非自动匹配）";
  row.status="manual";render();
 });
 window.SRMBatchDrawUI=Object.freeze({reset,preview});
}
