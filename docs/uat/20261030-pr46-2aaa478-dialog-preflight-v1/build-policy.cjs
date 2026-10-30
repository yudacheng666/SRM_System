'use strict';
// Reproducible TEST-ONLY policy/contract fixture generator. No product writes,
// browser, HTTP or subprocess calls. These fixtures are NOT a buyer UAT plan.
const fs=require('node:fs'),path=require('node:path');
const {PRODUCT_SHA,SOURCE_SHA256,render}=require('./schema.cjs');
const exact=value=>({kind:'exact',value});
const num=(min=0,max=12)=>({kind:'integer',min,max});
const choices=(...values)=>({kind:'enum',values});
const template=(template,parameters)=>({kind:'template',template,parameters});
const confirm=message=>({type:'confirm',message,decisions:['accept','cancel']});
const alert=message=>({type:'alert',message,decisions:['accept']});
const prompt=(message,...defaults)=>({type:'prompt',message:exact(message),decisions:['accept','cancel'],defaultPrompt:choices(...defaults)});
const ops=[];
function op(id,selector,fn,lines,anchor,scenarios,types=['click','dialogClick']){ops.push({id,selector,stepTypes:types,reviewStatus:id==='quote.import.commit'?'needs-review':'reviewed',source:{function:fn,lines,anchor},scenarios});}
const scenario=(id,when,dialogs,postconditions)=>({id,when:[when],dialogs,postconditions});
const persisted=['UI pending→saved for this modification','Exact workspace SQLite revision/data match','F5 preserves expected data'];
const scope=Array.from({length:8},(_,i)=>`TST-${String(i+1).padStart(3,'0')}（规格：未填写，RFQ-L${String(i+1).padStart(5,'0')}）`).join('、')+' 等 12 项';
const importDone=(conflict=false)=>template('新增 {added} 行；自动合并 {merged} 行；冲突确认分行 {separated} 行。合并前原始需求行已留存。',{added:num(conflict?1:12,conflict?1:12),merged:num(0,0),separated:num(conflict?1:0,conflict?1:0)});
op('materials.confirm','#confirmImportRows','addRowsToRfq',[4086,4117],'function addRowsToRfq(rows)',[
 scenario('valid-no-conflict','Valid current preview: 12 new fictional rows, no conflict/error',[alert(importDone())],persisted),
 scenario('explicit-conflict-fixture','Separate fixture: exactly1 conflicting row; valid current preview',[confirm(template('有 {count} 条相同编码存在属性或业务冲突，不能自动合并。是否明确保留为独立 RFQ 询价行？取消则本批次不导入。',{count:num(1,1)})),alert(importDone(true))],['Cancel leaves whole batch untouched',...persisted])]);
for(const sid of ['SUP-A','SUP-B']){
 const name=sid==='SUP-A'?'虚构供应商A':'虚构供应商B';
 op('supplier.add.'+sid,`#supplierList [data-add='${sid}']`,'applySupplierBulkChange',[4907,5016],'function applySupplierBulkChange(lineIds,sid,mode,label)',[
  scenario('twelve-unlinked','Exactly12 selected TST rows, no prior quote history, not linked to this supplier',[confirm(template('为选中物料添加供应商：即将变更 {count} 条物料与“{supplier}”的实际关联。\n涉及物料：{scope}\n注意：筛选后仍选中的隐藏物料也包含在内。\n确认后立即生效，是否继续？',{count:num(12,12),supplier:choices(name),scope:choices(scope)}))],['All12 exact supplier links (or unchanged on cancel)',...persisted])]);
}
op('item.edit.save','#itemEditSave','saveItemEdit',[3769,3784],'function saveItemEdit()',[
 scenario('valid-edit','Valid mutable item; no quote-history guard',[confirm(exact('保存此询价行修改？RFQ Line ID 和已分配供应商保持不变。'))],['LineID and existing suppliers unchanged',...persisted])]);
