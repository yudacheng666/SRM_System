/* 中文：SRM-Lite 第二批真 XLSX 单文件桥接。工作簿读取使用内嵌 Apache-2.0 SheetJS CE，所有业务校验继续走 M0/M1 原有流程。
 * English: Offline real XLSX I/O for current materials, counterparties and one supplier quote round.
 * Excel 只是工作表，不代替本机 JSON 业务备份。 / XLSX export is not a replacement for JSON backup.
 */
{
  "use strict";
  const xl=window.XLSX;
  const MAX_SIZE=8*1024*1024,MAX_ROWS=6000,MAX_COLS=80;
  const supFile=document.getElementById("pilotSupplierExcelFile");
  const supConfirm=document.getElementById("pilotSupplierExcelConfirm");
  const supPreview=document.getElementById("pilotSupplierExcelPreview");
  const statusText=document.getElementById("pilotExcelStatus");
  let candidateSuppliers=[];
  function msg(value,error=false){statusText.textContent=value;statusText.className=error?"small dangertext":"small muted";}
  function assertXlsxReady(){if(!xl||!xl.read||!xl.write||!xl.utils)throw Error("Excel 组件未加载；请重新下载完整离线 HTML。")}
  function excelName(value){return String(value||"SRM").replace(/[\\/:*?"<>|\u0000-\u001F]/g,"_").slice(0,70)}
  function buyerRequired(){if(!window.SRMPilot?.isBuyer())throw Error("请先新建空白正式工作；演示数据不允许导出为业务 Excel。")}
  function isXlsx(file){return /\.xlsx$/i.test(file.name)}
  async function sheetRows(file){
    assertXlsxReady();
    if(!isXlsx(file))throw Error("仅支持真正的 .xlsx 文件；旧 .xls 请在 Excel 中另存为 .xlsx。");
    if(file.size===0||file.size>MAX_SIZE)throw Error("Excel 文件须为非空且不超过 8MB。");
    let book;
    try{book=xl.read(new Uint8Array(await file.arrayBuffer()),{type:"array",cellDates:false,bookVBA:false,cellFormula:true})}
    catch(e){throw Error("Excel 工作簿无法读取或已损坏："+String(e?.message||e).slice(0,150))}
    if(!book.SheetNames?.length)throw Error("Excel 中没有工作表。");
    if(book.SheetNames.length>20)throw Error("工作表超过 20 张，本版不支持。");
    const ws=book.Sheets[book.SheetNames[0]];
    if(!ws?.["!ref"])throw Error("第 1 张工作表为空，请将数据放在第一张工作表。");
    const rg=xl.utils.decode_range(ws["!ref"]);
    if(rg.e.r-rg.s.r+1>MAX_ROWS||rg.e.c-rg.s.c+1>MAX_COLS)throw Error("工作表超过 6000 行或 80 列，请分批处理。");
    // 中文：公式、外部计算结果可能不是原始报价数据，不自动采信。
    // English: Never import cached formula values as original supplier quotation evidence.
    for(const [key,cell] of Object.entries(ws)){
      if(key[0]==="!")continue;
      if(cell?.f||cell?.t==="e")throw Error("首张工作表含公式或 Excel 错误单元格（"+key+"），请改为粘贴数值后再导入。");
    }
    const rows=xl.utils.sheet_to_json(ws,{header:1,raw:false,defval:"",blankrows:false});
    if(!rows.length)throw Error("首张工作表没有有效表头。");
    return {rows:rows.map(r=>r.map(v=>String(v??""))),sheet:book.SheetNames[0],sheets:book.SheetNames.length};
  }
  function csvFromRows(rows){
    // 中文：统一交给既有 CSV/粘贴解析器，保留其表头别名、引用校验及批量预览。
    // English: Reuse the existing header-based import and quote-preview validation.
    return rows.map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join("\t")).join("\n");
  }
  function clearSupplierPreview(){
    candidateSuppliers=[];supConfirm.disabled=true;supPreview.style.display="none";supPreview.textContent="";
  }
  async function importItemsXlsx(file){
    // 中文：错误文件不会沿用上次预览或捏造演示行。
    // English: A failed XLSX import leaves no stale or synthetic preview.
    clearPastePreview.click();itemFileFeedback.textContent="";
    try{
      const {rows,sheet,sheets}=await sheetRows(file),parsed=parseItemRows(csvFromRows(rows));
      if(parsed._headerErrors?.length)throw Error(parsed._headerErrors.join("；"));
      if(parsed.length===0)throw Error("Excel 没有可用物料行。");
      setImportPreview(parsed,file.name+" · 工作表："+sheet+" · 真实 Excel 预览");
      itemFileFeedback.textContent="已实际读取第 1 张工作表“"+sheet+"”（共 "+sheets+" 张），请检查预览和错误行后确认。";
    }catch(e){itemFileFeedback.textContent="Excel 未导入："+e.message;alert(itemFileFeedback.textContent)}
    finally{importFile.value=""}
  }
  async function importQuotesXlsx(file){
    clearQuoteImportPreview();quoteFileFeedback.textContent="";
    try{
      const {rows,sheet,sheets}=await sheetRows(file),headers=rows[0]||[];
      if(!quoteImportSupplier.value)throw Error("请先选择报价供应商。");
      const idx=headers.indexOf("供应商编码"),ri=headers.indexOf("报价轮次"),rv=headers.indexOf("报价版本");
      const sid=quoteImportSupplier.value,round=currentQuoteRound();
      if(!round||round.status==="confirmed")throw Error("当前轮次已确认，请创建报价新版本后导入。");
      for(const row of rows.slice(1)){
        if(idx>=0&&row[idx]&&row[idx]!==sid)throw Error("文件供应商编码与当前选择不符，禁止混入其他供应商报价。");
        if(ri>=0&&row[ri]&&Number(row[ri])!==round.roundNo)throw Error("文件报价轮次与当前选择不符。");
        if(rv>=0&&row[rv]&&Number(row[rv])!==round.revisionNo)throw Error("文件报价版本与当前选择不符。");
      }
      const t=headers.indexOf("整轮商务备注");
      if(t>=0){
        const terms=[...new Set(rows.slice(1).map(r=>String(r[t]||"").trim()).filter(Boolean))];
        if(terms.length>1)throw Error("同份 Excel 存在相互矛盾的整轮商务备注，请先核实。");
        if(terms[0]){
          if(terms[0].length>4000)throw Error("整轮商务备注超过 4000 字。");
          quoteTermsNote.value=terms[0];quoteTermsNote.dispatchEvent(new Event("input",{bubbles:true}));
        }
      }
      const parsed=parseQuoteRows(csvFromRows(rows));
      if(parsed._headerErrors?.length)throw Error(parsed._headerErrors.join("；"));
      if(parsed.length===0)throw Error("Excel 中没有报价记录。");
      showQuotePreview(parsed);
      quoteFileFeedback.textContent="已读取 Excel 第一张工作表“"+sheet+"”（共 "+sheets+" 张）；请核对漏报、价格和备注后再写入。";
    }catch(e){quoteFileFeedback.textContent="Excel 未导入："+e.message;alert(quoteFileFeedback.textContent)}
    finally{quoteImportFile.value=""}
  }
  function parseSuppliers(text){
    const table=parseHeaderTable(text,["往来单位编码"]);
    if(table.errors.length)throw Error(table.errors.join("；"));
    if(table.rows.length>2000)throw Error("一次最多导入 2000 家供应商。");
    if(!table.headers.some(h=>["往来单位名称","供应商名称","名称"].includes(h)))throw Error("缺少“往来单位名称”表头。");
    const existingIds=new Set(suppliers.map(s=>s.id)),existingCP=new Set(suppliers.map(s=>s.counterpartyCode).filter(Boolean));
    const added=[],issues=[];
    for(const {data,rowNo} of table.rows){
      const cp=String(findHeaderValue(data,["往来单位编码"])||"").trim();
      const code=String(findHeaderValue(data,["供应商编码"])||cp).trim();
      const name=String(findHeaderValue(data,["往来单位名称","供应商名称","名称"])||"").trim();
      const errors=[];
      if(!cp||!code||!name)errors.push("往来单位编码、供应商编码或名称为空");
      if(cp.length>100||code.length>100||name.length>250)errors.push("编码或名称过长");
      if(existingIds.has(code)||existingCP.has(cp))errors.push("供应商编码或往来单位编码重复");
      if(errors.length)issues.push("第 "+rowNo+" 行："+errors.join("，"));
      else{added.push({id:code,counterpartyCode:cp,supplierCode:code,name,roles:["supplier"],reason:"Excel/CSV 导入"});existingIds.add(code);existingCP.add(cp)}
    }
    if(issues.length)throw Error(issues.slice(0,8).join("；")+(issues.length>8?" 等 "+issues.length+" 个异常":""));
    if(!added.length)throw Error("文件中没有可导入的供应商。");
    return added;
  }
  async function importSuppliers(){
    clearSupplierPreview();
    const file=supFile.files?.[0];if(!file)return;
    try{
      buyerRequired();
      let content,where;
      if(isXlsx(file)){const data=await sheetRows(file);content=csvFromRows(data.rows);where="工作表“"+data.sheet+"”"}
      else if(/\.(csv|txt)$/i.test(file.name)){
        if(file.size>MAX_SIZE)throw Error("文件超过 8MB");
        content=await file.text();where="CSV/TXT";
      }else throw Error("仅支持 .xlsx、UTF-8 CSV/TXT；.xls 暂不支持。");
      const parsed=parseSuppliers(content);
      candidateSuppliers=parsed;supPreview.style.display="block";
      supPreview.textContent=where+" · 可导入 "+parsed.length+" 家供应商："+parsed.slice(0,6).map(s=>s.supplierCode+" "+s.name).join("，")+(parsed.length>6?"……":"")+"\n请确认后点击“确认导入供应商”，不会自动覆盖现有单位。";
      supConfirm.disabled=false;msg("已预览 "+parsed.length+" 家供应商。请核对后确认，不会立即保存到本机。");
    }catch(e){clearSupplierPreview();msg("供应商文件未导入："+e.message,true)}
    finally{supFile.value=""}
  }
  function confirmSuppliers(){
    try{
      buyerRequired();
      if(!candidateSuppliers.length)return;
      // 中文：提交前重新校验原文件行和现有供应商，不允许部分导入。
      // English: Atomic preview revalidation; no silent partial import.
      const old=new Set(suppliers.map(s=>s.id)),oldcp=new Set(suppliers.map(s=>s.counterpartyCode).filter(Boolean));
      for(const row of candidateSuppliers)if(old.has(row.id)||oldcp.has(row.counterpartyCode))throw Error("导入预览后供应商已有变化，请重新选择文件核对。");
      for(const row of candidateSuppliers){suppliers.push(row);rfqSupplierPool.add(row.id)}
      const count=candidateSuppliers.length;clearSupplierPreview();
      quoteSupplierOptions();renderAssignAll();renderQuotes();
      window.SRMPilot.markDirty("已导入 "+count+" 家供应商；请点击“保存到本机”。");
      msg("已加入 "+count+" 家供应商，尚未写入本机数据库。");
    }catch(e){clearSupplierPreview();msg("供应商导入失败："+e.message,true)}
  }
  function exportAoa(rows,label){
    assertXlsxReady();buyerRequired();
    const book=xl.utils.book_new(),sheet=xl.utils.aoa_to_sheet(rows);
    // 中文：编码及备注始终作为文本单元格写入，不将用户内容变成公式。
    // English: Force user content to stored text rather than executable Excel formulas.
    for(const key of Object.keys(sheet)){
      if(key[0]==="!")continue;
      const cell=sheet[key];if(typeof cell.v==="string"){cell.t="s";delete cell.f}
    }
    sheet["!cols"]=rows[0].map((_,i)=>({wch:i===0?22:22}));
    xl.utils.book_append_sheet(book,sheet,label.slice(0,31));
    const bytes=xl.write(book,{bookType:"xlsx",type:"array",compression:true});
    const blob=new Blob([bytes],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=excelName(window.SRMPilot.snapshot()?.workspaceId)+"_"+excelName(label)+".xlsx";
    document.body.appendChild(link);
    try{link.click()}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
    msg("已发起真实 .xlsx 文件下载，请在下载文件夹核实。Excel 不代替“保存到本机”或 JSON 备份。");
  }
  function exportItems(){
    const head=["RFQ Line ID","存货编码","存货名称","所属类别","询价数量","询价单位"];
    exportAoa([head,...items.map(it=>[it.lineId,it.id,it.name,it.cat||"",it.qty,it.unit])],"物料数据");
  }
  function exportSuppliers(){
    exportAoa([["往来单位编码","供应商编码","往来单位名称"],...suppliers.map(s=>[s.counterpartyCode||"",s.supplierCode||s.id,s.name])],"供应商数据");
  }
  function tierPrice(line){
    return line.tiers?.length?line.tiers.map(t=>t.min+(t.max==null?"+":"-"+t.max)+":"+t.price).join("|"):
      line.price==null?"":line.price;
  }
  function exportQuoteRound(){
    const round=currentQuoteRound();if(!round)throw Error("请先选择供应商和报价轮次。");
    if(!window.SRMPilot?.isBuyer())throw Error("仅正式工作可导出真实报价。");
    const sup=suppliers.find(s=>s.id===round.supplierId)||{};
    const head=["供应商编码","往来单位编码","报价轮次","报价版本","RFQ Line ID","存货编码","存货名称","询价数量","询价单位","报价单价","交期","MOQ","报价状态","物料备注","整轮商务备注","报价来源凭证说明"];
    const data=round.lines.map(l=>{
      const it=items.find(x=>x.lineId===l.lineId);
      return [round.supplierId,sup.counterpartyCode||"",round.roundNo,round.revisionNo,l.lineId,it?.id||l.itemId||"",it?.name||"",it?.qty||"",it?.unit||"",tierPrice(l),l.lead??"",l.moq??"",l.status,l.remark||"",round.termsNote||"",round.evidenceNote||""]
    });
    exportAoa([head,...data],"供应商本轮报价");
  }
  supFile.addEventListener("change",importSuppliers);
  supConfirm.addEventListener("click",confirmSuppliers);
  document.getElementById("pilotExportItemsExcel").addEventListener("click",()=>{try{exportItems()}catch(e){msg(e.message,true)}});
  document.getElementById("pilotExportSuppliersExcel").addEventListener("click",()=>{try{exportSuppliers()}catch(e){msg(e.message,true)}});
  document.getElementById("pilotExportQuoteExcel").addEventListener("click",()=>{try{exportQuoteRound()}catch(e){quoteFileFeedback.textContent="导出失败："+e.message}});
  window.SRMExcel=Object.freeze({sheetRows,parseSuppliers,importItemsXlsx,importQuotesXlsx,exportItems,exportSuppliers,exportQuoteRound});
}
