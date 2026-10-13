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
 const batchBtn=document.getElementById("pilotReportDownloadAll");
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
  batchBtn.style.display=isComparison?"none":"inline-flex";
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
   "供应商专用：仅导出分配给这家供应商的物料与空白报价列，不含其他供应商报价、内部选择和比价信息。全部导出 ZIP 仅供采购员内部拆分，切勿直接发送整个压缩包给供应商。";
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
 // 中文：参与供应商逐家产生独立询价表，再整体打包；不包含其他供方及内部比价字段。
 // English: Each participating supplier receives its own confidential XLSX in one ZIP download.
 batchBtn.addEventListener("click",async()=>{
  if(batchBtn.disabled)return;
  batchBtn.disabled=true;exportBtn.disabled=true;
  warning.textContent="正在为本次全部参与供应商生成独立询价 Excel……";
  try{
   const snapshot=await window.SRMPilot.committedWorkspaceForReport();
   const assignment=new Map(snapshot.state.assignments.map(x=>[x.key,new Set(x.values)]));
   const participants=snapshot.state.suppliers.filter(s=>
     snapshot.state.items.some(it=>assignment.get(it.lineId)?.has(s.id)));
   if(!participants.length)throw Error("本次询价没有已分配物料的参与供应商");
   if(participants.length>window.SRMZip.MAX_ENTRIES)
     throw Error("参与供应商数量超过单次 ZIP 限制，请分批导出");
   const chosen=selected("rfq"),entries=[];
   const hasRealDrawing=snapshot.state.items.some(it=>it.drawings?.length);
   let missingCount=0;
   for(const supplier of participants){
    const plan=reportCore.rfq(snapshot,supplier.id,chosen);
    const excel=window.SRMExcel.create(plan.sheets);
    if(hasRealDrawing){
      const packaged=await window.SRMDrawings.packageFor(snapshot,supplier.id,excel,plan.filename);
      missingCount+=packaged.missing.length;
      entries.push({name:"RFQ_"+String(supplier.id).replace(/[^a-zA-Z0-9_-]/g,"_")+".zip",blob:packaged.zip});
    }else entries.push({name:plan.filename,blob:excel});
   }
   if(missingCount&&!confirm("有 "+missingCount+" 条供应商物料分配缺少 PDF 图纸，仍导出已完成部分的独立资料包吗？"))return;
   if(!hasRealDrawing)warning.textContent="尚未关联任何真实 PDF，当前只能导出 XLSX；不得误称为完整图纸询价资料包。";
   const zip=await window.SRMZip.create(entries);
   const safeId=String(snapshot.workspaceId).replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,56);
   const url=URL.createObjectURL(zip),a=document.createElement("a");
   a.href=url;a.download="SRM_全部供应商询价单_"+safeId+".zip";
   document.body.appendChild(a);
   try{a.click()}finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
   const msg="已发起 "+participants.length+" 家供应商独立 "+(hasRealDrawing?"Excel+PDF 资料包":"Excel")+" 的 ZIP 下载"+
     (missingCount?"（缺图分配 "+missingCount+" 条）":"")+"；整包只供内部使用，解压后逐家发送。";
   warning.textContent=msg;window.SRMPilot.reportMessage(msg);
  }catch(e){
   const msg="全部供应商询价单导出失败："+e.message;
   warning.textContent=msg;window.SRMPilot.reportMessage(msg,true);
  }finally{batchBtn.disabled=false;exportBtn.disabled=false}
 });

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
   const excel=window.SRMExcel.create(plan.sheets);
   const withDrawing=plan.kind==="rfq"&&snapshot.state.items.some(it=>it.drawings?.length);
   let blob=excel,filename=plan.filename,missingCount=0;
   if(withDrawing){
     const pack=await window.SRMDrawings.packageFor(snapshot,supplierEl.value,excel,plan.filename);
     missingCount=pack.missing.length;
     if(missingCount&&!confirm("这家供应商有 "+missingCount+" 条物料缺少 PDF，是否仍导出已完成部分？"))return;
     blob=pack.zip;filename=plan.filename.replace(/\.xlsx$/i,"_含图纸.zip");
   }
   const url=URL.createObjectURL(blob),link=document.createElement("a");
   link.href=url;link.download=filename;
   document.body.appendChild(link);
   try{link.click()}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
   const msg=plan.kind==="rfq"?
     "已发起供应商询价 "+(withDrawing?"Excel+PDF ZIP":"Excel")+" 下载："+plan.items+" 条物料"+
       (missingCount?"；缺图 "+missingCount+" 条，详见资料包关联清单":"")+
       (!withDrawing?"；尚未关联真实 PDF，此文件仅有 Excel":"")+"。":
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