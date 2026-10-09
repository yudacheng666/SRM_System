// 中文：M0 第一批 P0 纯业务逻辑回归，测试数据完全虚构。
// English: M0 batch-one P0 business-logic regression using synthetic fixtures only.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../prototype/m0/index.html'), 'utf8');

// 中文：从真实 HTML 抽取目标函数，而不是在测试中重新编写被测业务算法。
// English: Extract functions from the actual HTML instead of reimplementing production logic in tests.
function extract(name) {
  const marker = 'function ' + name + '(';
  const start = source.indexOf(marker);
  assert.ok(start >= 0, 'Missing function: ' + name);
  const open = source.indexOf('{', start);
  let depth = 0, quote = '', escaped = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '\x60') { quote = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('Unbalanced function: ' + name);
}

// 中文：为最小化 DOM 依赖，仅在独立的测试作用域中构建虚构模型。
// English: Build minimal synthetic models in isolated scopes without browser DOM dependencies.
function run(preamble, functions, expression) {
  const body = preamble + '\n' + functions.map(extract).join('\n') + '\nreturn (' + expression + ');';
  return new Function(body)();
}
const outcomes = [];
function check(name, fn) {
  const result = fn();
  assert.equal(result, true, name);
  outcomes.push(name);
  process.stdout.write('PASS ' + name + '\n');
}
const quoteBase = [
  'const getSet=()=>new Set(["S1"]);',
  'const supplierSubmissions=()=>[];',
  'const latestConfirmedQuoteLine=()=>null;',
  'const effectivePriceForLine=(l)=>l.price;'
].join('\n');

// 中文：AUD-01 验证纯展示模式、回收模式及已确认有效报价的严格区分。
// English: AUD-01 checks strict separation of synthetic mode, return mode and valid confirmed quotes.
check('AUD01 synthetic prices limited to demo', () => run(
  'let quoteComparisonMode="demo";' + quoteBase, ['quoteMetaFor'],
  'quoteMetaFor({lineId:"L1",qty:2},{id:"S1"},1,1)?.price>0'
));
check('AUD01 returned mode leaves missing prices blank', () => run(
  'let quoteComparisonMode="returned";' + quoteBase, ['quoteMetaFor'],
  'quoteMetaFor({lineId:"L1",qty:2},{id:"S1"},1,1)===null'
));
check('AUD01 returned mode accepts confirmed prices', () => run(
  'let quoteComparisonMode="returned";' +
  'const getSet=()=>new Set(["S1"]);const supplierSubmissions=()=>[{roundNo:1}];' +
  'const latestConfirmedQuoteLine=()=>({price:72,lead:7,moq:1,roundNo:1,revisionNo:1,tiers:[],status:"quoted"});' +
  'const effectivePriceForLine=(l)=>l.price;', ['quoteMetaFor'],
  'quoteMetaFor({lineId:"L1",qty:2},{id:"S1"},1,1)?.price===72'
));
const updates = [
  'const items=[{id:"A",lineId:"L1",qty:4},{id:"A",lineId:"L2",qty:7},{id:"B",lineId:"L3",qty:6},{id:"C",lineId:"L4",qty:5}];',
  'const quoteRounds=[{status:"confirmed",expectedLineIds:["L4"],lines:[]}];',
  'const matchKeyField={value:"id"},matchUpdateField={value:"qty"};',
  'const itemFieldValue=(i,k)=>i[k];',
  'const parsePositiveNumber=(raw)=>{const n=Number(raw);return !Number.isFinite(n)||n<=0?{error:"数量格式错误"}:{error:null}};'
].join('\n');

// 中文：AUD-02 覆盖多候选、唯一命中、确认后保护、无效值、重复输入及未匹配处理。
// English: AUD-02 covers ambiguous/unique matches, confirmed history, invalid values, duplicate inputs and misses.
check('AUD02 reject ambiguous item codes', () => run(updates,['hasConfirmedItemHistory','planMatchedUpdates'],'planMatchedUpdates([["A","10"]]).blocking'));
check('AUD02 accept unique match', () => run(updates,['hasConfirmedItemHistory','planMatchedUpdates'],'planMatchedUpdates([["B","10"]]).entries[0].lineId==="L3"&&!planMatchedUpdates([["B","10"]]).blocking'));
check('AUD02 reject confirmed history update', () => run(updates,['hasConfirmedItemHistory','planMatchedUpdates'],'planMatchedUpdates([["C","10"]]).blocking'));
check('AUD02 reject invalid quantity', () => run(updates,['hasConfirmedItemHistory','planMatchedUpdates'],'planMatchedUpdates([["B","abc"]]).blocking'));
check('AUD02 reject duplicate input keys', () => run(updates,['hasConfirmedItemHistory','planMatchedUpdates'],'planMatchedUpdates([["B","10"],["B","11"]]).entries.every(x=>!x.ready)'));
check('AUD02 count unmatched rows without guessing', () => run(updates,['hasConfirmedItemHistory','planMatchedUpdates'],'!planMatchedUpdates([["B","10"],["UNKNOWN","12"]]).blocking&&planMatchedUpdates([["B","10"],["UNKNOWN","12"]]).entries[1].issue==="未匹配（跳过）"'));
const links = [
  'const quoteRounds=[{status:"confirmed",expectedLineIds:["L3"],lines:[]}];',
  'const assignments=new Map([["L1",new Set(["S"])],["L2",new Set(["S"])],["L3",new Set(["S"])]]);',
  'const alert=()=>{};'
].join('\n');
const linkFuncs = ['getSet','hasConfirmedItemHistory','guardMutableLines','changeSupplierRelations'];

// 中文：AUD-03 同时验证增删、受保护关系与整批原子性。
// English: AUD-03 validates both add/remove guards and atomic batch rejection.
check('AUD03 reject protected unlink atomically', () => run(links,linkFuncs,'changeSupplierRelations(["L1","L3"],"S","remove")===-1&&assignments.get("L1").has("S")&&assignments.get("L3").has("S")'));
check('AUD03 allow unprotected unlink', () => run(links,linkFuncs,'changeSupplierRelations(["L1","L2"],"S","remove")===2&&!assignments.get("L1").has("S")'));
check('AUD03 block new links on confirmed lines', () => run(links,linkFuncs,'changeSupplierRelations(["L3"],"S2","add")===-1&&!assignments.get("L3").has("S2")'));

// 中文：验证整页脚本可解析且 HTML ID 唯一；不将其声称为浏览器端到端测试。
// English: Verify whole-script syntax and unique HTML IDs; this is not end-to-end browser testing.
check('inline JavaScript parses', () => {
  new Function(source.split('<script>')[1].split('</script>')[0]);
  return true;
});
check('HTML element IDs are unique', () => {
  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  return new Set(ids).size === ids.length;
});
process.stdout.write('PASS ' + outcomes.length + '/' + outcomes.length + ' static/logic checks\n');
