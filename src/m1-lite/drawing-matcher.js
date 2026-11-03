/* 中文：按 PDF 文件名匹配 RFQ 物料编码和图号，仅提示候选，永不直接建立关系。
 * English: Conservative PDF filename matching against item and drawing numbers; review required. */
(function(root){
"use strict";
const valid=x=>typeof x==="string"&&x.trim().length>=3;
const norm=x=>String(x??"").normalize("NFKC").trim().toUpperCase();
const stem=x=>norm(String(x||"").replace(/\.pdf$/i,""));
function escapeRegex(value){return value.replace(/[.*+?^{}()|[\]\\$]/g,"\\$&")}
function hasDelimitedToken(name,token){
 if(!valid(token))return false;
 const pattern="(^|[^\\p{L}\\p{N}])"+escapeRegex(token)+"($|[^\\p{L}\\p{N}])";
 return new RegExp(pattern,"u").test(name);
}
function readDrawingNumbers(it){
 const values=[it.drawingNo,it.drawingNumber,it.drawingCode,it.drawingId,it.图号,it.图纸编号];
 const customs=it.custom&&typeof it.custom==="object"?it.custom:{};
 for(const [key,val] of Object.entries(customs)){
  if(/(?:^|[^a-z])(drawing\s*(?:no|number|code)|dwg\s*(?:no|number))(?:$|[^a-z])|图号|图纸编号|图样代号/i.test(key))
   values.push(val);
 }
 return [...new Set(values.filter(x=>typeof x==="string"&&valid(x)).map(norm))];
}
function tokens(it){
 const map=new Map();
 if(valid(it.id))map.set(norm(it.id),"物料编码");
 for(const drawing of readDrawingNumbers(it))if(!map.has(drawing))map.set(drawing,"图号");
 return map;
}
function revisionHint(filename){
 const name=stem(filename);
 let found=name.match(/(?:^|[_\s.\-])(?:REV(?:ISION)?|版本|V)[_\s.\-]?([A-Z0-9]{1,5})$/u);
 if(!found)found=name.match(/(?:^|[_\s.\-])([A-Z0-9]{1,4})版$/u);
 if(!found)found=name.match(/(?:^|[_\s.\-])([A-Z])$/u);
 return found?found[1]:"";
}
function unsafeSuffix(name,token){
 if(!name.startsWith(token))return false;
 const rest=name.slice(token.length);
 return /^[-_.]\d+(?=$|[-_.])/u.test(rest);
}
function propose(filename,items){
 const name=stem(filename),matches=[];
 if(!/\.pdf$/i.test(filename))return{status:"invalid",reason:"文件不是 PDF",candidates:[],selectedLineId:"",revision:""};
 for(const it of items||[]){
  if(!it||typeof it.lineId!=="string")continue;
  for(const [token,source] of tokens(it)){
   if(!hasDelimitedToken(name,token))continue;
   const level=name===token?"exact":unsafeSuffix(name,token)?"review":"bounded";
   matches.push({lineId:it.lineId,code:it.id,source,token,level});
  }
 }
 const byLine=new Map();
 for(const x of matches){
  const rank=x.level==="exact"?3:x.level==="bounded"?2:1;
  const prev=byLine.get(x.lineId);
  if(!prev||rank>(prev.level==="exact"?3:prev.level==="bounded"?2:1))
   byLine.set(x.lineId,x);
 }
 const candidates=[...byLine.values()],revision=revisionHint(filename);
 if(!candidates.length)return{status:"missing",reason:"未找到物料编码或图号的完整匹配",candidates:[],selectedLineId:"",revision};
 if(candidates.length>1)return{status:"multiple",reason:"存在多个可能的询价行，须手工选择",candidates,selectedLineId:"",revision};
 const c=candidates[0];
 if(c.level==="review")return{status:"review",reason:"数字后缀可能是另一物料编码，需人工核对",candidates,selectedLineId:c.lineId,revision};
 return{status:"unique",reason:c.source+"完整匹配；仍需采购员最终确认",candidates,selectedLineId:c.lineId,revision};
}
root.SRMDrawingMatcher=Object.freeze({propose,revisionHint,readDrawingNumbers,stem});
if(typeof module!=="undefined"&&module.exports)module.exports=root.SRMDrawingMatcher;
})(typeof window!=="undefined"?window:globalThis);
