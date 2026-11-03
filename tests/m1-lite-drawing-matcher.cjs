// 中文：匿名图纸文件名匹配单元测试：完整边界、图号、重码与人工复核。
 // English: Pure matching regressions for exact tokens, drawing-number, ambiguity and safety.
"use strict";
const assert=require("node:assert/strict"),m=require("../src/m1-lite/drawing-matcher.js");
const rows=[
 {lineId:"L-1",id:"P-001",drawingNo:"D-818"},
 {lineId:"L-2",id:"P-0012",drawingNo:"D-819"},
 {lineId:"L-3",id:"PART-X",custom:{"图纸编号":"G-333"}},
];
function check(file,expectStatus,expectId){
 const p=m.propose(file,rows);
 assert.equal(p.status,expectStatus,file+" "+JSON.stringify(p));
 if(expectId)assert.equal(p.selectedLineId,expectId,file);
 return p;
}
check("P-001.pdf","unique","L-1");
check("P-001_A.pdf","unique","L-1");
check("P-0012.pdf","unique","L-2");
check("D-818_RevB.pdf","unique","L-1");
check("G-333_A版.pdf","unique","L-3");
check("P-001-2.pdf","review");
check("UNRELATED.pdf","missing");
check("P-001.pdf.exe","invalid");
assert.equal(m.propose("P-001.pdf",[{lineId:"L1",id:"P-001"},{lineId:"L2",id:"P-001"}]).status,"multiple");
assert.equal(m.propose("P-001_G-333.pdf",rows).status,"multiple");
assert.equal(m.propose("Ｐ－００１．PDF",rows).status,"invalid","Only an explicit .pdf extension is accepted, not a filename guess");
assert.equal(m.revisionHint("D-818_RevB.pdf"),"B");
assert.equal(m.revisionHint("P-001_A.pdf"),"A");
assert.equal(m.revisionHint("P-001_技术要求.pdf"),"");
console.log("PASS MATCH-01: accurate material-number and drawing-number token boundaries");
console.log("PASS MATCH-02: duplicate RFQ material codes and cross-field candidates do not auto select");
console.log("PASS MATCH-03: suspicious numeric suffix and unknown/invalid filenames remain unconfirmed");
console.log("PASS MATCH-04: PDF revision hints are suggestions, never approved links");
