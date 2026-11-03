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
  const historyPicker=document.getElementById("pilotHistoryWorkspace");
  const historyBtn=document.getElementById("pilotSwitchWorkspace");
  const supplierBtn=document.getElementById("pilotAddSupplier");
  const exportBtn=document.getElementById("pilotExportBackup");
  const exportAllBtn=document.getElementById("pilotExportBackupAll");
  const exportCompleteBtn=document.getElementById("pilotExportComplete");
  const importCompleteInput=document.getElementById("pilotImportComplete");
  const restoreCompleteBtn=document.getElementById("pilotRestoreComplete");
  const completeInfo=document.getElementById("pilotCompleteStatus");
  let pendingComplete=null;
  const restoreScope=document.getElementById("pilotBulkRestoreScope");
  const restoreSelection=document.getElementById("pilotBulkRestoreSelection");
  const restoreOptions=document.getElementById("pilotBulkRestoreOptions");
  const importInput=document.getElementById("pilotImportBackup");
  const restoreBtn=document.getElementById("pilotRestoreBackup");
  const previewBox=document.getElementById("pilotBackupPreview");
  const backup=window.M1Backup;
  let pendingRestore=null;
  const supplierBox=document.getElementById("pilotSupplierFields");
  const erpCounterparty=document.getElementById("pilotCounterpartyCode");
  const erpSupplier=document.getElementById("pilotSupplierCode");
  const erpSupplierName=document.getElementById("pilotSupplierName");
  const badge=document.getElementById("pilotModeBadge");
  const rfqHead=document.getElementById("pilotRfqHead");
  const STORE="workspaces",DB="srm-lite-local-v1",KEY="single";
  let buyerMode=false,workspaceId=null,revision=0,busy=false,dirty=false,localReady=false,blocked=false;
  // 中文：新询价尚未保存时，记录旧活动询价的版本，防止并发窗口静默覆盖。
  // English: Capture the original active revision until an independent RFQ is first saved.
  let launchBaseline=null,committedActive=false;
  function status(message,isError=false){
    pilotStatus.textContent=message;
    pilotStatus.className=isError?"small dangertext":"small muted";
  }
  function buttons(){
    saveBtn.disabled=!buyerMode||busy||!localReady;
    supplierBtn.disabled=!buyerMode||busy;
    exportBtn.disabled=!buyerMode||busy||!localReady;
    exportAllBtn.disabled=busy||!localReady||!!(buyerMode&&dirty);
    exportCompleteBtn.disabled=busy||!localReady||!!(buyerMode&&dirty);
    importCompleteInput.disabled=busy||!localReady;
    restoreCompleteBtn.disabled=busy||!localReady||!pendingComplete||!!(buyerMode&&dirty);
    document.getElementById("pilotExportExcel").disabled=!buyerMode||busy||!localReady;
    document.getElementById("pilotReportOpen").disabled=!buyerMode||busy||!localReady;
    importInput.disabled=busy||!localReady;
    restoreBtn.disabled=!pendingRestore||busy||!localReady||
      (pendingRestore?.kind!=="bulk"&&buyerMode)||
      (pendingRestore?.kind==="bulk"&&buyerMode&&dirty);
    // 中文：正式工作也允许新建下一笔询价；旧记录将原子归档，绝不清空浏览器存储。
    // English: New RFQs are available after the first one, without deleting browser data.
    newBtn.disabled=busy||blocked||!localReady;
    resumeBtn.disabled=busy||!localReady;
    historyPicker.disabled=busy||!localReady||historyPicker.options.length===0;
    historyBtn.disabled=busy||!localReady||!historyPicker.value;
    supplierBox.style.display=buyerMode?"flex":"none";
    document.getElementById("pilotDrawingPanel").style.display=buyerMode?"block":"none";
    badge.textContent=buyerMode?"正式工作（本机手动保存）":"演示模式（不保存）";
    newBtn.textContent=buyerMode?"新建另一笔空白询价":"新建空白正式工作";
    rfqHead.textContent=buyerMode?workspaceId:"RFQ-DEMO-001";
    document.getElementById("pilotSubtitle").textContent=buyerMode?
      "正式工作区：沿用 M0 的询价、供应商分配、报价与比价操作；需要手动保存。":"演示模式：包含虚构物料及价格，不能作为正式采购资料。";
    document.getElementById("pilotNotice").textContent=buyerMode?
      "正式工作：操作后请点击“保存到本机”。本机保存不是云端同步或独立备份；同一路径、同浏览器可恢复。":
      "当前是演示模式，所有操作刷新后会丢失。点击“新建空白正式工作”后才能录入并保存实际资料。";
    document.getElementById("pilotFooter").textContent=buyerMode?
      "正式工作需手动保存，并可另行下载 JSON 结构化备份；原始邮件/PDF 不在 JSON 中，也不支持服务器同步。":
      "演示模式不保存，所有展示价格均为虚构数据。";
    document.getElementById("demoExcelImport").disabled=buyerMode;
    document.getElementById("demoQuoteExcel").disabled=buyerMode;
    document.getElementById("demoMatchUpdate").disabled=buyerMode;
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
  // 中文：沿用既有 single 活动记录；历史询价保存在同一对象库的 archive:<workspaceId>。
  // English: Keep the legacy 'single' active record; retain older RFQs as archived key-value records.
  function sameBaseline(current,base){
    return base===null?!current:!!current&&current.workspaceId===base.workspaceId&&current.revision===base.revision;
  }
  async function readArchived(){
    const db=await openDB();
    try{
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE,"readonly"),result=[];
        const req=tx.objectStore(STORE).openCursor();
        req.onsuccess=()=>{
          const cursor=req.result;
          if(!cursor)return;
          if(typeof cursor.key==="string"&&cursor.key.startsWith("archive:")){
            const ws=cursor.value;
            model.validate(ws);
            if(ws.origin!=="buyer"||cursor.key!=="archive:"+ws.workspaceId)
              throw Error("历史询价索引异常");
            result.push(ws);
          }
          cursor.continue();
        };
        req.onerror=()=>reject(req.error||Error("读取历史询价失败"));
        tx.oncomplete=()=>resolve(result.sort((a,b)=>b.workspaceId.localeCompare(a.workspaceId)));
        tx.onerror=()=>reject(tx.error||Error("读取历史询价失败"));
        tx.onabort=()=>reject(tx.error||Error("历史询价读取中止"));
      });
    }finally{db.close()}
  }
  async function refreshHistory(){
    if(!localReady)return;
    const savedId=historyPicker.value,history=await readArchived();
    historyPicker.replaceChildren();
    const placeholder=document.createElement("option");
    placeholder.value="";placeholder.textContent="选择已保存的历史询价";
    historyPicker.appendChild(placeholder);
    for(const ws of history){
      const option=document.createElement("option");
      option.value=ws.workspaceId;
      option.textContent=ws.workspaceId+" · "+ws.state.items.length+" 项 · 第 "+ws.revision+" 版";
      historyPicker.appendChild(option);
    }
    if(history.some(x=>x.workspaceId===savedId))historyPicker.value=savedId;
    buttons();
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
            if(old&&old.workspaceId!==next.workspaceId){
              // 中文：新业务首次保存才切换活动记录；同一事务先归档旧记录，后保存新记录。
              // English: Archive the old active RFQ atomically with the first save of the new RFQ.
              if(revision!==0||!launchBaseline||!sameBaseline(old,launchBaseline))
                throw Error("另一个窗口已修改活动询价，已拒绝覆盖。请恢复本机最新记录。");
              model.validate(old);
              const archiveReq=store.get("archive:"+old.workspaceId);
              archiveReq.onsuccess=()=>{
                try{
                  const existing=archiveReq.result;
                  if(existing&&existing.revision>old.revision)throw Error("历史记录比当前活动记录更新，禁止覆盖");
                  const nextArchive=store.get("archive:"+next.workspaceId);
                  nextArchive.onsuccess=()=>{
                    try{
                      if(nextArchive.result)throw Error("新询价编号与历史记录重复，未保存");
                      store.put(old,"archive:"+old.workspaceId);
                      store.put(next,KEY);
                      result=next.revision;
                    }catch(e){why=e;tx.abort()}
                  };
                }catch(e){why=e;tx.abort()}
              };
              return;
            }
            if(old){
              if(old.revision!==revision)throw Error("本机记录已在其他窗口更新。请先恢复，不要覆盖新记录。");
              // 中文：每个已确认轮次的全部结构内容必须与本机旧版一致。
              // English: Confirmed quotes in the saved baseline must remain byte-for-byte unchanged.
              const key=r=>[r.supplierId,r.roundNo,r.revisionNo].join("|");
              for(const prior of old.state.quoteRounds.filter(r=>r.status==="confirmed")){
                const current=next.state.quoteRounds.find(r=>key(r)===key(prior));
                if(!current||JSON.stringify(current)!==JSON.stringify(prior))throw Error("已确认的报价历史发生变化，已拒绝覆盖原记录。");
              }
            }else if(revision!==0||launchBaseline)throw Error("存储状态发生变化，保存已取消。");
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
    workspaceId=data.workspaceId;revision=data.revision;buyerMode=true;dirty=false;launchBaseline=null;committedActive=true;
    buttons();resetUI();
    window.SRMDrawUI?.refresh();
    // 中文：重绘内部会触发旧页面的清空预览 click；加载快照本身不应视为用户修改。
    // English: UI reset can emit synthetic clicks, but hydration itself is not an unsaved user edit.
    dirty=false;
  }
  function beginBuyer(){
    if(!localReady||busy||blocked){status("本机存储不可用或正在处理，请先核对当前记录。",true);return}
    // 中文：用户可以反复创建新 RFQ；先明确提示未保存内容会丢失，但旧已保存记录不删除。
    // English: Explicitly warn about unsaved edits; never delete the previously committed RFQ.
    const warning=buyerMode?
      (dirty?"当前工作有未保存的更改，新建会放弃这些更改。已保存的询价会保留在本机。继续？":
        "新建另一笔空白询价？当前已保存的询价会保留，可在“历史询价”中切换。"):
      "开始空白正式工作？演示数据将从本页清除。请手动保存，并定期另行下载 JSON 结构化备份。";
    if(!confirm(warning))return;
    busy=true;buttons();
    readSaved().then(existing=>{
      const expected=launchBaseline||(buyerMode&&committedActive?{workspaceId,revision}:null);
      if(buyerMode&&!sameBaseline(existing,expected))
        throw Error("本机保存已被其他窗口修改。请先点击“恢复本机记录”，防止记录混乱");
      if(existing){model.validate(existing);if(existing.origin!=="buyer")throw Error("活动记录不是正式询价")}
      const fresh=model.createEmptyWorkspace("RFQ-"+Date.now()+"-"+Math.random().toString(36).slice(2,8).toUpperCase());
      applyWorkspace(fresh);
      committedActive=false;
      launchBaseline=existing?{workspaceId:existing.workspaceId,revision:existing.revision}:null;
      dirty=true;
      status("已开始空白正式工作（另一笔独立询价），尚未保存。首次保存后，上一笔已保存的询价将进入“历史询价”；请另备份 JSON。");
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
  // 中文：历史切换在单一读写事务中进行：前活动工作归档，目标历史工作变为活动工作。
  // English: Atomically swap the active RFQ and a selected archived RFQ, preserving both.
  async function switchArchived(){
    const targetId=historyPicker.value;
    if(!targetId||busy||!localReady)return;
    if(buyerMode&&dirty&&!confirm("当前有未保存更改，切换历史询价会放弃这些更改。仍要切换？"))return;
    const expected=launchBaseline||(buyerMode&&committedActive?{workspaceId,revision}:null);
    busy=true;buttons();
    try{
      const db=await openDB();
      let target;
      try{
        target=await new Promise((resolve,reject)=>{
          const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE),key="archive:"+targetId;
          let problem=null,selected=null;
          const abort=e=>{problem=e;tx.abort()};
          const activeReq=store.get(KEY);
          activeReq.onsuccess=()=>{
            try{
              const active=activeReq.result||null;
              if(!sameBaseline(active,expected))throw Error("本机活动询价已被另一窗口更新，拒绝切换");
              const historyReq=store.get(key);
              historyReq.onsuccess=()=>{
                try{
                  selected=historyReq.result;
                  if(!selected||selected.workspaceId!==targetId)throw Error("历史记录不存在或编号不一致");
                  model.validate(selected);
                  if(selected.origin!=="buyer")throw Error("历史记录不是正式工作");
                  if(active){
                    model.validate(active);
                    if(active.workspaceId===targetId)throw Error("不可切换至当前询价");
                    const oldReq=store.get("archive:"+active.workspaceId);
                    oldReq.onsuccess=()=>{
                      try{
                        if(oldReq.result&&oldReq.result.revision>active.revision)
                          throw Error("存在更新的历史记录，拒绝覆盖");
                        store.put(active,"archive:"+active.workspaceId);
                        store.put(selected,KEY);
                        store.delete(key);
                      }catch(e){abort(e)}
                    };
                  }else{
                    store.put(selected,KEY);
                    store.delete(key);
                  }
                }catch(e){abort(e)}
              };
            }catch(e){abort(e)}
          };
          tx.oncomplete=()=>resolve(selected);
          tx.onerror=()=>reject(problem||tx.error||Error("历史切换失败"));
          tx.onabort=()=>reject(problem||tx.error||Error("历史切换已取消"));
        });
      }finally{db.close()}
      applyWorkspace(target);
      await refreshHistory();
      status("已切换到历史询价："+workspaceId+"（保存版本 "+revision+"）。之前的活动询价仍保留在本机。");
    }catch(e){status("切换历史询价失败，原记录未覆盖："+e.message,true)}
    finally{busy=false;buttons()}
  }
  // 中文：PDF 原件已独立落盘，关联关系仍必须经过正式工作保存。
  // English: Uploaded PDF bytes are durable, while links require an explicit workspace commit.
  function noteDrawingChange(){
    if(!buyerMode||busy)throw Error("当前不能编辑正式图纸");
    dirty=true;status("图纸关联已修改，请点击“保存到本机”提交。");
    buttons();
  }
  async function save(){
    if(!buyerMode||busy)return;
    busy=true;buttons();status("正在保存，请勿关闭页面……");
    try{
      const current=readState();
      const next={...current,revision:revision+1};
      model.validate(next);
      const newRev=await writeSaved(next);
      revision=newRev;dirty=false;launchBaseline=null;committedActive=true;
      await refreshHistory();
      status("已保存到本机（版本 "+revision+"）。这不等于文件备份；建议另点“下载结构化备份”并核实下载文件。");
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
  // 中文：供应商 Excel 先在预览中完整校验，再一次性写入本次候选供应商。
  // English: Validate every supplier row before making any in-memory changes.
  function importSupplierRows(rows){
    if(!buyerMode||busy)throw Error("仅正式工作空间可导入供应商");
    if(!Array.isArray(rows)||!rows.length||rows.length>1000)throw Error("供应商行数必须为 1–1000");
    const seenCodes=new Set(),seenCP=new Set();
    const fresh=rows.map(row=>{
      const cp=String(row.counterpartyCode||"").trim(),code=String(row.supplierCode||cp).trim(),name=String(row.name||"").trim();
      if(!cp||!code||!name||cp.length>100||code.length>100||name.length>200)
        throw Error("往来单位编码、供应商编码及往来单位名称必须完整且长度合理");
      if(seenCodes.has(code)||seenCP.has(cp)||suppliers.some(s=>s.id===code||s.counterpartyCode===cp))
        throw Error("文件内或已有工作中存在重复往来单位/供应商编码："+code);
      seenCodes.add(code);seenCP.add(cp);
      return{id:code,counterpartyCode:cp,supplierCode:code,name,roles:["supplier"],reason:"本次 Excel 导入"};
    });
    suppliers.push(...fresh);
    fresh.forEach(s=>rfqSupplierPool.add(s.id));
    dirty=true;
    quoteSupplierOptions();renderAssignAll();renderQuotes();
    status("已导入 "+fresh.length+" 家供应商，尚未保存到本机。");
    return fresh.length;
  }
  async function exportBusinessExcel(){
    if(!buyerMode||busy||!localReady)return;
    if(dirty){status("有尚未保存的内容，请先“保存到本机”再下载 Excel。",true);return}
    busy=true;buttons();
    try{
      const ws=await readSaved();
      if(!ws||ws.workspaceId!==workspaceId||ws.revision!==revision)throw Error("本机记录版本不一致，请先恢复或保存");
      model.validate(ws);
      const st=ws.state;
      const quoted=st.quoteRounds.flatMap(r=>(r.lines||[]).map(q=>{
        const item=st.items.find(it=>it.lineId===q.lineId);
        const tiers=(q.tiers||[]).map(t=>t.min+(t.max==null?"+":"-"+t.max)+":"+t.price).join("|");
        return[r.supplierId,r.roundNo,r.revisionNo,r.status,r.termsNote||"",r.evidenceType||"",r.evidenceNote||"",q.lineId,item?.id||q.itemId||"",q.price,q.lead,q.moq,q.status,q.remark||"",tiers];
      }));
      const excel=window.SRMExcel.create([
        {name:"询价物料",rows:[["RFQ Line ID","存货编码","存货名称","所属类别","询价数量","询价单位"],...st.items.map(it=>[it.lineId,it.id,it.name,it.cat||"",it.qty,it.unit])]},
        {name:"供应商",rows:[["往来单位编码","供应商编码","往来单位名称"],...st.suppliers.map(s=>[s.counterpartyCode||s.id,s.supplierCode||s.id,s.name])]},
        {name:"报价明细",rows:[["供应商编码","报价轮次","报价版本","确认状态","整轮商务备注","报价凭证类型","凭证说明","RFQ Line ID","存货编码","报价单价","交期天数","MOQ","报价状态","物料备注","阶梯报价"],...quoted]}
      ]);
      const url=URL.createObjectURL(excel),link=document.createElement("a");
      link.href=url;link.download="SRM_询比价_业务明细_"+new Date().toISOString().slice(0,10)+".xlsx";
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),30000);
      status("已发起真实 Excel .xlsx 下载（3 个数据表）；请检查下载目录。此文件不是 JSON 完整备份，不包含原始邮件/PDF。");
    }catch(e){status("Excel 导出失败："+e.message,true)}
    finally{busy=false;buttons()}
  }
  // 中文：业务单据只从已保存的正式版本导出，不读取尚未提交的报价草稿。
  // English: Supplier reports read committed buyer snapshots only.
  async function committedWorkspaceForReport(){
    if(!buyerMode||!localReady||busy)throw Error("请先进入可用的正式工作区");
    if(dirty)throw Error("有未保存的修改，请先点击“保存到本机”，成功后再导出单据");
    const saved=await readSaved();
    if(!saved||saved.workspaceId!==workspaceId||saved.revision!==revision)
      throw Error("本机保存版本与当前页面不同，请先恢复最新版本");
    model.validate(saved);
    if(saved.origin!=="buyer")throw Error("禁止导出演示工作数据");
    return saved;
  }
  document.addEventListener("click",e=>{
    if(!buyerMode||busy||!e.isTrusted)return;
    // 中文：程序触发的下载链接等非用户点击不代表业务发生修改；操作按钮中的真实修改仍提示保存。
    // English: Programmatic download clicks must not mark a saved workspace dirty.
    // English: Dirty indicator errs on the safe side; UI events do not automatically persist.
    if(e.target.closest("#pilotControls,#pilotDrawingPanel,#drawingModal,#pilotReportPanel,#rfqPreviewModal,.tabs,[data-drawing]"))return;
    dirty=true;status("工作内容可能有未保存修改，请完成操作后点击“保存到本机”。");
  },true);
  document.addEventListener("input",e=>{
    if(!buyerMode||busy||e.target.closest("#pilotControls"))return;
    dirty=true;status("有未保存的输入；请完成操作后点击“保存到本机”。");
  },true);

  // 中文：文件备份只使用已提交的本机状态；未保存的页面修改不打入备份。
  // English: Export only committed local records; unsaved changes never silently enter a backup.
  async function exportBackup(){
    if(!buyerMode||busy||!localReady)return;
    if(dirty){status("当前有未保存修改，请先点击“保存到本机”，确认保存成功后再下载备份。",true);return}
    busy=true;buttons();
    try{
      const saved=await readSaved();
      if(!saved||saved.workspaceId!==workspaceId||saved.revision!==revision)
        throw Error("本机记录和当前工作版本不一致，请先恢复并重新保存，避免导出旧数据。");
      const text=backup.create(saved);
      const blob=new Blob([text],{type:"application/json;charset=utf-8"});
      const url=URL.createObjectURL(blob),link=document.createElement("a");
      const stamp=new Date().toISOString().slice(0,10).replace(/-/g,"");
      link.href=url;link.download=stamp+"_SRM_询比价_结构化备份_v1.json";
      document.body.appendChild(link);
      try{link.click()}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
      status("已发起结构化 JSON 备份文件下载（保存版本 "+revision+"）。请到下载目录确认文件存在；原始邮件、PDF、截图等不包含在文件中。");
    }catch(e){status("无法导出备份："+e.message,true)}
    finally{busy=false;buttons()}
  }
  // 中文：所有询价只从 IndexedDB 已提交的活动和历史记录导出。
  // English: All-RFQ backups include only committed active and archived records.
  async function exportAllBackup(){
    if(busy||!localReady)return;
    if(buyerMode&&dirty){status("当前询价有尚未保存的更改，请先保存后再备份全部。",true);return}
    busy=true;buttons();
    try{
      const active=await readSaved();
      if(buyerMode&&(!active||active.workspaceId!==workspaceId||active.revision!==revision))
        throw Error("本机活动询价与当前页面版本不一致，不能完整备份");
      const history=await readArchived();
      const records=[...(active?[active]:[]),...history];
      if(!records.length)throw Error("没有已保存的正式询价记录");
      const json=backup.createAll(records);
      const blob=new Blob([json],{type:"application/json;charset=utf-8"});
      const url=URL.createObjectURL(blob),link=document.createElement("a");
      const stamp=new Date().toISOString().slice(0,10).replace(/-/g,"");
      link.href=url;link.download=stamp+"_SRM_全部询价_结构化备份_v1.json";
      document.body.appendChild(link);
      try{link.click()}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
      status("已发起全部 "+records.length+" 笔已保存询价的 JSON 备份下载。请检查下载目录；原始邮件/PDF/截图不在备份中。");
    }catch(e){status("全部询价备份失败，未导出："+e.message,true)}
    finally{busy=false;buttons()}
  }
  // 中文：附件级 ZIP 同时包含所有已提交 RFQ 与原 PDF；若任何 PDF 不可读，整包拒绝输出。
  // English: Complete ZIP includes committed RFQs and verified PDF originals; never silently omit assets.
  async function exportComplete(){
    if(busy||!localReady)return;
    if(buyerMode&&dirty){status("请先保存当前图纸关联和其他修改，再导出完整资料包。",true);return}
    busy=true;buttons();
    try{
      const active=await readSaved();
      if(buyerMode&&(!active||active.workspaceId!==workspaceId||active.revision!==revision))
        throw Error("当前工作版本与已保存记录不一致");
      const archives=await readArchived(),records=[...(active?[active]:[]),...archives];
      if(!records.length)throw Error("本机没有已保存的正式询价");
      const zip=await window.SRMDrawings.completeBackup(records);
      const url=URL.createObjectURL(zip),link=document.createElement("a");
      link.href=url;link.download=new Date().toISOString().slice(0,10).replace(/-/g,"")+"_SRM_全部询价和图纸_完整资料包.zip";
      document.body.appendChild(link);
      try{link.click()}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
      status("已发起 "+records.length+" 笔询价及对应 PDF 原件的完整 ZIP 备份；报价邮件与截图仍需另存。");
    }catch(e){status("完整图纸备份失败，未跳过缺失文件："+e.message,true)}
    finally{busy=false;buttons()}
  }
  async function stageComplete(){
    pendingComplete=null;restoreCompleteBtn.disabled=true;completeInfo.textContent="";
    const file=importCompleteInput.files?.[0];if(!file)return;
    busy=true;buttons();
    try{
      const parsed=await window.SRMDrawings.unpackComplete(file);
      pendingComplete=parsed;
      completeInfo.textContent="完整资料已校验："+parsed.records.length+" 笔询价、"+
        parsed.assets.length+" 个真实 PDF 文件。恢复时若任何编号冲突则整批拒绝，不覆盖旧工作。";
    }catch(e){completeInfo.textContent="完整备份文件校验失败："+e.message}
    finally{busy=false;buttons();importCompleteInput.value=""}
  }
  // 中文：业务快照和 PDF Blob 统一在原工作库的同一事务写入，拒绝编号冲突。
  // English: Import complete archives in a single transaction for both workspaces and PDF blobs.
  async function restoreComplete(){
    if(!pendingComplete||busy||!localReady||buyerMode&&dirty)return;
    const batch=pendingComplete.records,assets=pendingComplete.assets;
    if(!confirm("将原子恢复 "+batch.length+" 笔询价和 "+assets.length+" 份 PDF 原件；若编号重复则全部拒绝。是否继续？"))return;
    busy=true;buttons();
    try{
      const db=await openDB();let hadActive=false;
      try{
        await new Promise((resolve,reject)=>{
          const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE);
          let err=null;
          const req=store.getAllKeys();
          req.onsuccess=()=>{
            const k=new Set(req.result),a=store.get(KEY);
            a.onsuccess=()=>{
              try{
                const old=a.result||null;
                if(buyerMode&&(!old||old.workspaceId!==workspaceId||old.revision!==revision))
                  throw Error("另一窗口已修改活动询价");
                const ids=new Set();
                if(old)ids.add(old.workspaceId);
                for(const v of k)if(typeof v==="string"&&v.startsWith("archive:"))ids.add(v.slice(8));
                for(const ws of batch){
                  model.validate(ws);
                  if(ids.has(ws.workspaceId))throw Error("已有相同询价编号："+ws.workspaceId);
                  ids.add(ws.workspaceId);
                }
                hadActive=!!old;
                batch.forEach((ws,i)=>store.put(ws,!old&&i===0?KEY:"archive:"+ws.workspaceId));
                for(const asset of assets){
                  const key=window.SRMDrawings.key(asset.workspaceId,asset.sha256);
                  if(k.has(key))throw Error("PDF 附件键已存在，拒绝覆盖");
                  store.put(asset.blob,key);
                }
              }catch(e){err=e;tx.abort()}
            };
          };
          tx.oncomplete=resolve;
          tx.onerror=()=>reject(err||tx.error||Error("恢复数据库事务失败"));
          tx.onabort=()=>reject(err||tx.error||Error("恢复已取消"));
        });
      }finally{db.close()}
      if(!hadActive)applyWorkspace(batch[0]);
      pendingComplete=null;completeInfo.textContent="";
      await refreshHistory();
      status("已原子恢复 "+batch.length+" 笔询价及 "+assets.length+" 个真实 PDF；原有询价没有覆盖。");
    }catch(e){status("图纸完整恢复已拒绝，原数据未覆盖："+e.message,true)}
    finally{busy=false;buttons()}
  }
  function renderRestorePreview(){
    if(!pendingRestore)return;
    if(pendingRestore.kind==="bulk"){
      const ws=pendingRestore.workspaces;
      const selected=restoreScope.value==="single"?[ws.find(x=>x.workspaceId===restoreSelection.value)].filter(Boolean):ws;
      const infos=backup.previewAll({workspaces:selected});
      previewBox.textContent="完整备份导出时间："+pendingRestore.exportedAt+
        "\n备份内共有 "+ws.length+" 笔询价；准备恢复 "+selected.length+" 笔："+
        "\n"+infos.slice(0,30).map(i=>i.workspaceId+" · 物料 "+i.itemCount+" · 供应商 "+i.supplierCount+" · 报价轮次 "+i.quoteRounds).join("\n")+
        (infos.length>30?"\n…其余 "+(infos.length-30)+" 笔省略展示":"")+
        "\n将先核对本机现有编号；任何编号冲突时整批拒绝，绝不覆盖旧记录。"+
        "\n仅含结构化业务数据；不含原始邮件、PDF、截图等附件。";
    }else{
      const info=backup.preview(pendingRestore);
      previewBox.textContent="待恢复工作："+info.workspaceId+
        "\n备份版本："+info.revision+"；导出时间："+info.exportedAt+
        "\n物料行："+info.itemCount+"；供应商："+info.supplierCount+
        "；报价轮次："+info.quoteRounds+"（已确认："+info.confirmedRounds+"）"+
        "\n不包含原始邮件、PDF、聊天截图等附件文件。"+
        "\n单笔旧版备份仍仅可恢复到没有正式记录的浏览器环境。";
    }
    previewBox.style.display="block";buttons();
  }
  // 中文：预览前辨识备份类型；严禁把未验证的文件静默写入本机。
  // English: Distinguish validated single and all-RFQ formats before any local writes.
  async function stageBackupFile(){
    pendingRestore=null;previewBox.style.display="none";previewBox.textContent="";
    restoreOptions.style.display="none";restoreBtn.disabled=true;
    const file=importInput.files?.[0];if(!file){buttons();return}
    if(!/\.json$/i.test(file.name)||file.size>backup.MAX_BULK_BYTES||file.size===0){
      status("仅接受不超过 64MB 的 SRM JSON 结构化备份文件；未写入任何数据。",true);
      importInput.value="";buttons();return;
    }
    busy=true;buttons();
    try{
      const text=await file.text();
      let meta;
      try{meta=JSON.parse(text)}catch(_){throw Error("JSON 文件格式错误")}
      if(meta?.format===backup.BULK_FORMAT){
        const parsed=backup.parseAll(text);
        pendingRestore={...parsed,kind:"bulk"};
        restoreOptions.style.display="flex";
        restoreScope.value="all";
        restoreSelection.replaceChildren();
        for(const ws of parsed.workspaces){
          const option=document.createElement("option");
          option.value=ws.workspaceId;option.textContent=ws.workspaceId;
          restoreSelection.appendChild(option);
        }
        restoreSelection.disabled=true;
        status("已校验 "+parsed.workspaces.length+" 笔备份记录。可选择全部恢复或单笔恢复；已有编号不会被覆盖。");
      }else{
        if(file.size>backup.MAX_BYTES)throw Error("单笔旧版备份不能超过 16MB");
        pendingRestore={...backup.parse(text),kind:"single"};
        status(buyerMode?
          "单笔旧版备份校验通过，但本机已有正式工作；不可覆盖。":
          "单笔旧版备份已校验，请核对预览后恢复到空白本机。");
      }
      renderRestorePreview();
    }catch(e){
      pendingRestore=null;previewBox.textContent="";previewBox.style.display="none";
      restoreOptions.style.display="none";
      status("备份文件校验失败，未写入任何数据："+e.message,true);
    }finally{busy=false;buttons();importInput.value=""}
  }
  async function writeImportedIfEmpty(ws){
    const db=await openDB();
    try{
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE);
        let err=null;
        const req=store.get(KEY);
        req.onsuccess=()=>{
          if(req.result){err=Error("本机已有工作数据，禁止覆盖。");tx.abort();return}
          store.put(ws,KEY);
        };
        tx.oncomplete=resolve;
        tx.onerror=()=>reject(err||tx.error||Error("恢复写入失败"));
        tx.onabort=()=>reject(err||tx.error||Error("恢复已取消"));
      });
    }finally{db.close()}
  }
  // 中文：一次事务读取本机已存在的所有询价编号，发现任意冲突则整批中止。
  // English: Check all RFQ identifiers inside one readwrite transaction; any collision aborts the whole import.
  async function appendBulkIfUnique(records){
    const db=await openDB();
    try{
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE);
        let failure=null,hadActive=false;
        const req=store.getAllKeys();
        req.onsuccess=()=>{
          try{
            const keys=new Set(req.result);
            const activeReq=store.get(KEY);
            activeReq.onsuccess=()=>{
              try{
                const active=activeReq.result||null;
                if(buyerMode&&(!active||active.workspaceId!==workspaceId||active.revision!==revision))
                  throw Error("本机活动记录已改变，请先恢复最新版本");
                const ids=new Set();
                if(active)ids.add(active.workspaceId);
                for(const key of keys)if(typeof key==="string"&&key.startsWith("archive:"))ids.add(key.slice(8));
                for(const ws of records){
                  if(ids.has(ws.workspaceId))throw Error("询价编号冲突："+ws.workspaceId+"；本次全部取消，未覆盖现有数据");
                  ids.add(ws.workspaceId);
                }
                hadActive=!!active;
                records.forEach((ws,i)=>store.put(ws,!active&&i===0?KEY:"archive:"+ws.workspaceId));
              }catch(e){failure=e;tx.abort()}
            };
          }catch(e){failure=e;tx.abort()}
        };
        tx.oncomplete=()=>resolve({hadActive});
        tx.onerror=()=>reject(failure||tx.error||Error("恢复写入失败"));
        tx.onabort=()=>reject(failure||tx.error||Error("恢复已取消"));
      });
    }finally{db.close()}
  }
  async function restorePortable(){
    if(!pendingRestore||busy||!localReady)return;
    if(pendingRestore.kind==="single"&&buyerMode)return;
    if(pendingRestore.kind==="bulk"&&buyerMode&&dirty){
      status("当前有未保存的修改，不能恢复全部数据。请先保存本机记录。",true);return;
    }
    const isBulk=pendingRestore.kind==="bulk";
    const ws=isBulk?null:pendingRestore.workspace;
    const batch=isBulk?(restoreScope.value==="single"?
      pendingRestore.workspaces.filter(x=>x.workspaceId===restoreSelection.value):
      pendingRestore.workspaces):[ws];
    if(!batch.length){status("请选定需要恢复的询价。",true);return}
    if(!confirm("准备恢复 "+batch.length+" 笔询价。先检查编号冲突，任何冲突则全部拒绝，不会覆盖旧记录。原始邮件/PDF 需单独保管。确认继续？"))return;
    busy=true;buttons();
    try{
      if(isBulk){
        backup.parseAll(backup.createAll(batch,pendingRestore.exportedAt));
        const result=await appendBulkIfUnique(batch);
        if(!result.hadActive)applyWorkspace(batch[0]);
        pendingRestore=null;restoreOptions.style.display="none";
        previewBox.style.display="none";previewBox.textContent="";
        await refreshHistory();
        status("已成功恢复 "+batch.length+" 笔询价。已有询价未覆盖；未自动恢复邮件/PDF/截图附件。");
      }else{
        backup.parse(backup.create(ws,pendingRestore.exportedAt));
        await writeImportedIfEmpty(ws);
        applyWorkspace(ws);
        pendingRestore=null;previewBox.style.display="none";previewBox.textContent="";
        await refreshHistory();
        status("结构化数据已恢复到本机（版本 "+revision+"）。附件文件没有恢复；请另外核对原始邮件、PDF 和截图。");
      }
    }catch(e){status("恢复失败，原有记录未覆盖："+e.message,true)}
    finally{busy=false;buttons()}
  }

  exportBtn.addEventListener("click",exportBackup);
  exportAllBtn.addEventListener("click",exportAllBackup);
  exportCompleteBtn.addEventListener("click",exportComplete);
  importCompleteInput.addEventListener("change",stageComplete);
  restoreCompleteBtn.addEventListener("click",restoreComplete);
  restoreScope.addEventListener("change",()=>{
    restoreSelection.disabled=restoreScope.value!=="single";renderRestorePreview();
  });
  restoreSelection.addEventListener("change",renderRestorePreview);
  document.getElementById("pilotExportExcel").addEventListener("click",exportBusinessExcel);
  importInput.addEventListener("change",stageBackupFile);
  restoreBtn.addEventListener("click",restorePortable);
  newBtn.addEventListener("click",beginBuyer);
  saveBtn.addEventListener("click",save);
  resumeBtn.addEventListener("click",recover);
  historyPicker.addEventListener("change",buttons);
  historyBtn.addEventListener("click",switchArchived);
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
      await refreshHistory();
    }catch(e){blocked=true;localReady=false;status("本机保存不可用或记录异常："+e.message+"。不要使用真实采购资料。",true)}
    finally{buttons()}
  })();
  window.SRMPilot=Object.freeze({snapshot:()=>buyerMode?readState():null,
    isBuyer:()=>buyerMode,revision:()=>revision,dirty:()=>dirty,
    save,recover,beginBuyer,switchArchived,exportBackup,exportAllBackup,exportComplete,restoreComplete,noteDrawingChange,restorePortable,importSupplierRows,exportBusinessExcel,committedWorkspaceForReport,reportMessage:status});
}