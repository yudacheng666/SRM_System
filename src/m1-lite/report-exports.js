/* 中文：SRM-Lite 独立业务单据生成器，仅从明确已保存的正式询价快照生成。
 * English: Pure RFQ and comparison workbooks from a validated, committed buyer snapshot.
 * 对外 RFQ 不得包括任何报价历史、其他供应商名单、最终选定结果或内部原因。
 */
(function(root){
"use strict";
const mandatoryRfq=[
 {key:"lineId",name:"RFQ Line ID",required:true},
 {key:"code",name:"存货编码",required:true},
 {key:"name",name:"存货名称",required:true},
 {key:"quantity",name:"询价数量",required:true},
 {key:"unit",name:"询价单位",required:true},
 {key:"price",name:"报价单价",required:true},
 {key:"status",name:"报价状态",required:true}
];
const rfqExtras=[
 {key:"category",name:"所属类别"},
 {key:"spec",name:"规格型号"},
 {key:"lead",name:"交期"},
 {key:"moq",name:"MOQ"},
 {key:"remark",name:"物料备注"}
];
const summaryRequired=[
 {key:"lineId",name:"RFQ Line ID",required:true},
 {key:"code",name:"存货编码",required:true},
 {key:"quantity",name:"询价数量",required:true},
 {key:"unit",name:"询价单位",required:true}
];
const summaryOptional=[
 {key:"name",name:"存货名称"},
 {key:"category",name:"所属类别"},
 {key:"spec",name:"规格型号"},
 {key:"ref1",name:"参考编码1"},
 {key:"ref2",name:"参考编码2"},
 {key:"purchaseUnit",name:"采购常用单位"},
 {key:"common",name:"是否共同有效报价"},
 {key:"lowest",name:"最低适用单价"},
 {key:"award",name:"最终选择供应商"},
 {key:"awardPrice",name:"选择供应商适用单价"},
 {key:"awardReason",name:"非最低价选择原因"},
 {key:"review",name:"选择待复核"}
];
const historyRequired=[
 {key:"supplierCode",name:"供应商编码",required:true},
 {key:"round",name:"报价轮次",required:true},
 {key:"revision",name:"报价版本",required:true},
 {key:"confirmed",name:"确认状态",required:true},
 {key:"lineId",name:"RFQ Line ID",required:true},
 {key:"code",name:"存货编码",required:true},
 {key:"status",name:"报价状态",required:true}
];
const historyOptional=[
 {key:"supplierName",name:"往来单位名称"},
 {key:"name",name:"存货名称"},
 {key:"spec",name:"规格型号"},
 {key:"ref1",name:"参考编码1"},
 {key:"ref2",name:"参考编码2"},
 {key:"purchaseUnit",name:"采购常用单位"},
 {key:"qty",name:"询价数量"},
 {key:"unit",name:"询价单位"},
 {key:"price",name:"报价单价"},
 {key:"applicable",name:"当次数量适用单价"},
 {key:"tiers",name:"阶梯报价"},
 {key:"lead",name:"交期"},
 {key:"moq",name:"MOQ"},
 {key:"terms",name:"整轮商务备注"},
 {key:"note",name:"物料备注"},
 {key:"evidenceType",name:"原始报价凭证类型"},
 {key:"evidence",name:"报价凭证说明"},
 {key:"source",name:"报价来源说明"},
 {key:"confirmedAt",name:"确认时间"}
];
const fields={
 rfq:[...mandatoryRfq,...rfqExtras],
 summary:[...summaryRequired,...summaryOptional],
 history:[...historyRequired,...historyOptional]
};
function fail(message){throw new Error("EXPORT: "+message)}
function checkedWorkspace(ws){
 if(!root.M1WorkspaceCore)fail("数据校验组件未加载");
 root.M1WorkspaceCore.validate(ws);
 if(ws.origin!=="buyer"||ws.state.quoteComparisonMode!=="returned")fail("只允许从正式工作空间导出，不能导出演示报价");
 return ws.state;
}
function supplierMap(st){return new Map(st.suppliers.map(s=>[s.id,s]))}
function pairs(st,key){return new Map((st[key]||[]).map(p=>[p.key,p.value]))}
function allocations(st){return new Map(st.assignments.map(a=>[a.key,new Set(a.values)]))}
function fieldSelection(kind,selected){
 const specs=fields[kind];if(!specs)fail("不支持的单据类别");
 const ids=new Set(specs.map(f=>f.key));
 const requested=selected===undefined?new Set(specs.map(f=>f.key)):new Set(selected);
 for(const key of requested)if(!ids.has(key))fail("不属于此单据的导出字段："+key);
 // Mandatory fields always included even if caller passes an empty optional selection.
 return specs.filter(f=>f.required||requested.has(f.key));
}
function safeFilename(str){return String(str||"").replace(/[\\/:*?"<>|]/g,"_").slice(0,48)}
function roundName(r){return "第"+r.roundNo+"轮/第"+r.revisionNo+"版"}
function tierText(line){
 if(!line?.tiers?.length)return"";
 return line.tiers.map(t=>t.min+(t.max==null?"+":"-"+t.max)+":"+t.price).join("|");
}
function effectivePrice(line,quantity){
 if(!line||line.status!=="quoted")return null;
 const q=Number(quantity);
 if(!Number.isFinite(q)||q<=0)return null;
 if(line.tiers?.length){
  const t=line.tiers.find(x=>q>=x.min&&(x.max==null||q<=x.max));
  return t&&Number.isFinite(Number(t.price))?Number(t.price):null;
 }
 return line.price==null||!Number.isFinite(Number(line.price))?null:Number(line.price);
}
// The latest CONFIRMED revision per round is authoritative; never use draft revisions for prices.
function latestConfirmedQuote(st,sid,lineId){
 const rounds=st.quoteRounds.filter(r=>r.supplierId===sid&&r.status==="confirmed")
  .sort((a,b)=>b.roundNo-a.roundNo||b.revisionNo-a.revisionNo);
 const seen=new Set();
 for(const r of rounds){
  if(seen.has(r.roundNo))continue;
  seen.add(r.roundNo);
  if(!(r.expectedLineIds||[]).includes(lineId))continue;
  const line=r.lines.find(q=>q.lineId===lineId);
  return line?{line,round:r}:null; // An explicit declined quote must not fallback to old price.
 }
 return null;
}
function amountCents(qty,price){return Math.round(Number(qty)*price*100)}
function excelColumn(n){let result="";for(let x=n;x>=0;x=Math.floor(x/26)-1)result=String.fromCharCode(65+x%26)+result;return result}
function rfq(ws,supplierId,chosen){
 const st=checkedWorkspace(ws),sup=supplierMap(st).get(supplierId);
 if(!sup)fail("供应商不存在");
 const alloc=allocations(st);
 const lines=st.items.filter(it=>alloc.get(it.lineId)?.has(supplierId));
 if(!lines.length)fail("未为该供应商分配任何询价物料");
 const cols=fieldSelection("rfq",chosen);
 const cells={
  lineId:it=>it.lineId,code:it=>String(it.id),name:it=>it.name,quantity:it=>it.qty,
  unit:it=>it.unit,price:()=>"",status:()=>"",category:it=>it.cat||"",spec:it=>it.spec||"",
  lead:()=>"",moq:()=>"",remark:()=>""
 };
 const rows=[cols.map(f=>f.name),...lines.map(it=>cols.map(f=>cells[f.key](it)))];
 return{
  kind:"rfq",supplierId,items:lines.length,
  filename:"SRM_询价单_"+safeFilename(supplierId)+"_"+safeFilename(sup.name)+".xlsx",
  sheets:[{name:"供应商报价填写",rows}],
  fields:cols.map(x=>x.key)
 };
}
function comparison(ws,selectedSuppliers,selectSummary,selectHistory){
 const st=checkedWorkspace(ws),supMap=supplierMap(st);
 const ids=[...new Set(selectedSuppliers||[])];
 if(ids.length<2)fail("请明确选择至少两家供应商");
 if(ids.length>10)fail("一次最多比较 10 家供应商，避免横向表过宽");
 for(const id of ids)if(!supMap.has(id))fail("比较组包含不存在的供应商："+id);
 const allocation=allocations(st);
 const activeItems=st.items.filter(it=>ids.some(id=>allocation.get(it.lineId)?.has(id)));
 if(!activeItems.length)fail("选定供应商没有分配任何询价物料");
 const award=pairs(st,"awards"),reasons=pairs(st,"awardReasons"),reviews=new Set(st.awardReviewIds);
 const chosen=fieldSelection("summary",selectSummary),historyCols=fieldSelection("history",selectHistory);
 const hdr=chosen.map(f=>f.name);
 const supplierLabels=ids.map(id=>supMap.get(id).name+" ("+id+")");
 // Each supplier gets price, row amount and provenance; never fabricate prices.
 for(const label of supplierLabels)hdr.push(label+" 适用单价",label+" 行金额",label+" 报价轮次");
 const body=[],commonAmounts=new Map(ids.map(id=>[id,0]));
 let commonCount=0;
 const sourceValues={
  lineId:it=>it.lineId,code:it=>it.id,name:it=>it.name,category:it=>it.cat||"",
  spec:it=>it.spec||"",ref1:it=>it.ref1||"",ref2:it=>it.ref2||"",purchaseUnit:it=>it.purchaseUnit||"",
  quantity:it=>it.qty,unit:it=>it.unit
 };
 for(const it of activeItems){
  const quotes=ids.map(id=>latestConfirmedQuote(st,id,it.lineId));
  const prices=quotes.map(x=>effectivePrice(x?.line,it.qty));
  const common=prices.every(x=>Number.isFinite(x)&&x>=0);
  if(common){
   commonCount++;
   ids.forEach((id,i)=>commonAmounts.set(id,commonAmounts.get(id)+amountCents(it.qty,prices[i])));
  }
  const valid=prices.filter(x=>Number.isFinite(x)&&x>=0);
  const low=valid.length?Math.min(...valid):null;
  const selected=award.get(it.lineId)||"",aprice=ids.includes(selected)?prices[ids.indexOf(selected)]:null;
  const context={
   common:common?"是":"否",lowest:low,award:selected?supMap.get(selected)?.name||selected:"",
   awardPrice:aprice,awardReason:reasons.get(it.lineId)||"",
   review:reviews.has(it.lineId)?"待复核":""
  };
  const row=chosen.map(f=>sourceValues[f.key]?sourceValues[f.key](it):context[f.key]??"");
  // Generate per-supplier amounts as trusted Excel formulas for manual post-export analysis.
  const sheetRow=body.length+2;
  const qtyPos=chosen.findIndex(c=>c.key==="quantity");
  const qtyRef=excelColumn(qtyPos)+sheetRow;
  ids.forEach((id,i)=>{
   const idx=chosen.length+3*i,price=prices[i],ref=excelColumn(idx)+sheetRow,round=quotes[i]?.round;
   row.push(price==null?"":price,
    price==null?"":{formula:"=ROUND("+ref+"*"+qtyRef+",2)"},
    round?roundName(round):"");
  });
  body.push(row);
 }
 const rows=[hdr,...body];
 // The common-scope totals must never include partial supplier scopes.
 const commonFieldIdx=chosen.findIndex(x=>x.key==="common");
 const grand=["同范围合计（仅共同有效报价）",...Array(hdr.length-1).fill("")];
 const lastRow=body.length+1;
 ids.forEach((id,i)=>{
  const amountCol=chosen.length+3*i+1;
  if(commonCount===0){grand[amountCol]="";return}
  const amountRef=excelColumn(amountCol),from=amountRef+"2",to=amountRef+lastRow;
  if(commonFieldIdx>=0){
   const commonRef=excelColumn(commonFieldIdx);
   grand[amountCol]={formula:"=SUMIF("+commonRef+"2:"+commonRef+lastRow+',\"是\",'+from+":"+to+")"};
  }else{
   // Without a visible common flag, calculate the totals from validated common-scope members.
   grand[amountCol]=commonAmounts.get(id)/100;
  }
 });
 rows.push(grand);
 const historyRows=[historyCols.map(f=>f.name)];
 // Show all confirmed revisions and drafts explicitly; only confirmed history drives the matrix.
 const rounds=st.quoteRounds.filter(r=>ids.includes(r.supplierId))
  .sort((a,b)=>a.supplierId.localeCompare(b.supplierId)||a.roundNo-b.roundNo||a.revisionNo-b.revisionNo);
 for(const r of rounds){
  for(const line of r.lines){
   const it=st.items.find(x=>x.lineId===line.lineId);
   const val={
    supplierCode:r.supplierId,supplierName:supMap.get(r.supplierId)?.name||"",
    round:r.roundNo,revision:r.revisionNo,confirmed:r.status==="confirmed"?"已确认":"草稿（不可用作比价）",
    lineId:line.lineId,code:it?.id||line.itemId||"",name:it?.name||"",
    spec:it?.spec||"",ref1:it?.ref1||"",ref2:it?.ref2||"",purchaseUnit:it?.purchaseUnit||"",
    qty:it?.qty??"",unit:it?.unit||"",
    status:line.status==="quoted"?"正常报价":line.status==="noquote"?"未报价":line.status==="cannot"?"不供货":line.status,
    price:line.price??"",applicable:effectivePrice(line,it?.qty)??"",tiers:tierText(line),
    lead:line.lead??"",moq:line.moq??"",terms:r.termsNote||"",note:line.remark||"",
    evidenceType:r.evidenceType||"",evidence:r.evidenceNote||"",source:line.source||"",
    confirmedAt:r.confirmedAt||""
   };
   historyRows.push(historyCols.map(f=>val[f.key]??""));
  }
 }
 if(historyRows.length===1)historyRows.push(historyCols.map(()=> ""));
 return{
  kind:"comparison",supplierIds:ids,commonCount,totalItems:activeItems.length,
  filename:"SRM_比价议价单_"+safeFilename(ws.workspaceId)+".xlsx",
  sheets:[{name:"比价汇总",rows},{name:"报价议价明细",rows:historyRows}],
  fields:{summary:chosen.map(f=>f.key),history:historyCols.map(f=>f.key)}
 };
}
root.SRMReports=Object.freeze({fields,rfq,comparison,latestConfirmedQuote,effectivePrice});
if(typeof module!=="undefined"&&module.exports)module.exports=root.SRMReports;
})(typeof window!=="undefined"?window:globalThis);

