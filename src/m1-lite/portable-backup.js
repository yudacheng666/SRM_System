/* 中文：只负责结构化业务数据的 JSON 备份格式和读取校验，不保存邮件/PDF 原件。
 * English: Portable structured-data backup format and strict reader; original evidence binaries excluded. */
(function(root){
"use strict";
const FORMAT="srm-lite-json-backup",VERSION=1,MAX_BYTES=20*1024*1024;
function fail(message){throw new Error("备份文件无效："+message)}
function create(saved,exportedAt){
  root.M1WorkspaceCore.validate(saved);
  if(saved.origin!=="buyer")fail("不能备份虚构演示数据");
  const date=exportedAt||new Date().toISOString();
  if(typeof date!=="string"||!Number.isFinite(Date.parse(date)))fail("导出时间无效");
  return {format:FORMAT,backupVersion:VERSION,exportedAt:date,
    attachmentsIncluded:false,workspace:JSON.parse(root.M1WorkspaceCore.stringify(saved))};
}
function parse(text){
  if(typeof text!=="string"||!text.length)fail("内容为空");
  if(new TextEncoder().encode(text).length>MAX_BYTES)fail("文件超过 20 MB，无法安全预览");
  let payload;
  try{payload=JSON.parse(text)}catch(_){fail("不是有效 JSON 文件")}
  if(!payload||typeof payload!=="object"||Array.isArray(payload))fail("缺少备份内容");
  if(payload.format!==FORMAT||payload.backupVersion!==VERSION)fail("格式或版本不受支持");
  if(payload.attachmentsIncluded!==false)fail("附件范围标识异常");
  if(typeof payload.exportedAt!=="string"||!Number.isFinite(Date.parse(payload.exportedAt)))fail("导出时间无效");
  try{root.M1WorkspaceCore.validate(payload.workspace)}catch(e){fail("业务数据校验不通过："+String(e.message||e))}
  if(payload.workspace.origin!=="buyer")fail("演示数据不能作为正式工作恢复");
  // 中文：生成独立拷贝，不让上传文件对象的引用影响后续内存。
  // English: Return a validated independent snapshot to prevent aliasing.
  return {format:FORMAT,backupVersion:VERSION,exportedAt:payload.exportedAt,
    attachmentsIncluded:false,workspace:JSON.parse(root.M1WorkspaceCore.stringify(payload.workspace))};
}
function summarize(pack){
  const s=pack.workspace.state;
  return {workspaceId:pack.workspace.workspaceId,revision:pack.workspace.revision,
    exportedAt:pack.exportedAt,items:s.items.length,suppliers:s.suppliers.length,
    quoteRounds:s.quoteRounds.length,confirmed:s.quoteRounds.filter(x=>x.status==="confirmed").length};
}
const api=Object.freeze({FORMAT,VERSION,MAX_BYTES,create,parse,summarize});
root.SRMPortableBackup=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
