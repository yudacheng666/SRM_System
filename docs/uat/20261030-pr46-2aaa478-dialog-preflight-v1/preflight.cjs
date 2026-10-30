'use strict';
// Static-only CLI: there is deliberately no launch/connect/import of CDP here.
const fs=require('node:fs'),path=require('node:path');
const {preflight}=require('./schema.cjs');
function main(args){
 if(args.length<3)throw Error('Usage: node preflight.cjs SOURCE.html OUTPUT.json ACTION.json [...]');
 const [source,output,...names]=args;
 let report;
 try{
 const policy=JSON.parse(fs.readFileSync(path.join(__dirname,'dialog-policy.json'),'utf8'));
 const loadErrors=[];
 const files=names.map(name=>{try{return {name,action:JSON.parse(fs.readFileSync(name,'utf8'))};}catch(e){loadErrors.push({file:name,stepIndex:null,selector:null,expectedPolicy:'Valid UTF-8 action JSON',actualPolicy:null,code:e instanceof SyntaxError?'JSON_PARSE':'ACTION_IO',reason:e.message});return {name,action:null};}});
 report=preflight({policy,files,sourceBytes:fs.readFileSync(source)}).report;
 if(loadErrors.length){report.errors.push(...loadErrors);report.status='REJECTED';}
 }catch(e){report={schemaVersion:1,status:'REJECTED',errors:[{file:'<policy/source>',stepIndex:null,selector:null,expectedPolicy:'Readable frozen source and versioned policy',actualPolicy:null,code:'PREFLIGHT_IO',reason:e.message}],browserStarts:0,httpBusinessRequests:0,businessWrites:0};}
 fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));return report.status==='PASS'?0:2;
}
if(require.main===module){try{process.exitCode=main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=2;}}
module.exports={main};
