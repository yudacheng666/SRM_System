/* 中文：轻量 M1-B1 业务状态模型，只管规范化/校验/序列化，不读写任何数据库或文件。
 * English: Lean pure domain model; no storage, file or network side effects. */
(function(root){
"use strict";
const VERSION=1,FORMAT="srm-workspace",LIMIT=20000;
const isObj=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const id=x=>typeof x==="string"&&x.length>0&&x.trim()===x;
function ensure(cond,msg){if(!cond)throw new Error("M1_MODEL_"+msg)}
function copy(x){return JSON.parse(JSON.stringify(x))}
function unique(values,label){ensure(values.length===new Set(values).size,"DUP_"+label)}
function listMap(map,label){
  ensure(map instanceof Map,"MAP_"+label);
  return [...map.entries()].map(([key,value])=>{
    ensure(id(key)&&value instanceof Set,"MAP_SET_"+label);
    return {key,values:[...value]};
  }).sort((a,b)=>a.key.localeCompare(b.key));
}
function parseListMap(data,label){
  ensure(Array.isArray(data),"LIST_"+label);
  const map=new Map();
  for(const row of data){
    ensure(isObj(row)&&id(row.key)&&Array.isArray(row.values),"ROW_"+label);
    ensure(!map.has(row.key),"DUP_"+label);
    row.values.forEach(x=>ensure(id(x),"VALUE_"+label));
    unique(row.values,label+"_VALUE");
    map.set(row.key,new Set(row.values));
  }
  return map;
}
function listEntries(map,label){
  ensure(map instanceof Map,"MAP_"+label);
  return [...map.entries()].map(([key,value])=>({key,value})).sort((a,b)=>a.key.localeCompare(b.key));
}
function parseEntries(data,label){
  ensure(Array.isArray(data),"ENTRIES_"+label);
  const out=new Map();
  for(const e of data){
    ensure(isObj(e)&&id(e.key)&&!out.has(e.key),"ENTRY_"+label);
    out.set(e.key,e.value);
  }
  return out;
}
function listSet(set,label){
  ensure(set instanceof Set,"SET_"+label);
  return [...set].sort();
}
function parseSet(xs,label){ensure(Array.isArray(xs),"ARRAY_"+label);xs.forEach(x=>ensure(id(x),"ID_"+label));unique(xs,label);return new Set(xs)}
function emptyState(){
  return {items:[],suppliers:[],assignments:[],quoteRounds:[],awards:[],awardReasons:[],
    manualAwards:[],awardReviewIds:[],supplierPool:[],selectedCompareSuppliers:[],
    customFields:[],lineSeq:0,createdSeq:0,quoteComparisonMode:"returned"};
}
/* 中文：仅用户明确创建的真实工作空间才标记为 buyer；演示模式须显式标记。
 * English: Buyer workspace is created explicitly, never inferred from synthetic demo seeds. */
function createEmptyWorkspace(workspaceId){
  ensure(id(workspaceId),"WORKSPACE_ID");
  const ws={format:FORMAT,schemaVersion:VERSION,workspaceId,origin:"buyer",revision:0,state:emptyState()};
  validate(ws);return ws;
}
/* 中文：从现有 M0 数组/Map/Set 捕获快照；B1 不触发自动保存。
 * English: Capture M0-shaped in-memory objects without initiating persistence. */
function captureM0(input){
  ensure(isObj(input)&&id(input.workspaceId),"CAPTURE_INPUT");
  ensure(input.origin==="buyer"||input.origin==="demo","CAPTURE_ORIGIN");
  if(input.origin==="buyer")ensure(input.sourceDataKind!=="demo","DEMO_TO_BUYER");
  const st=input.state;
  ensure(isObj(st),"CAPTURE_STATE");
  const state={
    items:copy(st.items),suppliers:copy(st.suppliers),
    assignments:listMap(st.assignments,"ASSIGN"),
    quoteRounds:copy(st.quoteRounds),
    awards:listEntries(st.awards,"AWARD"),
    awardReasons:listEntries(st.awardReasons,"REASON"),
    manualAwards:listSet(st.manualAwards,"MANUAL"),
    awardReviewIds:listSet(st.awardReviewIds,"REVIEW"),
    supplierPool:listSet(st.supplierPool,"POOL"),
    selectedCompareSuppliers:listSet(st.selectedCompareSuppliers,"COMMON"),
    customFields:copy(st.customFields),
    lineSeq:st.lineSeq,createdSeq:st.createdSeq,
    quoteComparisonMode:input.origin==="demo"?"demo":st.quoteComparisonMode
  };
  const out={format:FORMAT,schemaVersion:VERSION,workspaceId:input.workspaceId,origin:input.origin,revision:input.revision||0,state};
  validate(out);return out;
}
function validate(ws){
  ensure(isObj(ws)&&ws.format===FORMAT&&ws.schemaVersion===VERSION,"SCHEMA");
  ensure(id(ws.workspaceId)&&(ws.origin==="buyer"||ws.origin==="demo"),"WORKSPACE");
  ensure(Number.isSafeInteger(ws.revision)&&ws.revision>=0,"REVISION");
  const s=ws.state;ensure(isObj(s),"STATE");
  for(const name of ["items","suppliers","assignments","quoteRounds","awards","awardReasons","manualAwards","awardReviewIds","supplierPool","selectedCompareSuppliers","customFields"]){
    ensure(Array.isArray(s[name])&&s[name].length<=LIMIT,"ARRAY_"+name);
  }
  ensure(Number.isSafeInteger(s.lineSeq)&&s.lineSeq>=0&&Number.isSafeInteger(s.createdSeq)&&s.createdSeq>=0,"SEQUENCE");
  ensure(s.quoteComparisonMode==="returned"||s.quoteComparisonMode==="demo","QUOTE_MODE");
  if(ws.origin==="buyer")ensure(s.quoteComparisonMode!=="demo","DEMO_MODE_FOR_BUYER");
  const lineIds=[],supplierIds=[];
  for(const it of s.items){
    ensure(isObj(it)&&id(it.lineId)&&id(it.id)&&typeof it.name==="string"&&Number.isFinite(it.qty)&&it.qty>0&&id(it.unit),"ITEM");
    // 中文：ERP 可选核心属性允许旧快照缺失；如有值必须是有界文本，不能破坏备份兼容。
    // English: Legacy snapshots may omit ERP optional fields; present values must be bounded strings.
    for(const key of ["spec","ref1","ref2","purchaseUnit"]){
      ensure(it[key]==null||(typeof it[key]==="string"&&it[key].length<=1000),"ERP_FIELD_"+key);
    }
    // 中文：其他 ERP 列保留原名原值，不用来自动识别物料、换算数量或计算价格。
    // English: Retained raw ERP columns have no implicit identity, unit-conversion or pricing semantics.
    if(it.erpExtra!=null){
      ensure(isObj(it.erpExtra)&&Object.keys(it.erpExtra).length<=220,"ERP_EXTRA_OBJECT");
      let chars=0;
      for(const [key,value] of Object.entries(it.erpExtra)){
        chars+=key.length+String(value).length;
        ensure(!["__proto__","prototype","constructor"].includes(key)&&key.length<=100&&
          typeof value==="string"&&value.length<=1000&&chars<=16000,"ERP_EXTRA_VALUE");
      }
    }
    lineIds.push(it.lineId);
  }
  for(const sup of s.suppliers){ensure(isObj(sup)&&id(sup.id)&&typeof sup.name==="string","SUPPLIER");supplierIds.push(sup.id)}
  unique(lineIds,"LINE");unique(supplierIds,"SUPPLIER");
  const lines=new Set(lineIds),sups=new Set(supplierIds);
  function validLine(k,label){ensure(lines.has(k),"FOREIGN_LINE_"+label)}
  function validSupplier(k,label){ensure(sups.has(k),"FOREIGN_SUPPLIER_"+label)}
  const assignments=parseListMap(s.assignments,"ASSIGN");
  for(const [k,vals] of assignments){validLine(k,"ASSIGN");for(const v of vals)validSupplier(v,"ASSIGN")}
  for(const sid of parseSet(s.supplierPool,"POOL"))validSupplier(sid,"POOL");
  for(const sid of parseSet(s.selectedCompareSuppliers,"COMMON"))validSupplier(sid,"COMMON");
  const roundKeys=[];
  for(const r of s.quoteRounds){
    ensure(isObj(r)&&id(r.supplierId)&&Number.isSafeInteger(r.roundNo)&&r.roundNo>0&&
      Number.isSafeInteger(r.revisionNo)&&r.revisionNo>0&&["draft","confirmed"].includes(r.status)&&
      Array.isArray(r.lines)&&Array.isArray(r.expectedLineIds),"ROUND");
    validSupplier(r.supplierId,"ROUND");
    // 中文：商务条款与证据说明分离；旧版备份没有备注时仍可兼容。
    // English: Optional supplier terms are distinct from evidence provenance, including for older backups.
    ensure(r.termsNote==null||(typeof r.termsNote==="string"&&r.termsNote.length<=4000),"ROUND_TERMS_NOTE");
    ensure(r.evidenceNote==null||(typeof r.evidenceNote==="string"&&r.evidenceNote.length<=4000),"EVIDENCE_NOTE");
    roundKeys.push([r.supplierId,r.roundNo,r.revisionNo].join("|"));
    r.expectedLineIds.forEach(x=>validLine(x,"EXPECTED"));unique(r.expectedLineIds,"EXPECTED");
    const quoted=[];
    for(const q of r.lines){
      ensure(isObj(q)&&id(q.lineId),"QUOTE_LINE");validLine(q.lineId,"QUOTE");
      quoted.push(q.lineId);
      ensure(q.price==null||Number.isFinite(q.price),"PRICE");
      ensure(q.remark==null||(typeof q.remark==="string"&&q.remark.length<=2000),"QUOTE_REMARK");
      ensure(q.tiers==null||Array.isArray(q.tiers),"TIERS");
    }
    unique(quoted,"QUOTE");
  }
  unique(roundKeys,"ROUND");
  const awards=parseEntries(s.awards,"AWARD");
  for(const [k,v] of awards){validLine(k,"AWARD");validSupplier(v,"AWARD")}
  for(const [k,v] of parseEntries(s.awardReasons,"REASON")){validLine(k,"REASON");ensure(typeof v==="string","REASON_TEXT")}
  for(const k of parseSet(s.manualAwards,"MANUAL"))validLine(k,"MANUAL");
  for(const k of parseSet(s.awardReviewIds,"REVIEW"))validLine(k,"REVIEW");
  s.customFields.forEach(x=>ensure(typeof x==="string"||isObj(x),"CUSTOM_FIELD"));
  return true;
}
/* 中文：JSON 往返不丢 Map/Set；只恢复数据到新的内存对象，绝不覆盖已确认的旧状态。
 * English: Rehydrate fresh Map/Set instances without mutating any existing state. */
function hydrate(ws){
  validate(ws);
  const s=copy(ws.state);
  return {workspaceId:ws.workspaceId,origin:ws.origin,revision:ws.revision,
    state:{...s,assignments:parseListMap(s.assignments,"ASSIGN"),
      awards:parseEntries(s.awards,"AWARD"),awardReasons:parseEntries(s.awardReasons,"REASON"),
      manualAwards:parseSet(s.manualAwards,"MANUAL"),awardReviewIds:parseSet(s.awardReviewIds,"REVIEW"),
      supplierPool:parseSet(s.supplierPool,"POOL"),
      selectedCompareSuppliers:parseSet(s.selectedCompareSuppliers,"COMMON")}};
}
function stringify(ws){validate(ws);return JSON.stringify(ws)}
function parse(json,options){
  ensure(typeof json==="string","JSON_STRING");
  const ws=JSON.parse(json);validate(ws);
  if(options&&options.requireBuyer)ensure(ws.origin==="buyer","DEMO_NOT_IMPORTABLE");
  return ws;
}
root.M1WorkspaceCore=Object.freeze({VERSION,FORMAT,createEmptyWorkspace,captureM0,validate,hydrate,stringify,parse});
if(typeof module!=="undefined"&&module.exports)module.exports=root.M1WorkspaceCore;
})(typeof window!=="undefined"?window:globalThis);

