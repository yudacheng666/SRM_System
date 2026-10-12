/* 中文：在原有导入预览与字段校验上接入 Excel 工作表，不绕开报价确认和历史锁定。
 * English: Bridge real XLSX workbooks to existing item/quote previews and confirmed-history controls. */
{
 const excel=window.SRMExcel;
 const fileError=(target,message)=>{target.textContent=message;alert(message)};
 const allowed=(file)=>file&&/\.xlsx$/i.test(file.name)&&file.size>0&&file.size<=excel.MAX_INPUT;
 const source=(workbook,file)=>file.name+" · 工作表："+workbook.sheetName+" · 真实 XLSX";
 const csvItemImport=importFile.onchange;
 importFile.accept=".xlsx,.csv,.txt";
 importFile.closest(".intakeBox").querySelector(".small.muted").textContent=
  "直接导入 Excel .xlsx / CSV / TXT。请使用含有“存货编码、存货名称、询价数量、询价单位”的单张数据表；旧表头仍兼容。原始 .xls 暂不支持。";
 importFile.onchange=async function(){
  const file=this.files?.[0];if(!file)return;
  if(!/\.xlsx$/i.test(file.name)){return csvItemImport.call(this)}
  clearPastePreview.click();itemFileFeedback.textContent="";
  if(!allowed(file)){fileError(itemFileFeedback,"只允许不超过 12MB 的真实 XLSX 文件，未导入任何物料。");this.value="";return}
  try{
   const wb=await excel.read(await file.arrayBuffer(),["存货编码","物料编码"]);
   const rows=parseItemRows(wb.tsv);
   if(rows._headerErrors?.length)throw Error(rows._headerErrors.join("；"));
   setImportPreview(rows,source(wb,file));
  }catch(e){itemFileFeedback.textContent="Excel 读取失败，没有导入任何物料："+e.message;alert(itemFileFeedback.textContent)}
  this.value="";
 };
 const csvQuoteImport=quoteImportFile.onchange;
 quoteImportFile.accept=".xlsx,.csv,.txt";
 quoteImportFile.closest(".intakeBox").querySelector(".small.muted").textContent=
  "支持真实 Excel .xlsx、CSV、TXT 和复制粘贴。必须含 RFQ Line ID 或存货编码；只处理当前选中的供应商和报价轮次。";
 quoteImportFile.onchange=async function(){
  const file=this.files?.[0];if(!file)return;
  if(!/\.xlsx$/i.test(file.name)){return csvQuoteImport.call(this)}
  clearQuoteImportPreview();quoteFileFeedback.textContent="";
  if(!allowed(file)){fileError(quoteFileFeedback,"只允许不超过 12MB 的真实 XLSX 文件，未导入任何报价。");this.value="";return}
  try{
   const wb=await excel.read(await file.arrayBuffer(),["RFQ Line ID","存货编码","物料编码"]);
   const rows=parseQuoteRows(wb.tsv);
   if(rows._headerErrors?.length)throw Error(rows._headerErrors.join("；"));
   if(!rows.length)throw Error("Excel 中没有报价明细");
   showQuotePreview(rows);
   quoteFileFeedback.textContent="来自 "+source(wb,file)+"；请核对报价后明确点击写入。";
  }catch(e){quoteFileFeedback.textContent="Excel 读取失败，没有写入任何报价："+e.message;alert(quoteFileFeedback.textContent)}
  this.value="";
 };
 const supplierFile=document.getElementById("pilotSupplierExcel");
 const supplierPreview=document.getElementById("pilotSupplierExcelPreview");
 const supplierApply=document.getElementById("pilotImportSupplierConfirm");
 const supplierStatus=document.getElementById("pilotSupplierExcelStatus");
 let staged=null;
 function clearStage(){staged=null;supplierPreview.textContent="";supplierPreview.style.display="none";supplierApply.disabled=true}
 supplierFile.onchange=async function(){
  clearStage();
  const file=this.files?.[0];if(!file)return;
  if(!window.SRMPilot?.isBuyer()){fileError(supplierStatus,"请先新建空白正式工作，演示模式不能导入供应商。");this.value="";return}
  if(!allowed(file)){fileError(supplierStatus,"供应商文件必须是 12MB 以内的真实 .xlsx 文件。");this.value="";return}
  try{
   const wb=await excel.read(await file.arrayBuffer(),["往来单位编码"]);
   const cols=wb.rows[0].map(v=>String(v).trim());
   const cp=cols.indexOf("往来单位编码"),sp=cols.indexOf("供应商编码"),nm=cols.indexOf("往来单位名称");
   if(cp<0||nm<0)throw Error("供应商工作表必须包含往来单位编码、往来单位名称；供应商编码可选");
   const rows=wb.rows.slice(1).map((r,i)=>({counterpartyCode:String(r[cp]||"").trim(),
    supplierCode:String((sp>=0?r[sp]:"")||r[cp]||"").trim(),name:String(r[nm]||"").trim(),_row:i+2}));
   if(!rows.length||rows.length>1000)throw Error("供应商行数须为 1–1000");
   const present=new Set(),cpSet=new Set(),existing=window.SRMPilot.snapshot().state.suppliers;
   for(const row of rows){
    if(!row.counterpartyCode||!row.supplierCode||!row.name)throw Error("第 "+row._row+" 行编码或名称为空");
    if(present.has(row.supplierCode)||cpSet.has(row.counterpartyCode)||
      existing.some(x=>x.id===row.supplierCode||x.counterpartyCode===row.counterpartyCode))
      throw Error("第 "+row._row+" 行供应商或往来单位编码重复");
    present.add(row.supplierCode);cpSet.add(row.counterpartyCode);
   }
   staged=rows;
   supplierPreview.textContent="工作表："+wb.sheetName+"；待新增供应商："+rows.length+" 家\n"+
     rows.slice(0,8).map(r=>r.counterpartyCode+" / "+r.supplierCode+" / "+r.name).join("\n")+
     (rows.length>8?"\n…另有 "+(rows.length-8)+" 家":"");
   supplierPreview.style.display="block";supplierApply.disabled=false;
   supplierStatus.textContent="仅预览，尚未写入供应商。请确认后点击“确认导入供应商”。";
  }catch(e){supplierStatus.textContent="供应商 Excel 校验失败，未写入："+e.message;alert(supplierStatus.textContent)}
  this.value="";
 };
 supplierApply.onclick=()=>{
  if(!staged)return;
  try{
   const count=window.SRMPilot.importSupplierRows(staged);
   supplierStatus.textContent="已新增 "+count+" 家供应商，记得点击“保存到本机”。";
   clearStage();
  }catch(e){supplierStatus.textContent="导入未执行："+e.message;alert(supplierStatus.textContent);clearStage()}
 };
}