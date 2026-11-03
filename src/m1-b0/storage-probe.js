/* 中文：仅检测浏览器是否支持临时 IndexedDB 写入、关闭后读取和清理；不保存业务资料。
 * English: Probe ephemeral IndexedDB write/read/reopen/cleanup only; no business records. */
(function(root){
  "use strict";
  const DB_VERSION=1,STORE="probe";
  /* 中文：统一生成可供 UI 使用的状态对象；失败绝不可当作已经保存。
   * English: Return explicit diagnostic statuses; failures never imply a successful save. */
  function result(status,code,detail){return {status,code,detail: String(detail||"")};}
  function requestValue(req){
    return new Promise((resolve,reject)=>{
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error("IDB_REQUEST_FAILED"));
    });
  }
  function openDb(factory,name){
    return new Promise((resolve,reject)=>{
      const req=factory.open(name,DB_VERSION);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error("IDB_OPEN_FAILED"));
      req.onblocked=()=>reject(new Error("IDB_OPEN_BLOCKED"));
    });
  }
  function transactionValue(db,mode,method,key,value){
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);
      const req=method==="put"?store.put(value,key):store.get(key);
      let out;
      req.onsuccess=()=>{out=req.result};
      tx.oncomplete=()=>resolve(out);
      tx.onerror=()=>reject(tx.error||new Error("IDB_TX_FAILED"));
      tx.onabort=()=>reject(tx.error||new Error("IDB_TX_ABORTED"));
    });
  }
  function deleteDb(factory,name){
    return new Promise((resolve,reject)=>{
      const req=factory.deleteDatabase(name);
      req.onsuccess=()=>resolve();
      req.onerror=()=>reject(req.error||new Error("IDB_DELETE_FAILED"));
      req.onblocked=()=>reject(new Error("IDB_DELETE_BLOCKED"));
    });
  }
  /* 中文：B0 只用虚构检测值，写入临时数据库并删除；不检查存储配额也不替代正式备份。
   * English: Uses only synthetic probe data, deletes the temporary DB, and never promises quota or long-term retention. */
  async function check(options){
    const opts=options||{},factory=Object.prototype.hasOwnProperty.call(opts,"factory")?opts.factory:root.indexedDB;
    const name=opts.databaseName||"srm-m1-b0-capability";
    if(!factory||typeof factory.open!=="function"||typeof factory.deleteDatabase!=="function")
      return result("unsupported","NO_INDEXEDDB","当前环境没有可用的 IndexedDB；不得启用自动保存。");
    let db=null,opened=false,verified=false,cleanupFailed=false,failure=null;
    try{
      db=await openDb(factory,name);opened=true;
      const value={kind:"synthetic-probe",n:17};
      await transactionValue(db,"readwrite","put","diagnostic",value);
      db.close();db=null;
      db=await openDb(factory,name);
      const read=await transactionValue(db,"readonly","get","diagnostic");
      if(!read||read.kind!==value.kind||read.n!==17)throw new Error("IDB_REOPEN_VERIFY_FAILED");
      verified=true;
    }catch(e){
      failure=e&&e.message||"IndexedDB 测试失败";
    }finally{
      if(db){db.close();db=null;}
      // 中文：只要实际打开过数据库，即使读写失败也尝试删除虚构探测数据。
      // English: Clean up the synthetic probe even if a read/write error occurred after opening.
      if(opened){
        try{await deleteDb(factory,name)}catch(_){cleanupFailed=true}
      }
    }
    if(cleanupFailed)return result("failed","CLEANUP_FAILED","检测数据库清理失败；不能认为自动保存可用。"+(failure||""));
    if(failure)return result("failed","PROBE_FAILED",failure);
    return verified?result("supported","WRITE_REOPEN_READ_DELETE_OK","已验证虚构检测数据写入、关闭重开读取与清理；尚未验证长期保存或真实业务数据。"):
      result("failed","PROBE_INCOMPLETE","存储检测未完成");
  }
  root.M1StorageProbe={check,DB_VERSION,STORE};
})(typeof window!=="undefined"?window:globalThis);
