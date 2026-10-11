  /* 中文：仅手动备份已经保存的结构化业务数据；恢复前严格预览校验。
   * English: Manual saved-data export and validated preview before any restore. */
  const exportBackupBtn=document.getElementById("pilotExportBackup");
  const restoreFile=document.getElementById("pilotRestoreFile");
  const restorePreview=document.getElementById("pilotRestorePreview");
  const restoreDetail=document.getElementById("pilotRestoreDetail");
  const confirmRestoreBtn=document.getElementById("pilotConfirmRestore");
  const cancelRestoreBtn=document.getElementById("pilotCancelRestore");
  const undoRestoreBtn=document.getElementById("pilotUndoRestore");
  let previewPack=null,previewBaseline=null;
  function updateBackupButtons(){
    exportBackupBtn.disabled=busy||!buyerMode||!localReady;
    restoreFile.disabled=busy||!localReady||blocked;
    confirmRestoreBtn.disabled=busy||!previewPack;
    undoRestoreBtn.disabled=busy||!localReady;
  }
  function clearRestorePreview(){
    previewPack=null;previewBaseline=null;
    restoreDetail.textContent="";restorePreview.style.display="none";
    restoreFile.value="";updateBackupButtons();
  }
  async function downloadBackup(){
    if(busy||!buyerMode||!localReady)return;
    if(dirty){status("当前有未保存修改，请先点击“保存到本机”，再导出备份。",true);return}
    busy=true;buttons();updateBackupButtons();
    try{
      const saved=await readSaved();
      if(!saved||saved.workspaceId!==workspaceId||saved.revision!==revision)
        throw Error("本机保存版本已变化，请先恢复最新记录再导出。");
      const pack=window.SRMPortableBackup.create(saved);
      const output=JSON.stringify(pack,null,2);
      const date=pack.exportedAt.slice(0,10).replace(/-/g,"");
      const name=date+"_SRM_"+pack.workspace.workspaceId.replace(/[^a-zA-Z0-9_-]/g,"_")+"_v"+pack.workspace.revision+".json";
      const blob=new Blob([output],{type:"application/json;charset=utf-8"});
      const url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download=name;a.style.display="none";
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      status("已发起备份文件下载："+name+"。请核对文件已存入安全位置；原始邮件/PDF 不包含在内。");
    }catch(e){status("备份失败，未生成有效文件："+e.message,true)}
    finally{busy=false;buttons();updateBackupButtons()}
  }
  function sameBaseline(actual,expected){
    return (!actual&&!expected)||!!(actual&&expected&&actual.workspaceId===expected.workspaceId&&actual.revision===expected.revision);
  }
  restoreFile.addEventListener("change",async()=>{
    const file=restoreFile.files?.[0];
    previewPack=null;previewBaseline=null;restoreDetail.textContent="";restorePreview.style.display="none";updateBackupButtons();
    if(!file)return;
    if(busy||blocked||!localReady){status("本机保存不可用，无法恢复文件。",true);restoreFile.value="";return}
    if(buyerMode&&dirty){status("当前工作有未保存修改。请先保存，再预览恢复。",true);restoreFile.value="";return}
    try{
      if(file.size>window.SRMPortableBackup.MAX_BYTES)throw Error("文件超过 20MB");
      const pack=window.SRMPortableBackup.parse(await file.text());
      const current=await readSaved();
      if(current){model.validate(current);if(current.origin!=="buyer")throw Error("已有非正式记录，不允许覆盖")}
      previewPack=pack;
      previewBaseline=current?{workspaceId:current.workspaceId,revision:current.revision}:null;
      const v=window.SRMPortableBackup.summarize(pack);
      restoreDetail.textContent="待恢复工作："+v.workspaceId+"（版本 "+v.revision+"）\n"+
        "导出时间："+v.exportedAt+"\n"+
        "物料："+v.items+" 行；供应商："+v.suppliers+" 家；报价版本："+v.quoteRounds+" 个（已确认 "+v.confirmed+" 个）\n"+
        (current?"当前本机："+current.workspaceId+"（版本 "+current.revision+"）。确认后将替换并保留一次本机撤销记录。\n":
          "本机尚无保存的正式工作，确认后将新建。\n")+
        "注意：只含结构化业务数据，不含邮件、聊天截图、PDF、图纸等原始文件！";
      restorePreview.style.display="block";
      updateBackupButtons();
      status("文件已通过格式和业务关联检查，尚未恢复。请先核对预览信息。");
    }catch(e){clearRestorePreview();status("恢复预览失败，本机记录没有改变："+e.message,true)}
  });
  async function commitRestore(){
    if(busy||!previewPack||!localReady)return;
    if(buyerMode&&dirty){status("有未保存的修改，禁止直接覆盖。",true);return}
    const incoming=previewPack.workspace,baseline=previewBaseline;
    const warning=baseline?
      "即将用备份替换本机 "+baseline.workspaceId+"（版本 "+baseline.revision+"）。\n"+
      "来源文件："+incoming.workspaceId+"（版本 "+incoming.revision+"）。\n"+
      "建议先把当前本机记录另行导出。恢复时将保留一次本机撤销记录。是否继续？":
      "将文件中的 "+incoming.workspaceId+" 恢复为本机正式工作。附件文件本体不会恢复。是否继续？";
    if(!confirm(warning))return;
    if(baseline&&!confirm("再次确认：即将替换本机当前询报价记录。确定继续？"))return;
    busy=true;buttons();updateBackupButtons();
    try{
      const db=await openDB();
      try{
        await new Promise((resolve,reject)=>{
          const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE);
          let reason=null;
          const req=store.get(KEY);
          req.onsuccess=()=>{
            try{
              const actual=req.result||null;
              if(!sameBaseline(actual,baseline))throw Error("预览后本机记录已发生变化，请重新选择备份。");
              if(actual){
                store.put(actual,"restore-rollback");
                store.put({workspaceId:incoming.workspaceId,revision:incoming.revision},"restore-undo-target");
              }else{
                store.delete("restore-rollback");store.delete("restore-undo-target");
              }
              store.put(incoming,KEY);
            }catch(e){reason=e;tx.abort()}
          };
          tx.oncomplete=()=>resolve();
          tx.onerror=()=>reject(reason||tx.error||Error("恢复失败"));
          tx.onabort=()=>reject(reason||tx.error||Error("恢复中止"));
        });
      }finally{db.close()}
      applyWorkspace(incoming);clearRestorePreview();
      status("已从文件恢复："+workspaceId+"（版本 "+revision+"）。附件原件不包含在备份中，建议再导出独立文件。");
    }catch(e){status("恢复失败，本机原记录未改变："+e.message,true);clearRestorePreview()}
    finally{busy=false;buttons();updateBackupButtons()}
  }
  async function undoLastRestore(){
    if(busy||!localReady||blocked)return;
    if(buyerMode&&dirty){status("当前有未保存的修改，请先处理后再撤销恢复。",true);return}
    if(!confirm("撤销最近一次文件恢复？将把本机记录恢复到文件导入之前。请确保需要保留的文件已另行备份。"))return;
    busy=true;buttons();updateBackupButtons();
    try{
      const db=await openDB();let previous=null;
      try{
        await new Promise((resolve,reject)=>{
          const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE);
          let live=null,old=null,meta=null,reason=null;
          const a=store.get(KEY),b=store.get("restore-rollback"),c=store.get("restore-undo-target");
          a.onsuccess=()=>{live=a.result||null};
          b.onsuccess=()=>{old=b.result||null};
          c.onsuccess=()=>{meta=c.result||null};
          const decision=store.get("restore-undo-target");
          decision.onsuccess=()=>{
            try{
              if(!old||!meta||!live||!sameBaseline(live,meta))
                throw Error("没有可撤销记录，或其他窗口已经保存了更新的内容。");
              model.validate(old);previous=old;
              store.put(old,KEY);store.delete("restore-rollback");store.delete("restore-undo-target");
            }catch(e){reason=e;tx.abort()}
          };
          tx.oncomplete=()=>resolve();
          tx.onerror=()=>reject(reason||tx.error||Error("撤销失败"));
          tx.onabort=()=>reject(reason||tx.error||Error("撤销中止"));
        });
      }finally{db.close()}
      applyWorkspace(previous);
      status("已撤销最近一次文件恢复，找回恢复前的本机工作。建议立即下载独立备份。");
    }catch(e){status("撤销失败，本机记录保持原样："+e.message,true)}
    finally{busy=false;buttons();updateBackupButtons()}
  }
  exportBackupBtn.addEventListener("click",downloadBackup);
  confirmRestoreBtn.addEventListener("click",commitRestore);
  cancelRestoreBtn.addEventListener("click",clearRestorePreview);
  undoRestoreBtn.addEventListener("click",undoLastRestore);
  updateBackupButtons();