op('drawing.unlink','#pilotDrawingUnlink','unlink.onclick',[5519,5526],'解除当前物料与这份图纸的关联？PDF 原件和其他物料的关联仍会保留。',[
 scenario('mutable-linked-row','Existing selected PDF and mutable current row',[confirm(exact('解除当前物料与这份图纸的关联？PDF 原件和其他物料的关联仍会保留。'))],['Only chosen link removed; originalPDF/other links preserved',...persisted])]);
op('drawing.batch.confirm','#pilotBatchDrawingConfirm','batch drawing accept',[5680,5700],'确认将 ',[
 scenario('valid-batch','Unique checked PDF candidates; unchanged baseline',[confirm(template('确认将 {pdfs} 份 PDF 关联到 {items} 条 RFQ 物料？请先核对编码、图号、行号和版本。保存后再用于供应商询价包。',{pdfs:num(1),items:num(1)}))],['PDF hashes/LineIDs/versions and reload/package bytes',...persisted])]);
op('quote.line.edit',"#quoteRoundBody [data-edit-quote='0']",'editQuoteLine',[4607,4612],'function editQuoteLine(index)',[
 scenario('draft-line-zero','Fixture draft round; line0 defaults price10/lead5/MOQ1/quoted/empty remark',[
  prompt('单价 / 阶梯价：','10'),prompt('交期（天，可空）：','5'),prompt('MOQ（可空）：','1'),prompt('状态：quoted / noquote / cannot','quoted'),prompt('物料备注（可空）：','')],['Cancel any prompt leaves entire edit unchanged','All5 accepted => exact field values; historical versions unchanged',...persisted])]);
op('quote.round.confirm','#confirmQuoteRound','confirmQuoteRound.onclick',[4653,4653],'覆盖检查仍有异常：漏报 ',[
 scenario('coverage-anomalies','Nonempty mutable round with explicit coverage anomaly counts',[confirm(template('覆盖检查仍有异常：漏报 {missing} 项，多报 {extra} 项，重复 {duplicate} 项。仍要确认并锁定本次提交吗？',{missing:num(1),extra:num(),duplicate:num()}))],['Confirmed lock and exact coverage; immutable history',...persisted]),
 scenario('coverage-complete','No missing/extra/duplicate; valid notes and nonempty draft',[],['No dialog; confirmed locked round',...persisted])]);
op('quote.import.commit','#commitQuoteImport','commitQuoteImport.onclick',[4680,4707],'是否只提交 ',[
 scenario('partial-fixture','NEEDS REVIEW: concrete fixture not yet finalized; proposed unknown-item noquote row2/BAD',[confirm(template('本次共 {total} 行，可提交 {valid} 行，拒绝/待检查 {skipped} 行。\n以下错误行不会保存，完整清单留在预览中：\n{details}\n是否只提交 {valid} 行？',{total:num(2,2),valid:num(1,1),skipped:num(1,1),details:choices('2 行 BAD：多报')}))],['Only valid row committed; skipped row remains preview',...persisted])]);
// Details text above is a separate contract fixture, not a claim about current UI.
op('quote.carry.confirm','#confirmCarrySelection','confirmCarrySelection.onclick',[4740,4753],'确定按原轮次和原条件沿用这 ',[
 scenario('explicit-evidence','Selected carry rows; checked source and nonempty evidence',[confirm(template('确定按原轮次和原条件沿用这 {count} 项吗？其余漏报项保持漏报状态。',{count:num(1)})),alert(template('已按供应商确认依据沿用 {count} 项，其余漏报项目不变。',{count:num(1)}))],['Only selected rows carried with evidence; missing remain missing',...persisted])]);
op('supplier.remove',"#supplierFirstList [data-pool-remove='SUP-A']",'supplier remove handler',[4921,4932],'移出本次询价？',[
 scenario('no-history','SUP-A has no confirmed/nonempty quote history; mutable lines',[confirm(template('将“{supplier}”移出本次询价？\n同时会取消它当前关联的 {count} 个物料。',{supplier:choices('虚构供应商A'),count:num()}))],['Only this supplier links removed; protected history unchanged',...persisted])]);
