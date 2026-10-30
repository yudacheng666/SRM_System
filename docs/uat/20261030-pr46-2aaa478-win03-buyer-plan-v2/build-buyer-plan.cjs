'use strict';
// Versioned plan/fixture preparation only. The V1 driver is reused unmodified.
// Unsupported lifecycle/assertion operations are explicitly retained and BLOCKED.
const fs=require('node:fs'),path=require('node:path');
const {PRODUCT_SHA,SOURCE_SHA256,render}=require('./toolchain-v1/schema.cjs');
const {audit,digest}=require('./source-probes.cjs');
async function build(productRoot){
 const root=__dirname,html=fs.readFileSync(path.join(productRoot,'prototype/m1-lite/index.html'),'utf8');
 const q=audit(path.join(productRoot,'prototype/m1-lite/index.html'));
 const write=(p,v)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v,null,2)+'\n');};
 write('source-review/quote-fixture-evaluation.json',q);
 const XLSX=require(path.join(productRoot,'src/m1-lite/native-xlsx.js'));
 const ids=Array.from({length:12},(_,i)=>'RFQ-L'+String(i+1).padStart(5,'0'));
 const header=['RFQ Line ID','报价单价','交期','MOQ','报价状态','物料备注'];
 const row=(id,price,note='')=>[id,price,5,1,'quoted',note];
 for(const [name,prices]of [['A-R1',ids.map((_,i)=>10+i)],['B-R1',ids.map((_,i)=>i===0?10:12+i)]]){
  const rows=[header,...ids.map((id,i)=>row(id,prices[i]))];
  write('fixtures/'+name+'.xlsx',Buffer.from(await XLSX.create([{name:'Synthetic',rows}]).arrayBuffer()));
  write('fixtures/'+name+'.csv',rows.map(x=>x.join(',')).join('\n')+'\n');
 }
 write('fixtures/partial.csv',q.partial.fixtureText);
 write('fixtures/A-R2.csv',[header,row(ids[0],'1-9:9|10+:8','虚构第二轮阶梯')].map(x=>x.join(',')).join('\n')+'\n');
 write('fixtures/A-V2.csv',[header,row(ids[0],9.5,'虚构同轮修正')].map(x=>x.join(',')).join('\n')+'\n');
 write('fixtures/overlap.csv',[header,row(ids[0],'1-9:9|9+:8','预期拒绝重叠阶梯')].map(x=>x.join(',')).join('\n')+'\n');
 function pdf(mark){
  const stream='BT /F1 18 Tf 50 770 Td (SYNTHETIC WIN03 '+mark+') Tj ET\n';
  const objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Length '+Buffer.byteLength(stream)+' >>\nstream\n'+stream+'endstream'];
  let s='%PDF-1.4\n';const offsets=[];
  objs.forEach((o,i)=>{offsets.push(Buffer.byteLength(s));s+=(i+1)+' 0 obj\n'+o+'\nendobj\n';});
  const off=Buffer.byteLength(s);s+='xref\n0 6\n0000000000 65535 f \n'+offsets.map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+off+'\n%%EOF\n';return Buffer.from(s,'ascii');
 }
 for(const [p,m]of [['pdf-v1/TST-001_A.pdf','TST001 A'],['pdf-conflict/TST-001_A.pdf','TST001 CHANGED A'],['pdf-v2/TST-001_A.pdf','TST001 B'],['pdf-v1/TST-002_A.pdf','TST002 A']])write('fixtures/'+p,pdf(m));
 const policy=JSON.parse(fs.readFileSync(path.join(root,'toolchain-v1/dialog-policy.json')));
 const partial=policy.operations.find(o=>o.id==='quote.import.commit');partial.reviewStatus='reviewed';
 partial.scenarios[0].when=['Concrete partial.csv, one valid and one skipped unknown noquote row; actual source parser puts BAD on row3'];
 partial.scenarios[0].dialogs[0].message.parameters.details.values=[q.partial.details];
 partial.scenarios.push({id:'all-valid',when:['Mutable draft; exact fixture has valid rows and zero skipped rows'],dialogs:[],postconditions:['Valid rows upserted; preview cleared; exact persisted ACK must be audited']});
 // Invalid-overlap path is an actual native alert; do NOT type it as DOM feedback.
 partial.scenarios.push({id:'all-invalid-overlap',when:['One invalid overlapping-tier row, mutable draft, validCount0/skippedCount1'],dialogs:[{type:'alert',message:{kind:'exact',value:'没有可写入的有效报价；全部 1 行仍在预览中供修改。'},decisions:['accept']}],postconditions:['No quote or persisted change; rejected preview remains']});
 const bind=anchor=>{const at=html.indexOf(anchor);if(at<0)throw Error('Source anchor missing: '+anchor);const n=html.slice(0,at).split('\n').length;return {path:'prototype/m1-lite/index.html',lines:[n,n+anchor.split('\n').length-1],anchor,sha256:SOURCE_SHA256};};
 const files=[],coverage=[];let current,n=0;
 const proof=(target,data='same-as-intended-UI-operation',revision='actual-ACK-bound')=>[
  {kind:'dom',target,require:'Visible intended state; read actual DOM, no force/hidden-control click'},
  {kind:'workspace',oracle:data,revision},
  {kind:'evidence',require:['bound session/Input/dialog events','DOM snapshot','screenshot','read-only API/SQLite and hashes as applicable']}
 ];
 function start(name,scope){current={schemaVersion:1,productSha:PRODUCT_SHA,name,purpose:'buyer-plan',scope,steps:[]};files.push({name:'actions/'+String(files.length).padStart(2,'0')+'-'+name+'.json',action:current});}
 function add(s){s.id='W03-'+String(++n).padStart(3,'0');current.steps.push(s);coverage.push({file:files.at(-1).name,stepIndex:current.steps.length-1,...s});}
 function native(id,scenario,opts={}){
  const op=policy.operations.find(x=>x.id===id),sc=op?.scenarios.find(x=>x.id===scenario);if(!sc)throw Error('Unknown '+id+'/'+scenario);
  const input={type:sc.dialogs.length?'dialogClick':op.stepTypes[0],operation:id,selector:op.selector,scenario,dialog:sc.dialogs.length?'expected':'none'};
  if(input.type==='fill')input.text=opts.text??'';if(input.type==='file')input.files=opts.files;
  if(opts.key){input.type='key';delete input.text;input.key=opts.key;}
  if(sc.dialogs.length)input.expect=sc.dialogs.map((d,i)=>{
   const values={};for(const [k,r]of Object.entries(d.message.parameters??{}))values[k]=opts.values?.[k]??(r.kind==='integer'?r.min:r.values[0]);
   const a={type:d.type,message:render(d.message,values),values,accept:opts.accept??true};
   if(d.type==='prompt'){a.defaultPrompt=d.defaultPrompt.values[0];a.promptText={mode:a.accept?'text':'cancel',...(a.accept?{value:opts.promptTexts?.[i]??a.defaultPrompt}:{})};}return a;
  });
  if(opts.cancelAt!==undefined){input.expect=input.expect.slice(0,opts.cancelAt+1);input.expect.at(-1).accept=false;input.expect.at(-1).promptText={mode:'cancel'};}
  add({kind:'native',input,branch:sc.when.join('; '),source:{...op.source,path:policy.source.path,sha256:SOURCE_SHA256},postconditions:opts.post??proof(op.selector),capability:'V1.native-input'});
 }
 function register(sel,type,anchor){
  const old=policy.operations.find(o=>o.selector===sel);if(old){if(!old.stepTypes.includes(type))throw Error('Unreviewed type extension');return old.id;}
  const b=bind(anchor),id='reviewed-'+policy.operations.length;
  policy.operations.push({id,selector:sel,stepTypes:[type],source:{function:anchor,lines:b.lines,anchor},reviewStatus:'reviewed',scenarios:[{id:'valid',when:['Exact fictional fixture; enabled visible control; reviewed no-dialog branch'],dialogs:[],postconditions:['Per-step explicit data/UI postconditions mandatory']}]});return id;
 }
 const click=(sel,anchor,post)=>native(register(sel,'click',anchor),'valid',{post});
 const fill=(sel,text,anchor=sel.slice(1))=>native(register(sel,'fill',anchor),'valid',{text});
 function control(kind,selector,anchor,args,branch,capability,post=proof(selector),file='html'){
  let source;
  if(file==='html')source=bind(anchor);
  else {const text=fs.readFileSync(path.join(productRoot,file),'utf8'),at=text.indexOf(anchor);if(at<0)throw Error('Aux anchor missing '+file);const ln=text.slice(0,at).split('\n').length;source={path:file,lines:[ln,ln],anchor,sha256:digest(text)};}
  add({kind,selector,dialog:'none',source,args,branch,postconditions:post,capability});
 }
 const select=(sel,value)=>control('select',sel,sel.slice(1),{value},'Native keyboard option selection; no assignment of DOM/business state','view-controls');
 const checked=(sel,value,anchor=sel.slice(1))=>control('checked',sel,anchor,{value},'Idempotent checkbox based on actual checked state','view-controls');
 const open=(sel,target,anchor=sel.slice(1))=>control('ensure-open',sel,anchor,{target},'Inspect target first; click only when hidden; no duplicate toggle','view-controls');
 const upload=(sel,ps)=>control('file',sel,sel.slice(1),{files:ps},'Exact manifest-listed fictional file paths only; no business API writes','view-controls');
 const saved=(expected)=>control('save-barrier',null,'window.dispatchEvent(new CustomEvent("srm:workspace-saved"',{expected},'Prearm observer BEFORE preceding mutation; pending→real PUT200→event dirty=false; do not infer success from label','save-sqlite-oracle',[
  {kind:'save',require:'pre r, actual acknowledged n>=r+1 for changed state; memory/API/readonly SQLite exact at n; no unrelated RFQ writes'},
  {kind:'expected',value:expected},{kind:'evidence',require:['pre revision/state','pending timeline','request/response revision','srm:workspace-saved','SQLite snapshot','F5 comparison']}
 ]);
 const reload=()=>control('reload',null,'window.addEventListener("beforeunload"',{key:'F5'},'Saved idle first; unexpected beforeunload stops safely','save-sqlite-oracle',proof('#srmUxWorkspaceSaveSummary','exact memory/API/SQLite/history/PDF before-after','exact-equal'));
 const download=(sel,kind,args)=>control('download',sel,sel.slice(1),{artifact:kind,...args},'Prearm bound download event before GUI click; inspect actual completed file, never use API writes','download-oracle',[
  {kind:'download',require:'WillBegin/progress completion + actual file path/size/hash; nested ZIP CRC, XLSX fields and PDF bytes'},
  {kind:'expected',value:args},{kind:'workspace',oracle:'all rows/history/PDF unchanged by export',revision:'exact-equal'}
 ]);
 start('baseline-rebuild','Fresh own root only; actual UI recreates same synthetic A/12/2, no legacy database restore');
 native('workspace.new','initial-empty');native('workspace.rename','valid');native('workspace.name','valid',{text:'虚构 WIN03 Alert 验收 A'});native('workspace.name','valid',{key:'Enter'});saved({projectName:'虚构 WIN03 Alert 验收 A',items:0});
 native('nav.items','valid');open('#toggleItemIntake','#itemIntake','toggleItemIntake.onclick');native('items.file','valid',{files:['fixtures/items12.xlsx']});
 control('wait-visible','#confirmImportRows','confirmImportRows',{enabled:true},'Async preview must exist before enabled check','view-controls');
 native('materials.confirm','valid-no-conflict');saved({items:12,lineIds:ids,quantities:ids.map((_,i)=>i+2)});reload();
 native('nav.assign','valid');open('#uiOpenSupplierTools','#uiSupplierTools');native('suppliers.file','valid',{files:['fixtures/suppliers.xlsx']});
 control('wait-visible','#pilotImportSupplierConfirm','pilotImportSupplierConfirm',{enabled:true},'Validated async supplier preview','view-controls');native('supplier.import','valid');saved({items:12,suppliers:['SUP-A','SUP-B'],links:0});
 start('supplier-allocation','Exact A/12/2 baseline; no quote history');
 native('nav.assign','valid');native('assign.selectAll','valid');
 for(const sid of ['SUP-A','SUP-B']){native('supplier.add.'+sid,'twelve-unlinked');saved({supplier:sid,lineIds:ids,linksForSupplier:12,totalLinks:sid==='SUP-A'?12:24});reload();native('nav.assign','valid');if(sid==='SUP-A')native('assign.selectAll','valid');}
 native('assign.selectAll','valid');control('duplicate-assignment',"#supplierList [data-add='SUP-B']",'if(!affected.length){flash("没有需要修改的关联。");return}',{supplier:'SUP-B',links:24},'Already linked all12: no confirm; unchanged state/revision; only flash','view-controls',proof('#assignItemCount','exact-equal','exact-equal'));
 start('drawing-upload-version','Before quotes; service.store occurs BEFORE same-name/version GUI conflict: unreferenced file may be stored');
 native('nav.items','valid');open('#uiOpenDrawings','#uiDrawingTools');
 for(const [line,name]of [[ids[0],'TST-001_A.pdf'],[ids[1],'TST-002_A.pdf']]){
  select('#pilotDrawingLine',line);fill('#pilotDrawingVersion','A');upload('#pilotDrawingFiles',['fixtures/pdf-v1/'+name]);click('#pilotDrawingUpload','upload.onclick=async()=>{');
  saved({line,name,revision:'A',sha256:digest(fs.readFileSync(path.join(root,'fixtures/pdf-v1/'+name)))});
  control('pdf-preview','[data-drawing="'+line+'"]','data-drawing=',{line},'Resolve exact source-bound dynamic thumbnail and own PDF viewer target; verify original bytes/render','pdf-preview',proof('#pilotDrawingInfo','actual PDF response hash + visible viewer'));
 }
 select('#pilotDrawingLine',ids[0]);upload('#pilotDrawingFiles',['fixtures/pdf-conflict/TST-001_A.pdf']);click('#pilotDrawingUpload','upload.onclick=async()=>{',[
  {kind:'dom',target:'#pilotDrawingInfo',require:'图纸导入未完成：同名且同版本图纸已有不同内容，必须更换版本号：TST-001_A.pdf'},
  {kind:'workspace',oracle:'association/history/state unchanged; original PDF bytes kept; may add unreferenced asset',revision:'exact-equal'},
  {kind:'evidence',require:['asset inventory before/after','no incorrect association','DOM error, not JS alert']}
 ]);
 fill('#pilotDrawingVersion','B');upload('#pilotDrawingFiles',['fixtures/pdf-v2/TST-001_A.pdf']);click('#pilotDrawingUpload','upload.onclick=async()=>{');saved({line:ids[0],revision:'B',versionsOnLine:2});
 for(const id of ids.slice(2)){select('#pilotDrawingLine',id);select('#pilotDrawingRequirement','not_required');click('#pilotDrawingStatusSet','applyStatus.onclick=()=>{');}saved({pdfLinks:3,notRequired:10});reload();
 start('supplier-packages','Both suppliers12 assigned rows; valid versions, no missing/pending. Visible supplier manifest is allowed; internal association state is forbidden');
 open('#pilotReportOpen','#pilotReportPanel');select('#pilotReportType','rfq');
 for(const sid of ['SUP-A','SUP-B']){select('#pilotReportSupplier',sid);download('#pilotReportDownload','supplier-'+sid,{supplier:sid,lines:12,pdfLinks:3,missing:0,pending:0,noOtherSupplierOrQuotes:true,noInternalRelationJson:true,allowPublic:'图纸关联清单.json'});}
 download('#pilotReportDownloadAll','all-suppliers',{entries:['RFQ_SUP-A.zip','RFQ_SUP-B.zip'],validateEachNestedSupplier:true,originalPdfBytes:true});
 start('quotes','Partial cancel/accept; five-prompt cancels; invalid tier; full R1, revision, R2, explicit carry and manual intake');
 click(".srm-v2-sideitem[data-srm-v2-tab='quoteImport']",'data-srm-v2-tab="quoteImport"');select('#quoteImportSupplier','SUP-A');click('[data-srm-ux-input-mode="paste"]','data-srm-ux-input-mode="paste"');
 fill('#quotePaste',q.partial.fixtureText);click('#quoteParsePaste','quoteParsePaste.onclick=');
 native('quote.import.commit','partial-fixture',{accept:false,post:proof('#quoteImportPreview','cancel keeps draft/persisted state/revision and two preview rows','exact-equal')});
 native('quote.import.commit','partial-fixture',{post:proof('#quoteImportFeedback','only RFQ-L00001 price10/lead5/MOQ1 accepted; BAD row3 retained; other11missing')});saved({round:1,version:1,quoteLines:1,missing:11});click('#quoteClearPreview','quoteClearPreview.onclick=');
 for(let cancelAt=0;cancelAt<5;cancelAt++)native('quote.line.edit','draft-line-zero',{cancelAt,post:proof('#quoteRoundBody','entire line unchanged after cancel prompt '+cancelAt,'exact-equal')});
 native('quote.line.edit','draft-line-zero',{promptTexts:['10','5','1','quoted','']});
 fill('#quotePaste',fs.readFileSync(path.join(root,'fixtures/overlap.csv'),'utf8'));click('#quoteParsePaste','quoteParsePaste.onclick=');native('quote.import.commit','all-invalid-overlap',{post:proof('#quoteImportPreview','no line/revision change; invalid preview kept','exact-equal')});click('#quoteClearPreview','quoteClearPreview.onclick=');
 for(const sid of ['SUP-A','SUP-B']){
  select('#quoteImportSupplier',sid);click('[data-srm-ux-input-mode="file"]','data-srm-ux-input-mode="file"');upload('#quoteImportFile',['fixtures/'+(sid==='SUP-A'?'A':'B')+'-R1.xlsx']);
  control('wait-visible','#commitQuoteImport','commitQuoteImport.onclick=',{enabled:true,previewRows:12},'Fresh XLSX parsed; stale or invalid preview rejected','view-controls');
  native('quote.import.commit','all-valid');fill('#quoteEvidenceNote','虚构WIN03 '+sid+'R1凭证');native('quote.round.confirm','coverage-complete');saved({supplier:sid,round:1,version:1,status:'confirmed',lines:12});
 }
 select('#quoteImportSupplier','SUP-A');
 control('capture-history','#quoteRoundSummary','已确认提交不可覆盖修改。',{name:'A-R1V1'},'Capture immutable full round before all subsequent mutations','save-sqlite-oracle',proof('#quoteRoundSummary','canonical historical round capture'));
 click('#newQuoteRevision','newQuoteRevision.onclick=');click('[data-srm-ux-input-mode="paste"]','data-srm-ux-input-mode="paste"');fill('#quotePaste',fs.readFileSync(path.join(root,'fixtures/A-V2.csv'),'utf8'));click('#quoteParsePaste','quoteParsePaste.onclick=');native('quote.import.commit','all-valid');native('quote.round.confirm','coverage-complete');saved({supplier:'SUP-A',round:1,version:2,lines:12,previousVersion:'exact A-R1V1'});
 click('#newQuoteRound','newQuoteRound.onclick=');fill('#quotePaste',fs.readFileSync(path.join(root,'fixtures/A-R2.csv'),'utf8'));click('#quoteParsePaste','quoteParsePaste.onclick=');native('quote.import.commit','all-valid');
 native('quote.round.confirm','coverage-anomalies',{accept:false,values:{missing:11,extra:0,duplicate:0},post:proof('#qcMissing','11missing; NOT zero quote; still draft')});
 click('#carryForwardMissing','carryForwardMissing.onclick=');
 for(const id of ids.slice(1))checked('[data-carry-line="'+id+'"]',true,'data-carry-line');
 fill('#carryEvidenceNote','虚构供应商逐项确认原轮原条件');checked('#carryConfirmSource',true);native('quote.carry.confirm','explicit-evidence',{values:{count:11}});native('quote.round.confirm','coverage-complete');saved({supplier:'SUP-A',round:2,version:1,lines:12,carried:11,effectiveQty2:9,history:'A-R1V1 immutable'});
 select('#quoteImportSupplier','SUP-B');click('#newQuoteRevision','newQuoteRevision.onclick=');click('[data-srm-ux-input-mode="manual"]','data-srm-ux-input-mode="manual"');
 for(const [s,v]of [['#quoteManualItem',ids[1]],['#quoteManualPrice','15'],['#quoteManualLead','5'],['#quoteManualMoq','1'],['#quoteManualRemark','虚构手工修正']])fill(s,v);
 select('#quoteManualStatus','quoted');click('#quoteManualAdd','quoteManualAdd.onclick=');native('quote.import.commit','all-valid');native('quote.round.confirm','coverage-complete');saved({supplier:'SUP-B',round:1,version:2,lines:12,priceLine2:15});
 start('comparison','DOM reason modal is not native confirm. A9*2 + B15*3 =63 for two manual awards');
 click(".srm-v2-sideitem[data-srm-v2-tab='quotes']",'data-srm-v2-tab="quotes"');
 click('#quoteTable [data-award="'+ids[0]+'|SUP-A"] .quotePrice','data-award=');saved({manual:[ids[0]],noReason:true});
 const expensive='#quoteTable [data-award="'+ids[1]+'|SUP-B"] .quotePrice';click(expensive,'data-award=');click('#awardReasonConfirm','awardReasonConfirm.onclick=',proof('#awardReasonValidation','请填写非最低价选择的具体原因；未保存任何更改。'));click('#awardReasonCancel','awardReasonCancel.onclick=');
 click(expensive,'data-award=');fill('#awardReasonInput','虚构交期与服务优先');click('#awardReasonConfirm','awardReasonConfirm.onclick=');saved({manual:[ids[0],ids[1]],manualCount:2,manualAmount:63,reasonLine2:'虚构交期与服务优先'});
 open('#pilotReportOpen','#pilotReportPanel');select('#pilotReportType','comparison');for(const sid of ['SUP-A','SUP-B'])checked('[data-report-supplier="'+sid+'"]',true,'data-report-supplier');download('#pilotReportDownload','comparison',{sheets:2,manualCount:2,manualAmount:63,missingNotZero:true,fullHistory:true});
 start('persistence-offline','F5; own BAT only; second independent project; offline saved label must be truthful');
 reload();
 const bat=(kind,args,post)=>control(kind,null,'set "SERVER=%~dp0backend\\server.py"',args,'Native Windows own-task PID/port/paths only; no unknown process termination','windows-lifecycle',post??proof('#srmUxWorkspaceSaveSummary','all stored rows/revisions/history/PDF unchanged'),'prototype/m1-lite/run_local.bat');
 bat('service-restart',{cwd:'new Chinese space directory',port:8765});
 click(".srm-v2-sideitem[data-srm-v2-tab='project']",'data-srm-v2-tab="project"');native('workspace.new','saved-buyer');native('workspace.rename','valid');native('workspace.name','valid',{text:'虚构 WIN03 B'});native('workspace.name','valid',{key:'Enter'});saved({projectName:'虚构 WIN03 B',items:0,suppliers:0,oldA:'unchanged'});
 control('select-archived-project','#pilotHistoryWorkspace','const historyPicker=document.getElementById("pilotHistoryWorkspace")',{name:'虚构 WIN03 Alert 验收 A'},'Resolve runtime workspace ID by exact name; do not hardcode historical ID','view-controls');
 native('workspace.switch','clean');bat('service-stop',{port:8765});
 native('workspace.rename','valid');native('workspace.name','valid',{text:'虚构 WIN03 A 离线修改'});native('workspace.name','valid',{key:'Enter'});
 control('offline-save','#pilotSaveWorkspace','未保存成功，请不要关闭页面：',{},'Service truly unavailable; explicit save; draft retained; no successful PUT; persisted data unchanged','save-sqlite-oracle',proof('#srmUxWorkspaceSaveSummary','truthful failed/unsaved, no false success'));
 bat('service-restart',{cwd:'repository root',port:8765});native('workspace.save','valid');saved({projectName:'虚构 WIN03 A 离线修改',history:'exact'});reload();
 start('backup-restore','GUI actual full archive; separate empty target; normal nonempty UI early-return vs a separately needed backend409 race');
 click('#uiAdminToggle','one("uiAdminToggle").addEventListener("click"');download('#pilotS4DownloadFull','s4-full',{workspaces:2,pdfLinks:3,allRevisions:true,sqliteIntegrity:'ok',manifestHashes:true,originalPdfBytes:true});
 bat('empty-restore-target',{newRandomDataRoot:true,sourceDataUntouched:true,port:8765});
 control('downloaded-file','#pilotS4BackupFile','s4FileInput.files?.[0]',{artifact:'s4-full'},'Use actual completed captured backup; never a preseeded fake ZIP','download-oracle');
 native('s4.restore','fresh-empty-target');
 control('restore-audit',null,'if(!result.verified||!result.restored)',{artifact:'s4-full',workspaces:2},'Wait verified/restored response and reload; compare all versions/rows/history/PDF bytes','save-sqlite-oracle');
 control('downloaded-file','#pilotS4BackupFile','s4FileInput.files?.[0]',{artifact:'s4-full'},'Same valid backup on already restored nonempty target','download-oracle');
 control('nonempty-ui-refusal','#pilotS4RestoreFull','if(buyerMode){restoreNotice("当前数据目录已有询价',{restoreRequests:0},'buyerMode true: DOM warning only; NO confirm, NO restore HTTP, not409','view-controls',proof('#pilotS4RestoreFeedback','当前数据目录已有询价，不能直接覆盖恢复。; all target persistent state unchanged','exact-equal'));
 control('nonempty-server-race','#pilotS4RestoreFull','RESTORE_TARGET_NOT_EMPTY',{expectedHttp:409,twoSessions:true},'NEEDS REVIEW: stale empty page plus target populated by another GUI session; exact session/dialog/timing fixture not approved','nonempty-409-race',proof('#pilotS4RestoreFeedback','actual backend409; all logical rows/PDF/persistent file bytes unchanged','exact-equal'));
 start('layout','Actual 1366x768 first priced row complete and 960 layout; no static-source visibility claims');
 for(const [width,height]of [[1366,768],[960,768]]){
  control('viewport',null,'body.srm-v2',{width,height},'Native Edge viewport/DPR recorded','layout-observer');
  click(".srm-v2-sideitem[data-srm-v2-tab='quotes']",'data-srm-v2-tab="quotes"');
  control('layout-check','#quoteTable tbody tr','data-srm-ux-pending',{width,height,firstRowFullyVisible:width===1366},'Actual populated row, scrollY0, clipping/overlay and screenshot;960 usable scrolling','layout-observer',proof('#quoteTable','actual visible layout; data unchanged','exact-equal'));
 }
 const capabilities={
  'V1.native-input':{status:'reviewed',implementation:'toolchain-v1/guarded-driver.cjs'},
  'view-controls':{status:'needs-review',reason:'V1 no select/checked/ensure-open/typed wait/file PDF dispatcher; declare exact source-bound actions but cannot relabel as unchecked checkpoint.'},
  'save-sqlite-oracle':{status:'needs-review',reason:'V1 postconditions are prose, not executable save observer/F5/read-only SQLite oracle; must add prearmed ACK-bound runtime assertions.'},
  'download-oracle':{status:'needs-review',reason:'V1 has no download event/completed-file/nested ZIP+XLSX/PDF validation dispatcher; fixtures are not downloaded results.'},
  'pdf-preview':{status:'needs-review',reason:'Own PDF viewer multi-target session and actual rendering/hash observation requires a reviewed guard/adapter extension.'},
  'windows-lifecycle':{status:'needs-review',reason:'Own BAT PID ancestry/port ownership/restart/empty target switching not implemented by V1; old Windows PIDs/paths may not be reused.'},
  'nonempty-409-race':{status:'needs-review',reason:'Ordinary nonempty GUI blocks before HTTP. Need reviewed two-session GUI-only population/stale-empty-page fixture to actually reach409 without API business writes.'},
  'layout-observer':{status:'needs-review',reason:'V1 has no viewport/row clipping screenshot assertion dispatcher; cannot infer real visibility from CSS.'}
 };
 write('dialog-policy.reviewed.json',policy);
 for(const f of files)write(f.name,f.action);
 const fixtures=[];function walk(d){for(const name of fs.readdirSync(d)){const p=path.join(d,name);if(fs.statSync(p).isDirectory())walk(p);else {const b=fs.readFileSync(p);fixtures.push({path:path.relative(root,p).split(path.sep).join('/'),bytes:b.length,sha256:digest(b)});}}}walk(path.join(root,'fixtures'));
 write('fixture-manifest.json',{productSha:PRODUCT_SHA,fictional:true,files:fixtures,expected:{lineIds:ids,quantities:ids.map((_,i)=>i+2),supplierIds:['SUP-A','SUP-B'],assignmentLinks:24,partialMessage:q.partial.message,manualCount:2,manualAmount:63}});
 write('capabilities.json',capabilities);write('source-to-action.json',coverage);
 write('buyer-manifest.json',{schemaVersion:1,productSha:PRODUCT_SHA,sourceSha256:SOURCE_SHA256,purpose:'buyer-plan',entry:'fresh-ui-rebuild',actionFiles:files.map(f=>f.name),requiresSeparateWindowsAuthorization:true,executionStatus:'PLAN BLOCKED: NEEDS REVIEW',noApiBusinessWrites:true});
 return {actionFiles:files.length,steps:n,fixtures:fixtures.length};
}
module.exports={build};if(require.main===module)build(path.resolve(process.argv[2])).then(x=>console.log(JSON.stringify(x))).catch(e=>{console.error(e.stack);process.exitCode=1;});
