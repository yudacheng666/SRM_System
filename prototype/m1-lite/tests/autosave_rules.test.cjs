/* 中文：自动保存关键规则的纯逻辑回归测试。
 * English: Regression for idle saves, no-op navigation and failure handling.
 * 运行 / Run: node --test tests/autosave_rules.test.cjs
 */
"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

function rules(){
  const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
  const first=html.indexOf("/* BEGIN SRM_S4_AUTOSAVE_RULES */");
  const last=html.indexOf("/* END SRM_S4_AUTOSAVE_RULES */",first);
  assert(first>0&&last>first,"The actual SRM autosave rule module is required");
  const browser={};
  vm.runInNewContext(html.slice(first,last),{window:browser}, {timeout:3000});
  return browser.SRMAutosaveRules;
}
function req(overrides={}){
  return {revision:1,current:"{item:2}",saved:"{item:1}",busy:false,blocked:false,
          halted:false,ready:true,editingAt:1000,now:3600,...overrides};
}
test("real changes save after idle; navigation/no-op does not save",()=>{
  const s=rules();
  assert.equal(s.IDLE_MS,2500);
  assert.equal(s.due(req()),true);
  assert.equal(s.due(req({now:3499})),false);
  assert.equal(s.due(req({current:"same",saved:"same"})),false);
});
test("new empty workspace needs an initial SQLite commit",()=>{
  const s=rules();
  assert.equal(s.changed(0,"same","same"),true);
  assert.equal(s.due(req({revision:0,current:"same",saved:"same"})),true);
});
test("busy, blocked, missing backend or halted failure prevent autosave",()=>{
  const s=rules();
  for(const key of ["busy","blocked","halted"]){
    assert.equal(s.due(req({[key]:true})),false,key);
  }
  assert.equal(s.due(req({ready:false})),false);
});
test("revision does not influence unchanged snapshot fingerprints",()=>{
  const s=rules();
  assert.equal(s.changed(1,"state","state"),false);
  assert.equal(s.changed(18,"state","state"),false);
  assert.equal(s.changed(18,"state2","state"),true);
});
