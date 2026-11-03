// 中文：离线 ZIP 能在没有第三方依赖时存取 XLSX、PDF、JSON 和供应商子 ZIP，并严格拒绝篡改。
// English: Verify safe offline ZIP interoperability, corruption rejection and filename guards.
"use strict";
const assert=require("node:assert/strict");
const z=require("../src/m1-lite/zip-batch.js");
(async()=>{
 const text=x=>new Blob([x]),entries=[
  {name:"vendor.xlsx",blob:text("XLSX")},
  {name:"drawing.pdf",blob:text("%PDF-1.4\n%%EOF")},
  {name:"manifest.json",blob:text('{"ok":true}')},
  {name:"vendor.zip",blob:text("INNER")}
 ];
 const file=await z.create(entries),unpacked=await z.read(file);
 assert.deepEqual(unpacked.map(x=>x.name),entries.map(x=>x.name));
 assert.equal(await unpacked[1].blob.text(),"%PDF-1.4\n%%EOF");
 console.log("PASS ZIP-PDF01: PDF/JSON/XLSX/nested-ZIP store and read with CRC and names");
 assert.rejects(()=>z.create([{name:"../danger.pdf",blob:text("x")}]),/文件名/);
 assert.rejects(()=>z.create([{name:"same.pdf",blob:text("1")},{name:"same.pdf",blob:text("2")}]),/文件名/);
 console.log("PASS ZIP-PDF02: unsafe paths and duplicate entries rejected");
 const corrupted=new Uint8Array(await file.arrayBuffer());corrupted[45]^=7;
 await assert.rejects(()=>z.read(new Blob([corrupted])),/CRC|不一致/);
 console.log("PASS ZIP-PDF03: bit-flipped PDF entry rejected before extraction");
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
