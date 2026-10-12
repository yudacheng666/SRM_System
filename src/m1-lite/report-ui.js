/* 中文：为采购员提供单一业务单据导出入口，导出前选择供应商及字段。
 * English: Compact buyer-facing export picker for confidential supplier RFQs and internal two-sheet comparison. */
{
 const reportCore=window.SRMReports,reportOpen=document.getElementById("pilotReportOpen");
 const box=document.getElementById("pilotReportPanel");
 const type=document.getElementById("pilotReportType");
 const supplierEl=document.getElementById("pilotReportSupplier");
 const group=document.getElementById("pilotReportSupplierGroup");
 const fieldsBox=document.getElementById("pilotReportFields");
 const exportBtn=document.getElementById("pilotReportDownload");
 const warning=document.getElementById("pilotReportHint");
 function getParticipating(){
  const ws=window.SRMPilot?.snapshot();
  if(!ws)return[];
  const relations=new Map(ws.state.assignments.map(x=>[x.key,new Set(x.values)]));
  return ws.state.suppliers.filter(s=>ws.state.items.some(it=>relations.get(it.lineId)?.has(s.id)));
 }
 function fieldGroup(name,kind){
  const allowed=reportCore.fields[kind];
  return '<fieldset style="border:1px solid #e5e7eb;border-radius:6px;padding:9px;min-width:210px">'+
   '<legend class="small"><b>'+name+'</b></legend>'+
   allowed.map(f=>'<label style="display:inline-flex;align-items:center;gap:4px;min-width:145px;margin:4px 8px 4px 0">'+
    '<input type="checkbox" data-report-group="'+kind+'" data-report-field="'+f.key+'" checked '+
     (f.required?'disabled title="必要的身份/追溯字段，不可取消"':'')+'> '+
    f.name+(f.required?' *':'')+'</label>').join("")+'</fieldset>';
 }
 function render(){
  if(box.style.display==="none")return;
  const candidates=getParticipating();
  const previous=supplierEl.value;
  supplierEl.innerHTML=candidates.map(s=>'<option value="'+escapeHtml(s.id)+'">'+escapeHtml(s.name)+' ('+escapeHtml(s.id)+')</option>').join("");
  if(candidates.some(x=>x.id===previous))supplierEl.value=previous;
  const isComparison=type.value==="comparison";
  document.getElementById("pilotReportSinglePicker").style.display=isComparison?"none":"flex";
  document.getElementById("pilotReportMultiPicker").style.display=isComparison?"block":"none";
  const selected=new Set([...group.querySelectorAll("[data-report-supplier]:checked")].map(x=>x.value));
  group.innerHTML=candidates.map(s=>'<label class="chip" style="margin:4px">'+
   '<input type="checkbox" data-report-supplier="'+escapeHtml(s.id)+'" value="'+escapeHtml(s.id)+'" '+
    (selected.has(s.id)?'checked':'')+'> '+escapeHtml(s.name)+' ('+escapeHtml(s.id)+')</label>').join("");
  fieldsBox.innerHTML=isComparison?
   fieldGroup("比价汇总列","summary")+fieldGroup("报价议价明细列","history"):
   fieldGroup("供应商询价单列","rfq");
  warning.textContent=isComparison?
   "仅内部使用：先勾选至少两家供应商。金额只对共同有效报价行比较；草稿不会参与比价，但会在议价明细中清楚标注。":
   "供应商专用：仅导出分配给这家供应商的物料与空白报价列，不含其他供应商报价、内部选择和比价信息。";
 }
 function escapeHtml(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
 function selected(kind){return [...fieldsBox.querySelectorAll('[data-report-group="'+kind+'"]:checked')].map(x=>x.dataset.reportField)}
 reportOpen.addEventListener("click",()=>{
  if(!window.SRMPilot?.isBuyer())return;
  const showing=box.style.display!=="none";
  box.style.display=showing?"none":"block";
  if(!showing)render();
 });
 type.addEventListener("change",render);
 exportBtn.addEventListener("click",async()=>{
  if(exportBtn.disabled)return;
  exportBtn.disabled=true;warning.textContent="正在核查已保存的询报价记录，并生成 Excel……";
  try{
   const snapshot=await window.SRMPilot.committedWorkspaceForReport();
   let plan;
   if(type.value==="rfq"){
    plan=reportCore.rfq(snapshot,supplierEl.value,selected("rfq"));
   }else{
    const ids=[...group.querySelectorAll("[data-report-supplier]:checked")].map(x=>x.value);
    plan=reportCore.comparison(snapshot,ids,selected("summary"),selected("history"));
   }
   const blob=window.SRMExcel.create(plan.sheets);
   const url=URL.createObjectURL(blob),link=document.createElement("a");
   link.href=url;link.download=plan.filename;
   document.body.appendChild(link);
   try{link.click()}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
   const msg=plan.kind==="rfq"?
     "已发起供应商询价 Excel 下载："+plan.items+" 条分配物料；请核查下载目录。":
     "已发起内部比价议价 Excel 下载："+plan.totalItems+" 项、共同有效报价 "+plan.commonCount+
      " 项；非共同范围不作供应商整单排名。";
   warning.textContent=msg;
   window.SRMPilot.reportMessage(msg);
  }catch(e){
   const msg="不能导出："+e.message;
   warning.textContent=msg;window.SRMPilot.reportMessage(msg,true);
  }finally{exportBtn.disabled=false}
 });
}