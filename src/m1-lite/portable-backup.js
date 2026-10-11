/* 中文：SRM-Lite 可携带的结构化业务备份，独立于 IndexedDB。
 * English: Portable structured business-data backup independent of the browser storage backend. */
(function(root){
"use strict";
const FORMAT="srm-lite-structured-backup",VERSION=1,MAX_BYTES=16*1024*1024;
const keys=["items","suppliers","assignments","quoteRounds","awards","awardReasons","manualAwards","awardReviewIds","supplierPool","selectedCompareSuppliers","customFields"];
function fail(code){throw new Error("BACKUP_"+code)}
function counts(ws){
  const result={};
  for(const key of keys)result[key]=ws.state[key].length;
  return result;
}
function validateWorkspace(ws){
  if(!root.M1WorkspaceCore)fail("MODEL_MISSING");
  root.M1WorkspaceCore.validate(ws);
  if(ws.origin!=="buyer")fail("DEMO_NOT_ALLOWED");
  if(ws.state.quoteComparisonMode==="demo")fail("DEMO_MODE");
}
function create(ws,exportedAt){
  validateWorkspace(ws);
  const date=exportedAt||new Date().toISOString();
  if(!Number.isFinite(Date.parse(date)))fail("INVALID_TIME");
  const data={
    format:FORMAT,
    backupFormatVersion:VERSION,
    schemaVersion:ws.schemaVersion,
    exportedAt:date,
    attachmentsIncluded:false,
    warning:"本文件只包含询比价结构化数据和凭证引用，不含原始邮件、PDF、截图等附件文件。",
    recordCounts:counts(ws),
    workspace:JSON.parse(JSON.stringify(ws))
  };
  return JSON.stringify(data,null,2);
}
function parse(text){
  if(typeof text!=="string"||text.length===0||text.length>MAX_BYTES)fail("SIZE");
  let data;
  try{data=JSON.parse(text)}catch(_){fail("INVALID_JSON")}
  if(!data||typeof data!=="object"||Array.isArray(data)||data.format!==FORMAT)fail("FORMAT");
  if(data.backupFormatVersion!==VERSION)fail("BACKUP_VERSION");
  if(data.attachmentsIncluded!==false)fail("ATTACHMENT_FLAG");
  if(!data.workspace||data.schemaVersion!==data.workspace.schemaVersion)fail("SCHEMA_MISMATCH");
  if(typeof data.exportedAt!=="string"||!Number.isFinite(Date.parse(data.exportedAt)))fail("EXPORT_TIME");
  validateWorkspace(data.workspace);
  const expected=counts(data.workspace),supplied=data.recordCounts;
  if(!supplied||typeof supplied!=="object"||Array.isArray(supplied))fail("COUNTS");
  for(const [key,value] of Object.entries(expected))if(supplied[key]!==value)fail("COUNT_"+key);
  return {
    workspace:JSON.parse(JSON.stringify(data.workspace)),
    exportedAt:data.exportedAt,
    recordCounts:expected,
    attachmentsIncluded:false
  };
}
function preview(parsed){
  const ws=parsed.workspace,c=parsed.recordCounts;
  return {
    workspaceId:ws.workspaceId,revision:ws.revision,
    exportedAt:parsed.exportedAt,
    itemCount:c.items,supplierCount:c.suppliers,
    quoteRounds:c.quoteRounds,confirmedRounds:ws.state.quoteRounds.filter(r=>r.status==="confirmed").length,
    attachmentsIncluded:false
  };
}
root.M1Backup=Object.freeze({FORMAT,VERSION,MAX_BYTES,create,parse,preview});
if(typeof module!=="undefined"&&module.exports)module.exports=root.M1Backup;
})(typeof window!=="undefined"?window:globalThis);
