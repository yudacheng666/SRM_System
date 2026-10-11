// 中文：仅在独立的 Windows 浏览器临时配置中做匿名试用测试，不接触用户的真实数据。
// English: Windows Chrome/Edge isolated-profile smoke test with synthetic buyer data only.
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {pathToFileURL} = require("node:url");
const {chromium} = require("playwright");

const channel = process.argv[2];
if (!["chrome","msedge"].includes(channel)) throw new Error("Specify browser channel chrome or msedge");
if (process.platform !== "win32") throw new Error("This UAT only runs on Windows");
const candidate = path.resolve(__dirname,"../../prototype/m1-lite/index.html");
const html = fs.readFileSync(candidate,"utf8");
assert.ok(html.includes("M1_LITE_PORTABLE_BACKUP") && html.includes("pilotExportBackup"),
  "Test candidate must contain complete standalone save and backup UI");

const root = fs.mkdtempSync(path.join(os.tmpdir(),"srm-lite-windows-anonymous-"));
const sameProfile = path.join(root,"profile-original");
const freshProfile = path.join(root,"profile-new");
const relocated = path.join(root,"another-folder","index.html");
fs.mkdirSync(path.dirname(relocated),{recursive:true});
fs.copyFileSync(candidate,relocated);
const entry = pathToFileURL(candidate).href;
const movedEntry = pathToFileURL(relocated).href;
let ctx;
const errors=[];
function watch(page){
  page.on("pageerror",err=>errors.push(err.message));
  page.on("dialog",async d=>d.accept());
}
async function launch(profile){
  return chromium.launchPersistentContext(profile,{channel,headless:true,acceptDownloads:true});
}
async function browserPage(context,url){
  const p = context.pages()[0] || await context.newPage();
  watch(p);await p.goto(url);
  return p;
}
async function state(p){
  return p.evaluate(()=>({
    mode:window.SRMPilot?.isBuyer()?"buyer":"demo",
    items:typeof items==="undefined"?null:items.length,
    supplierCount:typeof suppliers==="undefined"?null:suppliers.length,
    savedVersion:window.SRMPilot?.revision(),
    status:document.getElementById("pilotSaveStatus")?.textContent||""
  }));
}
async function waitFor(p,substring){
  await p.waitForFunction(x=>document.querySelector("#pilotSaveStatus")?.textContent.includes(x),substring,{timeout:15000});
}
async function ready(p){
  await p.waitForFunction(()=>{
    const btn=document.getElementById("pilotNewWorkspace");
    return !!window.SRMPilot && !!btn && !btn.disabled;
  },null,{timeout:15000});
}
(async()=>{
  let jsonText;
  try{
    ctx=await launch(sameProfile);
    let p=await browserPage(ctx,entry);
    await ready(p);
    const initial=await state(p);
    assert.equal(initial.mode,"demo");
    console.log("PASS WIN01 "+channel+": standalone file:// candidate opens in a clean profile");

    await p.locator("#pilotNewWorkspace").click();
    await waitFor(p,"已开始空白正式工作");
    await p.locator("#pilotCounterpartyCode").fill("CP-TEST-WIN-001");
    await p.locator("#pilotSupplierCode").fill("S-TEST-WIN-001");
    await p.locator("#pilotSupplierName").fill("虚构供应商");
    await p.locator("#pilotAddSupplier").click();
    await p.locator("#toggleItemIntake").click();
    await p.locator("#importFile").setInputFiles({
      name:"anonymous-items.csv",mimeType:"text/csv",
      buffer:Buffer.from("物料编码,物料名称,分类,数量,单位\nPART-WIN-001,虚构测试物料,类别A,5,件\n","utf8")
    });
    await p.locator("#confirmImportRows").waitFor({state:"visible"});
    await p.locator("#confirmImportRows").click();
    await p.locator('[data-tab="assign"]').click();
    await p.locator("#assignItemBody [data-ai]").first().check();
    await p.locator('[data-add="S-TEST-WIN-001"]').click();
    await p.locator('[data-tab="quoteImport"]').click();
    await p.locator("#quoteImportSupplier").selectOption("S-TEST-WIN-001");
    await p.locator("#quoteImportFile").setInputFiles({
      name:"anonymous-price.csv",mimeType:"text/csv",
      buffer:Buffer.from("物料编码,单价,交期,MOQ,报价状态\nPART-WIN-001,24.5,7,1,正常报价\n","utf8")
    });
    await p.locator("#quoteImportPreviewBody tr").first().waitFor();
    await p.locator("#commitQuoteImport").click();
    await p.locator("#confirmQuoteRound").click();
    await p.locator("#pilotSaveWorkspace").click();
    await waitFor(p,"已保存到本机");
    assert.equal(await p.evaluate(()=>SRMPilot.revision()),1);
    assert.equal(await p.evaluate(()=>quoteRounds[0].lines[0].price),24.5);
    console.log("PASS WIN02 "+channel+": RFQ, supplier, first quotation explicitly saved");

    const pending=p.waitForEvent("download");
    await p.locator("#pilotExportBackup").click();
    const download=await pending;
    jsonText=fs.readFileSync(await download.path(),"utf8");
    const backup=JSON.parse(jsonText);
    assert.equal(backup.attachmentsIncluded,false);
    assert.equal(backup.workspace.state.items[0].id,"PART-WIN-001");
    assert.equal(backup.workspace.state.quoteRounds[0].status,"confirmed");
    console.log("PASS WIN03 "+channel+": portable JSON downloaded from the Windows browser");

    // 中文：真正关闭浏览器进程后以同一个用户配置重新打开相同文件路径。
    // English: Close the actual browser process and relaunch the same profile and file path.
    await ctx.close();ctx=null;
    ctx=await launch(sameProfile);
    p=await browserPage(ctx,entry);
    await waitFor(p,"已自动恢复本机正式工作");
    assert.equal(await p.evaluate(()=>quoteRounds[0].lines[0].price),24.5);
    assert.equal(await p.evaluate(()=>suppliers[0].supplierCode),"S-TEST-WIN-001");
    assert.equal(await p.evaluate(()=>SRMPilot.dirty()),false);
    console.log("PASS WIN04 "+channel+": closed browser process; same file path/profile reopened with saved RFQ");

    // 中文：改变 HTML 路径，记录浏览器到底是否隔离本地数据库；不得把一种行为当成通用保证。
    // English: Observe moved file origin behavior without assuming it is the same across versions.
    await ctx.close();ctx=null;
    ctx=await launch(sameProfile);
    p=await browserPage(ctx,movedEntry);
    await p.waitForFunction(()=>{
      const v=document.querySelector("#pilotSaveStatus")?.textContent||"";
      return v.includes("已自动恢复本机正式工作")||v.includes("目前为演示模式")||
        v.includes("本机保存不可用");
    },null,{timeout:15000});
    const moved=await state(p);
    assert.ok(["buyer","demo"].includes(moved.mode));
    if(moved.status.includes("本机保存不可用")) throw new Error("Moved file storage unavailable: "+moved.status);
    console.log("OBSERVE WIN05 "+channel+": moved HTML file in same browser profile behaves as "+moved.mode+
      " (this behavior is not promised portable)");
    await ctx.close();ctx=null;

    // 中文：独立新浏览器配置中打开搬动后的 HTML，应通过 JSON 文件恢复完整历史。
    // English: A distinct browser profile restores the full buyer dataset from the JSON file.
    ctx=await launch(freshProfile);
    p=await browserPage(ctx,movedEntry);
    await p.waitForFunction(()=>!document.getElementById("pilotRestoreFile").disabled,null,{timeout:15000});
    assert.equal((await state(p)).mode,"demo");
    await p.locator("#pilotRestoreFile").setInputFiles({
      name:"buyer-backup.json",mimeType:"application/json",buffer:Buffer.from(jsonText,"utf8")
    });
    await p.locator("#pilotRestorePreview").waitFor({state:"visible"});
    assert.match(await p.locator("#pilotRestoreDetail").innerText(),/不含邮件、聊天截图、PDF/);
    await p.locator("#pilotConfirmRestore").click();
    await waitFor(p,"已从文件恢复");
    assert.equal(await p.evaluate(()=>quoteRounds[0].lines[0].price),24.5);
    assert.equal(await p.evaluate(()=>items[0].id),"PART-WIN-001");
    await p.reload();
    await waitFor(p,"已自动恢复本机正式工作");
    assert.equal(await p.evaluate(()=>getSet(items[0].lineId).has("S-TEST-WIN-001")),true);
    console.log("PASS WIN06 "+channel+": backup restores confirmed quotation in a new Windows profile at a moved file path");
    assert.deepEqual(errors,[]);
    console.log("PASS WIN07 "+channel+": no uncaught browser errors");
    console.log("WIN-UAT "+channel+": pass; moving file origin behavior observed as "+moved.mode);
  }finally{
    if(ctx)await ctx.close();
    fs.rmSync(root,{recursive:true,force:true});
  }
})().catch(err=>{console.error(err.stack||err);process.exitCode=1});
