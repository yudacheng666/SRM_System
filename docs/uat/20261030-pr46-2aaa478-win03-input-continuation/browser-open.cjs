const fs=require('node:fs');const path=require('node:path');const {CDP}=require('./cdp.cjs');
(async()=>{const p=JSON.parse(fs.readFileSync(path.join(__dirname,'preflight.json')));const c=await new CDP(p.browserWebSocket,path.join(__dirname,'cdp-trace.jsonl')).connect();await c.send('Target.createTarget',{url:process.argv[2]});c.close();})().catch(e=>fs.appendFileSync(path.join(__dirname,'browser-open-errors.log'),e.stack+'\n')).finally(()=>{process.exitCode=0;});
// BROWSER hook routes the server auto-open only to this task-owned fresh CDP profile.
// Returning normally also prevents Python webbrowser from falling back to a personal profile.
