/* 中文：M1-Lite 首批正式工作空间、供应商维护、手动保存与自动重新载入。
 * English: Minimal buyer workspace, supplier entry, explicit local save and on-load recovery.
 * 本脚本内嵌在原 M0 主脚本末尾，可访问已存在的业务状态。
 * This source is inlined at the bottom of the existing M0 main script. */
{
  const model=window.M1WorkspaceCore;
  const pilotStatus=document.getElementById("pilotSaveStatus");
  const newBtn=document.getElementById("pilotNewWorkspace");
  const saveBtn=document.getElementById("pilotSaveWorkspace");
  const resumeBtn=document.getElementById("pilotResumeWorkspace");
  const supplierBtn=document.getElementById("pilotAddSupplier");
  const supplierBox=document.getElementById("pilotSupplierFields");
  const erpCounterparty=document.getElementById("pilotCounterpartyCode");
  const erpSupplier=document.getElementById("pilotSupplierCode");
  const erpSupplierName=document.getElementById("pilotSupplierName");
  const badge=document.getElementById("pilotModeBadge");
  const rfqHead=document.getElementById("pilotRfqHead");
  const STORE="workspaces",DB="srm-lite-local-v1",KEY="single";
  let buyerMode=false,workspaceId=null,revision=0,busy=false,dirty=false,localReady=false,blocked=false;
  function status(message,isError=false){
    pilotStatus.textContent=message;
    pilotStatus.className=isError?"small dangertext":"small muted";
  }
  function buttons(){
    saveBtn.disabled=!buyerMode||busy||!localReady;
    supplierBtn.disabled=!buyerMode||busy;
    newBtn.disabled=busy||blocked||!localReady||buyerMode;
    resumeBtn.disabled=busy||!localReady;
    supplierBox.style.display=buyerMode?"flex":"none";
    badge.textContent=buyerMode?"正式工作（本机手动保存）":"演示模式（不保存）";
    rfqHead.textContent=buyerMode?workspaceId:"RFQ-DEMO-001";
    document.getElementById("pilotSubtitle").textContent=buyerMode?
      "正式工作区：沿用 M0 的询价、供应商分配、报价与比价操作；需要手动保存。":"演示模式：包含虚构物料及价格，不能作为正式采购资料。";
    document.getElementById("pilotNotice").textContent=buyerMode?
      "正式工作：操作后请点击“保存到本机”。本机保存不是云端同步或独立备份；同一路径、同浏览器可恢复。":
      "当前是演示模式，所有操作刷新后会丢失。点击“新建空白正式工作”后才能录入并保存实际资料。";
    document.getElementById("pilotFooter").textContent=buyerMode?
      "正式工作可手动保存并下载结构化 JSON 备份；原始邮件/PDF 仍须独立保管，不会同步到服务器。":
      "演示模式不保存，所有展示价格均为虚构数据。";
    document.getElementById("demoExcelImport").disabled=buyerMode;
    document.getElementById("demoQuoteExcel").disabled=buyerMode;
    document.getElementById("demoMatchUpdate").disabled=buyerMode;
    updateBackupButtons();
  }
  function openDB(){
    return new Promise((resolve,reject)=>{
      if(!window.indexedDB){reject(Error("此浏览器未提供 IndexedDB"));return}
      const req=indexedDB.open(DB,1);
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};
      req.onerror=()=>reject(req.error||Error("数据库无法打开"));
      req.onblocked=()=>reject(Error("其他页面阻止打开数据库，请关闭其他 SRM 页面"));
      req.onsuccess=()=>resolve(req.result);
    });
  }
  async function readSaved(){
    const db=await openDB();
    try{
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).get(KEY);
        let result=null;
        req.onsuccess=()=>{result=req.result||null};
        tx.oncomplete=()=>resolve(result);
        tx.onerror=()=>reject(tx.error||Error("读取失败"));
        tx.onabort=()=>reject(tx.error||Error("读取中止"));
      });
    }finally{db.close()}
  }
  /* 中文：无自动保存；提交时检查本地修订号，防止另一标签页先保存后被覆盖。
   * English: No autosave. Optimistic revision check prevents stale tab overwrite. */
  async function writeSaved(next){
    const db=await openDB();
    try{
      return await new Promise((resolve,reject)=>{
        let why=null,result=null;
        const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE);
        const req=store.get(KEY);
        req.onsuccess=()=>{
          try{
            const old=req.result||null;
            if(old){
              if(old.workspaceId!==next.workspaceId)throw Error("已存在另一份正式工作；为防止覆盖，不能直接保存。请先恢复原工作。");
              if(old.revision!==revision)throw Error("本机记录已在其他窗口更新。请先恢复，不要覆盖新记录。");
              // 中文：每个已确认轮次的全部结构内容必须与本机旧版一致。
              // English: Confirmed quotes in the saved baseline must remain byte-for-byte unchanged.
              const key=r=>[r.supplierId,r.roundNo,r.revisionNo].join("|");
              for(const prior of old.state.quoteRounds.filter(r=>r.status==="confirmed")){
                const current=next.state.quoteRounds.find(r=>key(r)===key(prior));
                if(!current||JSON.stringify(current)!==JSON.stringify(prior))throw Error("已确认的报价历史发生变化，已拒绝覆盖原记录。");
              }
            }else if(revision!==0)throw Error("存储状态发生变化，保存已取消。");
            store.put(next,KEY);result=next.revision;
          }catch(e){why=e;tx.abort()}
        };
        tx.oncomplete=()=>resolve(result);
        tx.onerror=()=>reject(why||tx.error||Error("保存失败"));
        tx.onabort=()=>reject(why||tx.error||Error("保存已取消"));
      });
    }finally{db.close()}
  }
  function readState(){
    return model.captureM0({
      workspaceId,origin:"buyer",sourceDataKind:"buyer",revision,
      state:{items,suppliers,assignments,quoteRounds,awards,awardReasons,manualAwards,awardReviewIds,
        supplierPool:rfqSupplierPool,selectedCompareSuppliers,customFields,lineSeq,createdSeq,quoteComparisonMode}
    });
  }
  function resetUI(){
    itemManageSel.clear();assignSel.clear();supplierPickerSel.clear();rangeAnchors.clear();
    pendingImportRows=[];quoteImportPreviewRows=[];itemPage=0;quotePage=0;
    clearPastePreview.click();clearQuoteImportPreview();
    refreshFieldControls();quoteSupplierOptions();
    renderItemList();renderAssignAll();renderQuotes();
  }
  function applyWorkspace(ws){
    // 中文：先用纯模型完整校验，再一次性替换页面当前的可变集合。
    // English: Validate with pure domain model before replacing mutable UI structures.
    const data=model.hydrate(ws),s=data.state;
    items.splice(0,items.length,...s.items);
    suppliers.splice(0,suppliers.length,...s.suppliers);
    assignments.clear();for(const [k,v] of s.assignments)assignments.set(k,v);
    quoteRounds.splice(0,quoteRounds.length,...s.quoteRounds);
    awards.clear();for(const [k,v] of s.awards)awards.set(k,v);
    awardReasons.clear();for(const [k,v] of s.awardReasons)awardReasons.set(k,v);
    manualAwards.clear();for(const x of s.manualAwards)manualAwards.add(x);
    awardReviewIds.clear();for(const x of s.awardReviewIds)awardReviewIds.add(x);
    rfqSupplierPool.clear();for(const x of s.supplierPool)rfqSupplierPool.add(x);
    selectedCompareSuppliers.clear();for(const x of s.selectedCompareSuppliers)selectedCompareSuppliers.add(x);
    customFields.splice(0,customFields.length,...s.customFields);
    lineSeq=s.lineSeq;createdSeq=s.createdSeq;quoteComparisonMode="returned";
    workspaceId=data.workspaceId;revision=data.revision;buyerMode=true;dirty=false;
    buttons();resetUI();
  }
  function beginBuyer(){
    if(!localReady){status("浏览器数据库不可用，不能创建需要保存的工作。",true);return}
    if(buyerMode){status("已经在正式工作区。",true);return}
    // 中文：禁止覆盖已有正式工作，这一小批尚未提供完整备份。
    // English: Until backup is available, starting a new workspace cannot replace an existing one.
    busy=true;buttons();
    readSaved().then(existing=>{
      if(existing){blocked=false;status("本机已有保存记录；请点击“恢复本机记录”，不能用新工作覆盖。",true);return}
      if(!confirm("开始空白正式工作？演示数据将从本页清除。请在操作后先保存到本机，再下载 JSON 备份。"))return;
      applyWorkspace(model.createEmptyWorkspace("RFQ-"+Date.now()));
      dirty=true;status("已开始空白正式工作，当前尚未保存。请先添加物料和供应商，操作后点击“保存到本机”。");
    }).catch(e=>status("不能开始正式工作："+e.message,true)).finally(()=>{busy=false;buttons()});
  }
  async function recover(){
    if(busy)return;
    busy=true;buttons();
    try{
      const saved=await readSaved();
      if(!saved){status("没有找到已保存的正式工作；可点击“新建空白正式工作”。");return}
      model.validate(saved);
      if(saved.origin!=="buyer")throw Error("禁止从演示数据恢复正式工作");
      if(buyerMode&&dirty&&!confirm("当前有未保存的修改，恢复将放弃这些修改。是否继续？"))return;
      applyWorkspace(saved);
      status("已从本机恢复："+workspaceId+"（保存版本 "+revision+"）。这是本机记录，不等于已完成文件备份。");
    }catch(e){blocked=true;status("恢复失败，已停止新建/覆盖。请保留当前浏览器数据："+e.message,true)}
    finally{busy=false;buttons()}
  }
  async function save(){
    if(!buyerMode||busy)return;
    busy=true;buttons();status("正在保存，请勿关闭页面……");
    try{
      const current=readState();
      const next={...current,revision:revision+1};
      model.validate(next);
      const newRev=await writeSaved(next);
      revision=newRev;dirty=false;
      status("已保存到本机（版本 "+revision+"）。关闭并在同一浏览器、同一路径重新打开可恢复；尚未进行文件备份。");
    }catch(e){dirty=true;status("保存失败，当前更改未确认写入："+e.message,true)}
    finally{busy=false;buttons()}
  }
  function addSupplier(){
    if(!buyerMode)return;
    const cp=erpCounterparty.value.trim(),code=(erpSupplier.value.trim()||cp),name=erpSupplierName.value.trim();
    if(!cp||!code||!name){status("请填写往来单位编码、供应商编码及往来单位名称。",true);return}
    if(suppliers.some(s=>s.id===code)){status("供应商编码已存在，请使用不同编码。",true);return}
    if(suppliers.some(s=>s.counterpartyCode===cp)){status("该往来单位已有供应商身份，不能重复添加。",true);return}
    suppliers.push({id:code,counterpartyCode:cp,supplierCode:code,name,roles:["supplier"],reason:"本次手工添加"});
    rfqSupplierPool.add(code);
    erpCounterparty.value=erpSupplier.value=erpSupplierName.value="";
    dirty=true;status("已添加供应商："+name+"；尚未保存到本机。");
    quoteSupplierOptions();renderAssignAll();renderQuotes();
  }
  document.addEventListener("click",e=>{
    if(!buyerMode||busy)return;
    // 中文：保守提示“尚未保存”，不自动写数据库；过滤工具按钮不代表业务已写入。
    // English: Dirty indicator errs on the safe side; UI events do not automatically persist.
    if(e.target.closest("#pilotControls"))return;
    dirty=true;status("工作内容可能有未保存修改，请完成操作后点击“保存到本机”。");
  },true);
  document.addEventListener("input",e=>{
    if(!buyerMode||busy||e.target.closest("#pilotControls"))return;
    dirty=true;status("有未保存的输入；请完成操作后点击“保存到本机”。");
  },true);
  newBtn.addEventListener("click",beginBuyer);
  saveBtn.addEventListener("click",save);
  resumeBtn.addEventListener("click",recover);
  supplierBtn.addEventListener("click",addSupplier);
  buttons();
  // 中文：页面每次打开检查本机已有工作；有就恢复，没记录则保留 M0 演示视图。
  // English: Restore a saved buyer workspace on open, otherwise leave the demo clearly labeled.
  (async()=>{
    try{
      await openDB().then(db=>db.close());
      localReady=true;buttons();
      const saved=await readSaved();
      if(saved){model.validate(saved);if(saved.origin!=="buyer")throw Error("本机记录不是正式工作");applyWorkspace(saved);status("已自动恢复本机正式工作："+workspaceId+"（版本 "+revision+"）。未进行独立备份。")}
      else status("目前为演示模式；点击“新建空白正式工作”才能开始真实工作。正式工作需主动点击保存。");
    }catch(e){blocked=true;localReady=false;status("本机保存不可用或记录异常："+e.message+"。不要使用真实采购资料。",true)}
    finally{buttons()}
  })();
  window.SRMPilot=Object.freeze({snapshot:()=>buyerMode?readState():null,
    isBuyer:()=>buyerMode,revision:()=>revision,dirty:()=>dirty,
    save,recover,beginBuyer});
}