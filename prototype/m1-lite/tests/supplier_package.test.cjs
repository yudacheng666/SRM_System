/* 中文：供应商 ZIP 回归测试：原名保留、隔离、JSON 排除与冲突。
 * English: Supplier ZIP regression for originals, isolation, no JSON and conflicts.
 * 运行 / Run: node --test tests/supplier_package.test.cjs
 */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");

function loadModules() {
  // 中文：测试仓库真实浏览器模块，避免另写一份打包逻辑。
  // English: Execute the actual inline browser modules, not a duplicated packer.
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const assets = new Map();
  const app = {crypto: crypto.webcrypto,
    M1Backup: {createAll: () => JSON.stringify({format:"fixture",data:[]})}};
  const sandbox = {window:app,Blob,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,
    fetch:async url => {
      const sha = decodeURIComponent(url.split("/").pop());
      const blob = assets.get(sha);
      return blob ? {ok:true,status:200,blob:async()=>blob} : {ok:false,status:404};
    }};
  for (const pair of [
    ["/* BEGIN M1_LITE_ZIP_BATCH */", "/* END M1_LITE_ZIP_BATCH */"],
    ["/* BEGIN M1_LITE_REAL_PDF_STORE */", "/* END M1_LITE_REAL_PDF_STORE */"]]) {
    const first = html.indexOf(pair[0]), last = html.indexOf(pair[1], first);
    assert(first >= 0 && last > first, "Expected browser module absent");
    vm.runInNewContext(html.slice(first, last), sandbox, {timeout:5000});
  }
  return {app,assets};
}

function fixture(assets, namesAndSamples) {
  // 中文：所有 PDF 均为虚构字节。
  // English: All PDF data is wholly synthetic.
  const docs = [];
  for (const pair of namesAndSamples) {
    const name = pair[0], value = pair[1];
    const bytes = Buffer.from("%PDF-1.4\n% synthetic " + value + "\n%%EOF");
    const blob = new Blob([bytes],{type:"application/pdf"});
    const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
    assets.set(sha256,blob);
    docs.push({sha256,name,revision:"A",size:blob.size});
  }
  return docs;
}

function buildWorkspace(first,second,links) {
  const relations = links || [["L-001",["SUP-001"]],["L-002",["SUP-002"]]];
  return {workspaceId:"RFQ-SYNTHETIC",state:{
    assignments:relations.map(pair=>({key:pair[0],values:pair[1]})),
    items:[
      {lineId:"L-001",id:"TEST-001",drawingStatus:"required",drawings:first},
      {lineId:"L-002",id:"TEST-002",drawingStatus:"required",drawings:second}
    ]
  }};
}

async function exported(app,ws,sid) {
  const output=await app.SRMDrawings.packageFor(ws,sid,new Blob(["spreadsheet"]),"RFQ_"+sid+".xlsx");
  return app.SRMZip.read(output.zip);
}

test("supplier ZIPs preserve original names/bytes, isolate contents, and omit JSON",async()=>{
  const {app,assets}=loadModules();
  const first=fixture(assets,[["TEST-001_图号-A.pdf","drawing-one"]]);
  const second=fixture(assets,[["TEST-002_REV.B.pdf","drawing-two"]]);
  const ws=buildWorkspace(first,second);
  const a=await exported(app,ws,"SUP-001");
  const b=await exported(app,ws,"SUP-002");
  assert.deepEqual(a.map(x=>x.name),["RFQ_SUP-001.xlsx","TEST-001_图号-A.pdf"]);
  assert.deepEqual(b.map(x=>x.name),["RFQ_SUP-002.xlsx","TEST-002_REV.B.pdf"]);
  assert.equal(Buffer.compare(Buffer.from(await a[1].blob.arrayBuffer()),Buffer.from(await assets.get(first[0].sha256).arrayBuffer())),0);
  assert.equal(Buffer.compare(Buffer.from(await b[1].blob.arrayBuffer()),Buffer.from(await assets.get(second[0].sha256).arrayBuffer())),0);
  assert(a.every(x=>!x.name.endsWith(".json"))&&b.every(x=>!x.name.endsWith(".json")));
});

test("reused same PDF appears once per supplier ZIP",async()=>{
  const {app,assets}=loadModules();
  const drawing=fixture(assets,[["DRAWING-007.pdf","shared"]]);
  const ws=buildWorkspace(drawing,drawing,[["L-001",["SUP-001"]],["L-002",["SUP-001"]]]);
  const entries=await exported(app,ws,"SUP-001");
  assert.deepEqual(entries.map(x=>x.name),["RFQ_SUP-001.xlsx","DRAWING-007.pdf"]);
});

test("case-insensitive same-name different-content conflict is rejected",async()=>{
  const {app,assets}=loadModules();
  const first=fixture(assets,[["DRAWING-008.pdf","bytes-A"]]);
  const second=fixture(assets,[["drawing-008.PDF","bytes-B"]]);
  const ws=buildWorkspace(first,second,[["L-001",["SUP-001"]],["L-002",["SUP-001"]]]);
  await assert.rejects(exported(app,ws,"SUP-001"),/同名冲突/);
});

test("same filename in separate supplier ZIPs still contains the right bytes",async()=>{
  const {app,assets}=loadModules();
  const first=fixture(assets,[["SAME.pdf","vendor-A"]]);
  const second=fixture(assets,[["SAME.pdf","vendor-B"]]);
  const ws=buildWorkspace(first,second);
  const a=await exported(app,ws,"SUP-001");
  const b=await exported(app,ws,"SUP-002");
  assert.equal(a[1].name,"SAME.pdf");
  assert.equal(b[1].name,"SAME.pdf");
  assert.notDeepEqual(Buffer.from(await a[1].blob.arrayBuffer()),Buffer.from(await b[1].blob.arrayBuffer()));
});

test("unsafe names and corrupt PDF content block export",async()=>{
  const {app,assets}=loadModules();
  const first=fixture(assets,[["../unsafe.pdf","valid"]]);
  const ws=buildWorkspace(first,[],[["L-001",["SUP-001"]]]);
  await assert.rejects(exported(app,ws,"SUP-001"),/文件名不适合外发/);
  ws.state.items[0].drawings[0].name="SAFE.pdf";
  assets.set(first[0].sha256,new Blob(["%PDF-1.4\ncorrupted\n%%EOF"]));
  await assert.rejects(exported(app,ws,"SUP-001"),/校验值不符/);
});

test("internal complete backup retains its separate private JSON index",async()=>{
  const {app,assets}=loadModules();
  const first=fixture(assets,[["DRAWING-123.pdf","backup-test"]]);
  const ws=buildWorkspace(first,[],[["L-001",["SUP-001"]]]);
  const zip=await app.SRMDrawings.completeBackup([ws]);
  const entries=await app.SRMZip.read(zip);
  assert(entries.some(x=>x.name==="图纸文件索引.json"));
  assert(entries.some(x=>x.name==="全部询价结构化数据.json"));
});
