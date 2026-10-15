const {chromium}=require('/workspace/SRM_System/node_modules/playwright');
const fs=require('fs'),readline=require('readline');
const root='/tmp/srm-pr14-evidence/';
function record(kind,data){fs.appendFileSync(root+'actions.jsonl',JSON.stringify({time:new Date().toISOString(),kind,...data})+'\n')}
(async()=>{
 global.b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 global.c=await b.newContext({viewport:{width:1366,height:768},acceptDownloads:true});
 global.dialogMode='accept';
 global.bind=p=>{p.setDefaultTimeout(12000);p.on('dialog',async d=>{record('dialog',{url:p.url(),type:d.type(),message:d.message(),answer:dialogMode});console.log('DIALOG',d.message()); if(dialogMode==='dismiss')await d.dismiss();else await d.accept(d.type()==='prompt'?d.defaultValue():undefined)});p.on('pageerror',e=>record('pageerror',{url:p.url(),message:e.message}));p.on('console',m=>{if(['warning','error'].includes(m.type()))record('console',{url:p.url(),type:m.type(),message:m.text()})})};
 global.old=await c.newPage(); bind(old);await old.goto('http://127.0.0.1:8830');
 global.fresh=await c.newPage();bind(fresh);await fresh.goto('http://127.0.0.1:8831');
 global.p=fresh;
 global.shot=async(name,page=p)=>{await page.screenshot({path:root+name+'.png'});fs.writeFileSync(root+name+'.txt',await page.locator('body').innerText());record('screenshot',{name,url:page.url()});console.log('SCREENSHOT',name)};
 global.tell=async(label,value)=>{record('observation',{label,value});console.log(label,JSON.stringify(value))};
 console.log('READY');
 const rl=readline.createInterface({input:process.stdin});for await(const line of rl){record('command',{code:line});try{const value=await eval('(async()=>{'+line+'})()');console.log('RESULT',JSON.stringify(value));record('result',{value})}catch(e){record('driver_error',{message:e.message});console.log('DRIVER_ERROR',e.message)}}
})();