op('s4.restore','#pilotS4RestoreFull','restoreS4Full',[6376,6394],'async function restoreS4Full()',[
 scenario('fresh-empty-target','Own truly empty data dir; valid selected full backup; buyerMode=false',[confirm(exact('确定将完整备份恢复到当前空白数据目录？系统会先校验文件；若目录已有数据，将拒绝恢复。'))],['Verified/restored counts; reloadworkspace/PDF identity','Nonempty409 is HTTP feedback, never a dialog',...persisted])]);
for(const [id,selector,message] of [
 ['export.all','#pilotReportDownloadAll','本批次缺图 {missing} 条、版本待确认 {pending} 条。待确认版本的 PDF 不会打包。仍导出已完成部分吗？'],
 ['export.one','#pilotReportDownload','这家供应商缺图 {missing} 条、版本待确认 {pending} 条（这些 PDF 暂不打包），是否导出已完成部分？']])op(id,selector,id,[6690,6764],id==='export.all'?'本批次缺图 ':'这家供应商缺图 ',[
  scenario('missing-drawing','withDrawing and missing>0; explicit pending count',[confirm(template(message,{missing:num(1),pending:num()}))],['ActualZIP download; supplier filename/content isolation; PDF byte identity']),
  scenario('complete-drawings','No missing/pending or withDrawing=false',[],['Actual correct download; no dialog'])]);
op('workspace.new','#pilotNewWorkspace','beginBuyer',[6059,6067],'function beginBuyer()',[
 scenario('initial-empty','Initial buyerMode=false; fresh isolated data directory',[],['New workspace identity; no prior RFQ overwrite',...persisted]),
 scenario('saved-buyer','buyerMode=true and no unsaved business change',[confirm(exact('新建一笔空白询价？原来已保存的询价不会被删除。'))],persisted),
 scenario('dirty-buyer','buyerMode=true and unsaved business change',[confirm(exact('当前询价尚有未保存修改，新建将放弃这些修改。继续？'))],['Accept discards only active unsaved state; cancel preserves it',...persisted])]);
op('workspace.recover','#pilotResumeWorkspace','recover',[6068,6080],'async function recover()',[
 scenario('dirty-buyer','buyerMode=true, dirty=true',[confirm(exact('重新读取已保存询价会放弃当前未保存修改。继续？'))],['Exact saved workspace/revision, cancel preserves dirty state']),
 scenario('clean','No unsaved changes',[],['Exact saved workspace/revision'])]);
op('workspace.switch','#pilotSwitchWorkspace','switchArchived',[6081,6092],'async function switchArchived()',[
 scenario('dirty-buyer','Valid selected other workspace, buyerMode and dirty',[confirm(exact('当前未保存修改将放弃，是否切换到另一笔询价？'))],['Exact selected workspace; cancel preserves current state']),
 scenario('clean','Valid selected other workspace, no unsaved changes',[],['Exact selected workspace identity'])]);
for(const [id,selector,anchor] of [
 ['nav.items',".srm-v2-sideitem[data-srm-v2-tab='items']",'data-srm-v2-tab'],['nav.assign',".srm-v2-sideitem[data-srm-v2-tab='assign']",'data-srm-v2-tab'],
 ['items.intake','#toggleItemIntake','toggleItemIntake.onclick'],['supplier.tools','#uiOpenSupplierTools','uiOpenSupplierTools'],
 ['supplier.import','#pilotImportSupplierConfirm','pilotImportSupplierConfirm'],['assign.selectAll','#selectAssignAll','selectAssignAll.onclick'],
 ['workspace.rename','#uiRenameRfqBtn','uiRenameRfqBtn'],['workspace.save','#pilotSaveWorkspace','pilotSaveWorkspace']])op(id,selector,'UI handler',[1,7000],anchor,[scenario('valid','Reviewed valid enabled control; own isolated workspace',[],['Expected UI/state and save/reload checked separately'])],['click']);
