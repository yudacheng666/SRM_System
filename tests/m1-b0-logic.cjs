// 中文：独立校验 B0 的单文件构建、无 CDN、无业务数据存储及失败语义。
// English: Verify offline bundle integrity and honest storage-failure semantics.
"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const output=fs.readFileSync(path.join(root,"prototype/m1-b0/index.html"),"utf8");
const script=fs.readFileSync(path.join(root,"src/m1-b0/storage-probe.js"),"utf8");
assert.ok(output.includes("M1StorageProbe"));
assert.ok(output.includes("srm-m1-b0-capability"));
assert.doesNotMatch(output,/<!-- INLINE_B0_STORAGE_PROBE -->/);
assert.doesNotMatch(output,/<script[^>]+src\s*=/i);
assert.doesNotMatch(output,/<link[^>]+href\s*=\s*["']https?:/i);
assert.doesNotMatch(output,/<(?:script|img)[^>]+src\s*=\s*["']https?:/i);
assert.ok(!output.includes("ITEM-00001")&&!output.includes("SUP-001"));
console.log("PASS M1-B0: output is self-contained and contains no M0 demo rows");
const globals={};vm.runInNewContext(script,globals);
assert.equal(globals.M1StorageProbe.DB_VERSION,1);
(async()=>{
 const absent=await globals.M1StorageProbe.check({factory:null});
 assert.equal(absent.status,"unsupported");assert.equal(absent.code,"NO_INDEXEDDB");
 const denied=await globals.M1StorageProbe.check({factory:{open:()=>{throw Error("synthetic denied")},deleteDatabase:()=>({})}});
 assert.equal(denied.status,"failed");assert.equal(denied.code,"PROBE_FAILED");
 console.log("PASS M1-B0: no-storage and denied-storage paths fail closed");
})().catch(e=>{console.error(e);process.exitCode=1});