for(const [id,selector,type,anchor] of [['workspace.name','#uiRfqNameInput','fill','uiRfqNameInput'],['items.file','#importFile','file','importFile'],['suppliers.file','#pilotSupplierExcel','file','pilotSupplierExcel'],['workspace.name.commit','#uiRfqNameInput','key','uiRfqNameInput']]){
 // Same selector can expose multiple non-click actions; keep one operation.
 const old=ops.find(o=>o.selector===selector);if(old){old.stepTypes.push(type);continue;}
 op(id,selector,'Input control',[1,7000],anchor,[scenario('valid','Valid fictional input; validation errors handled as unknown dialogs',[],['Input/preview change visible; no data write claim'])],[type]);
}
const policy={schemaVersion:1,productSha:PRODUCT_SHA,source:{path:'prototype/m1-lite/index.html',sha256:SOURCE_SHA256},operations:ops,needsReview:[
 'Drawing upload/version/hash-conflict controls and exception branches: no actions admitted until reviewed',
 'Quote manual/paste/tier/coverage fixture specifics; partial import details need actual fixture review before live UAT',
 'S4 nonempty target UI feedback versus HTTP409: distinct assertions required',
 'Other selectors, bulk supplier remove/toggle/copy and nonzero quote edit selectors are denied until separately registered',
 'This contract fixture corpus is NOT a complete procurement plan and has NOT been run in a browser'
]};
const defaults={added:12,merged:0,separated:0,count:12,supplier:'虚构供应商A',scope,pdfs:2,items:2,missing:1,extra:0,duplicate:0,total:2,valid:1,skipped:1,details:'2 行 BAD：多报',pending:0};
const steps=[];
for(const o of ops)for(const s of o.scenarios){
 if(o.reviewStatus!=='reviewed')continue;
 const step={type:s.dialogs.length?'dialogClick':o.stepTypes[0],operation:o.id,selector:o.selector,scenario:s.id,dialog:s.dialogs.length?'expected':'none'};
 if(s.dialogs.length)step.expect=s.dialogs.map(d=>{const values={};for(const k of Object.keys(d.message.parameters||{})){const rule=d.message.parameters[k];values[k]=rule.kind==='enum'?rule.values[0]:defaults[k]>=rule.min&&defaults[k]<=rule.max?defaults[k]:rule.min;}
  const a={type:d.type,message:render(d.message,values),values,accept:true};if(d.type==='prompt'){a.defaultPrompt=d.defaultPrompt.values[0];a.promptText={mode:'text',value:d.defaultPrompt.values[0]};}return a;});
 if(step.type==='fill')step.text='虚构 TEST-ONLY 合同样例';if(step.type==='file')step.files=['fixtures/'+(o.id==='items.file'?'items12':'suppliers')+'.xlsx'];steps.push(step);
}
const action={schemaVersion:1,productSha:PRODUCT_SHA,name:'STATIC-CONTRACTS-NOT-A-BUYER-PLAN',purpose:'contract-test',steps};
fs.mkdirSync(path.join(__dirname,'actions'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'dialog-policy.json'),JSON.stringify(policy,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'actions','reviewed-contracts.json'),JSON.stringify(action,null,2)+'\n');
const assignment={...action,name:'ASSIGNMENT-INTERACTION-CONTRACT-NOT-EXECUTED',steps:['assign.selectAll','supplier.add.SUP-A','supplier.add.SUP-B'].map(id=>structuredClone(steps.find(s=>s.operation===id)))};
fs.writeFileSync(path.join(__dirname,'actions','assignment-reviewed.json'),JSON.stringify(assignment,null,2)+'\n');
const bad=structuredClone(assignment);bad.name='EXPECTED-REJECTION-OF-OLD-ASSIGNMENT-MISTAKE';for(const s of bad.steps.slice(1)){s.type='click';s.dialog='none';delete s.expect;}
fs.mkdirSync(path.join(__dirname,'negative'),{recursive:true});fs.writeFileSync(path.join(__dirname,'negative','assignment-plain-click.json'),JSON.stringify(bad,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'negative','malformed.json'),'{"steps": [ invalid JSON\n');
console.log(JSON.stringify({operations:ops.length,scenarios:steps.length,notExecutedInBrowser:true}));
