/* SRM UI V3 independent concept / All names, items and prices are fictitious. */
(function(){
"use strict";
var RFQ="RFQ-20261019-001";
var state={view:"assign",activeSupplier:"SUP-A",page:0,pageSize:9,selected:new Set(),itemSearch:"",supplierSearch:"",quoteSupplier:"SUP-A",quoteVersion:"",filter:"all",compareSuppliers:new Set(["SUP-A","SUP-B"]),awards:{},history:[],suppliers:[
  {id:"SUP-A",name:"演示供应商 AAA",code:"S0001"},
  {id:"SUP-B",name:"演示供应商 BBB",code:"S0002"},
  {id:"SUP-C",name:"演示供应商 CCC",code:"S0003"},
  {id:"SUP-D",name:"演示供应商 DDD",code:"S0004"}
],items:[],links:{}};
var itemNames=["连接件","密封环","轴套","支架","装配件","传动片","夹持件","耐磨套","紧固件","接头","隔离件","导向块","驱动片","支撑座","连接套","承载板","衬垫","弹性环"];
var specs=["M16 × 40","DN25","Φ32 × 18","M20 × 60","Φ80","M24 × 80","40 × 60","DN40","M10","G1/2","90 × 20","M12","40 × 30","M18","M16 × 50","100 × 60","DN32","Φ22"];
var qtys=[20,8,50,5,120,30,12,60,200,15,45,18,20,80,25,10,16,40];
for(var i=0;i<18;i++){
  var id="RFQ-L"+String(i+1).padStart(5,"0");
  state.items.push({lineId:id,code:"DEMO-"+String(1001+i),name:"虚构"+itemNames[i],spec:specs[i],qty:qtys[i],unit:i%5===0?"套":"件",drawing:i%3===0?"1 份 PDF":"—"});
  var pool=(i%4===0?["SUP-A","SUP-B"]:i%4===1?["SUP-A","SUP-C"]:i%4===2?["SUP-B","SUP-C"]:["SUP-A","SUP-B","SUP-C"]);
  state.links[id]=new Set(pool);
}
function clone(v){return JSON.parse(JSON.stringify(v));}
function el(id){return document.getElementById(id);}
function esc(v){return String(v===undefined||v===null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function csvField(v){var s=String(v===null||v===undefined?"":v);if(/^[=+@-]/.test(s.trimStart()))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function money(v){return v===null||v===undefined?"—":"¥"+Number(v).toFixed(2);}
function supplierById(id){return state.suppliers.find(function(s){return s.id===id;});}
function itemById(id){return state.items.find(function(x){return x.lineId===id;});}
function now(){return new Date().toLocaleString("zh-CN",{hour12:false});}
function toast(message,type){var e=document.createElement("div");e.className="toast"+(type?" "+type:"");e.textContent=message;el("toasts").append(e);setTimeout(function(){e.remove();},4600);}
function downloadCsv(fileName,rows){var body="\uFEFF"+rows.map(function(r){return r.map(csvField).join(",");}).join("\r\n");var a=document.createElement("a");var url=URL.createObjectURL(new Blob([body],{type:"text/csv;charset=utf-8"}));a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1200);}
function metric(label,val,sub,highlight){return '<div class="metric'+(highlight?' accent':'')+'"><span class="metric-label">'+esc(label)+'</span><div class="metric-value">'+esc(val)+'</div><div class="metric-sub">'+esc(sub)+'</div></div>';}
function modal(title,eyebrow,body,buttons){
  el("modalTitle").textContent=title;el("modalEyebrow").textContent=eyebrow;el("modalBody").innerHTML=body;var foot=el("modalFooter");foot.replaceChildren();
  buttons.forEach(function(config){var b=document.createElement("button");b.type="button";b.className="btn "+(config.primary?"btn-primary":"btn-outline");b.textContent=config.label;b.onclick=config.action;foot.appendChild(b);});
  if(!el("modal").open)el("modal").showModal();
}
function closeModal(){el("modal").close();}
el("modalClose").onclick=closeModal;el("modal").addEventListener("click",function(e){if(e.target===el("modal"))closeModal();});
function navigate(view){
  if(!el(view))return;
  state.view=view;
  document.querySelectorAll("[data-panel]").forEach(function(p){p.hidden=p.id!==view;});
  document.querySelectorAll("[data-view]").forEach(function(b){var active=b.dataset.view===view;b.classList.toggle("active",active);if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
  el("topPage").textContent=({projects:"询价项目",items:"物料与图纸",assign:"供应商分配",quotes:"报价回收",compare:"比价与议价",settings:"设置与数据管理"})[view];
  document.querySelectorAll("[data-step]").forEach(function(x){x.classList.toggle("active",x.dataset.step===view);});
  if(view==="items")renderItems();if(view==="assign")renderAssign();if(view==="quotes")renderQuotes();if(view==="compare")renderCompare();
}
document.addEventListener("click",function(e){var b=e.target.closest("[data-view],[data-go]");if(b)navigate(b.dataset.view||b.dataset.go);});
/* 中文：评审者不需要自行设计测试步骤，三条典型情景可一步展示。 
   English: A one-click guided state is preferable to asking reviewers to invent test data. */
el("guidedTour").onclick=function(){
  modal("选择一个典型采购场景","DESIGN REVIEW · GUIDED WALKTHROUGH",
    '<p class="guided-intro">三个场景已经准备了虚构数据。点击任意场景即可跳转到对应页面，看到关键状态和操作入口。它们只影响本页内存，不会写入 SRM 数据库。</p>'+
    '<div class="guided-cards">'+
      '<button type="button" class="guided-card" data-guide="allocation"><span class="guide-number">01</span><span class="guide-content"><strong>供应商分配 · 跨页选择</strong><span>预选两个页面中的物料，体验多对多关联和批量操作。</span></span><span class="guide-next">↗</span></button>'+
      '<button type="button" class="guided-card" data-guide="revision"><span class="guide-number">02</span><span class="guide-content"><strong>报价修订 · 只看变化行</strong><span>自动准备一份新的 V2 草稿，检查修改与历史保护。</span></span><span class="guide-next">↗</span></button>'+
      '<button type="button" class="guided-card" data-guide="tie"><span class="guide-number">03</span><span class="guide-content"><strong>并列最低价 · 人工决策</strong><span>展示最低价并列的物料以及记录选择理由的入口。</span></span><span class="guide-next">↗</span></button>'+
    '</div>',[{label:"稍后再看",action:closeModal}]);
  el("modalBody").querySelectorAll("[data-guide]").forEach(function(b){
    b.onclick=function(){var scenario=b.dataset.guide;closeModal();
      if(scenario==="allocation"){
        state.activeSupplier="SUP-B";state.selected=new Set(["RFQ-L00001","RFQ-L00002","RFQ-L00010","RFQ-L00011"]);state.page=1;
        navigate("assign");toast("已预选跨两页的 4 条物料。查看批量操作条和全部已分配供应商。","good");
      }else if(scenario==="revision"){
        state.quoteSupplier="SUP-A";
        var h=latestConfirmed("SUP-A"),existing=supplierHistory("SUP-A").find(function(r){return r.round===1&&r.version===2;});
        if(existing){state.quoteVersion=existing.key;}else{
          var newh={key:quoteKey("SUP-A",1,2),supplier:"SUP-A",round:1,version:2,confirmed:false,created:"虚构修订草稿",lines:clone(h.lines)};
          var target=newh.lines.find(function(x){return x.lineId==="RFQ-L00002";});
          if(target)target.price="17.80";state.history.push(newh);state.quoteVersion=newh.key;
        }
        navigate("quotes");toast("已创建报价修订 V2，DEMO-1002 的新旧价格差异已标出。","good");
      }else{state.compareSuppliers=new Set(["SUP-A","SUP-B"]);state.filter="ties";navigate("compare");toast("当前筛选为并列最低价。请点“选择供应商”查看理由必填规则。","good");}
    };
  });
};
el("resetBtn").onclick=function(){modal("重置全部演示操作","RESET DEMO","<p>这将把浏览器里的虚构供应商、分配、报价修订和比价决策恢复初始状态。</p><p class='helper'>原型不连接正式 SRM 数据库，重置不会影响真实询价。</p>",[{label:"取消",action:closeModal},{label:"重置演示",primary:true,action:function(){location.reload();}}]);};
el("feedbackBtn").onclick=function(){
  var txt="SRM UI V3 原型评审\n当前： "+RFQ+"\n模块： "+el("topPage").textContent+"\n供应商： "+state.suppliers.length+" 家；物料： "+state.items.length+" 项\n人工决定："+Object.keys(state.awards).length+" 项\n评审意见：\n1. 页面结构：\n2. 表格密度：\n3. 操作顺序：\n4. 风险与改进：";
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){toast("评审摘要已复制，可直接粘贴到聊天或 PR。","good");}).catch(function(){showFeedback(txt);});}
  else showFeedback(txt);
};
function showFeedback(txt){modal("评审摘要","COPY REVIEW",'<textarea rows="10" id="feedbackText" aria-label="评审摘要"></textarea>',[{label:"关闭",action:closeModal}]);el("feedbackText").value=txt;}
function renderItems(){el("itemsCount").textContent="共 "+state.items.length+" 条 · 当前仅供视觉体验";el("itemsPreviewBody").innerHTML=state.items.map(function(it){return "<tr><td>"+esc(it.lineId)+"</td><td><div class='cell-primary'>"+esc(it.code)+"</div><div class='cell-secondary'>"+esc(it.name)+"</div></td><td>"+esc(it.spec)+"</td><td class='num'>"+it.qty+" "+esc(it.unit)+"</td><td>"+esc(it.drawing)+"</td><td><button class='btn btn-small btn-outline' data-go='assign'>分配供应商 →</button></td></tr>";}).join("");}
function supplierFiltered(){var q=state.supplierSearch.toLowerCase();return state.suppliers.filter(function(s){return s.id.toLowerCase().includes(q)||s.name.toLowerCase().includes(q)||s.code.toLowerCase().includes(q);});}
function itemsFiltered(){var q=state.itemSearch.toLowerCase();return state.items.filter(function(it){return [it.code,it.name,it.spec,it.lineId].some(function(s){return s.toLowerCase().includes(q);});});}
function renderAssign(){
  var total=state.items.length,assigned=state.items.filter(function(it){return state.links[it.lineId].size>0;}).length,linked=state.items.reduce(function(n,it){return n+state.links[it.lineId].size;},0);
  var target=state.activeSupplier,linkCount=state.items.filter(function(it){return state.links[it.lineId].has(target);}).length;
  el("assignMetrics").innerHTML=metric("询价物料",String(total),"当前项目 · 18 条模拟数据",true)+metric("本次供应商",String(state.suppliers.length),"手动与表格导入同一名单")+metric("已分配覆盖率",Math.round(100*assigned/total)+"%","含 "+linked+" 条供应商关系")+metric("当前供应商关联",String(linkCount),"当前选中 "+(supplierById(target)?.name||"—"));
  el("supplierCount").textContent=state.suppliers.length+" 家 · 当前 RFQ";
  var rows=supplierFiltered();
  el("supplierList").innerHTML=rows.map(function(s){
    var n=state.items.filter(function(it){return state.links[it.lineId].has(s.id);}).length;
    return '<button class="supplier-entry'+(s.id===target?' selected':'')+'" role="option" aria-selected="'+(s.id===target)+'" data-supplier="'+esc(s.id)+'"><span class="supplier-avatar">'+esc(s.name.replace("演示供应商 ","").slice(0,1))+'</span><span><strong title="'+esc(s.name)+'">'+esc(s.name)+'</strong><small>'+esc(s.code)+' · 已关联 '+n+' 项</small></span><span class="check-symbol">'+(s.id===target?'✓':'')+'</span></button>';
  }).join("")||'<div class="empty-state">未找到供应商</div>';
  el("activeSupplierLabel").textContent="当前操作："+(supplierById(target)?.name||"请选择供应商")+" · 选择物料后关联或取消关联";
  var filtered=itemsFiltered(),pages=Math.max(1,Math.ceil(filtered.length/state.pageSize));state.page=Math.max(0,Math.min(state.page,pages-1));
  var pageItems=filtered.slice(state.page*state.pageSize,(state.page+1)*state.pageSize);
  el("assignBody").innerHTML=pageItems.map(function(it){
    var linkedSuppliers=[...state.links[it.lineId]].map(supplierById).filter(Boolean);
    var chips=linkedSuppliers.map(function(s){return '<span class="supplier-pill'+(s.id===target?' focused':'')+'" title="'+esc(s.name)+'">'+esc(s.name.replace("演示供应商 ",""))+'</span>';}).join("");
    return "<tr><td><input type='checkbox' data-check-item='"+esc(it.lineId)+"' "+(state.selected.has(it.lineId)?"checked":"")+" aria-label='选择物料 "+esc(it.code)+"'></td><td><div class='cell-primary'>"+esc(it.code)+"</div><div class='cell-secondary'>"+esc(it.name)+" · "+esc(it.lineId)+"</div></td><td>"+esc(it.spec)+"</td><td class='num'>"+it.qty+" "+esc(it.unit)+"</td><td><div class='pill-row'>"+(chips||"<span class='placeholder'>尚未分配</span>")+"</div></td><td class='center'>"+(state.links[it.lineId].has(target)?"<span class='status good'>已关联</span>":"<span class='status neutral'>未关联</span>")+"</td></tr>";
  }).join("")||'<tr><td colspan="6" class="empty-state">未找到匹配物料</td></tr>';
  el("selectedCount").textContent="已选 "+state.selected.size+" 项"+(state.selected.size?"（跨页保留）":"");
  el("pageNo").textContent=(state.page+1)+" / "+pages;
  el("prevPage").disabled=state.page===0;el("nextPage").disabled=state.page===pages-1;
  el("pageSelect").checked=pageItems.length>0&&pageItems.every(function(it){return state.selected.has(it.lineId);});
  el("pageSelect").indeterminate=pageItems.some(function(it){return state.selected.has(it.lineId);})&&!el("pageSelect").checked;
  el("assignFooter").textContent="筛选 "+filtered.length+" / "+total+" 项 · 每页 "+state.pageSize+" 行 · 关联数量 "+linked;
  el("bulkLink").disabled=state.selected.size===0;el("bulkUnlink").disabled=state.selected.size===0;
  el("exportRfq").disabled=linkCount===0;
}
el("supplierList").onclick=function(e){var b=e.target.closest("[data-supplier]");if(!b)return;state.activeSupplier=b.dataset.supplier;renderAssign();};
el("supplierSearch").oninput=function(e){state.supplierSearch=e.target.value;renderAssign();};
el("itemSearch").oninput=function(e){state.itemSearch=e.target.value;state.page=0;renderAssign();};
document.querySelectorAll("[data-density]").forEach(function(b){b.onclick=function(){document.body.classList.toggle("density-comfortable",b.dataset.density==="comfortable");document.querySelectorAll("[data-density]").forEach(function(x){var active=x===b;x.classList.toggle("active",active);x.setAttribute("aria-pressed",String(active));});};});
el("assignBody").onchange=function(e){var b=e.target.closest("[data-check-item]");if(!b)return;if(b.checked)state.selected.add(b.dataset.checkItem);else state.selected.delete(b.dataset.checkItem);renderAssign();};
el("pageSelect").onchange=function(e){itemsFiltered().slice(state.page*state.pageSize,(state.page+1)*state.pageSize).forEach(function(it){if(e.target.checked)state.selected.add(it.lineId);else state.selected.delete(it.lineId);});renderAssign();};
el("prevPage").onclick=function(){state.page--;renderAssign();};el("nextPage").onclick=function(){state.page++;renderAssign();};
el("clearSelection").onclick=function(){state.selected.clear();renderAssign();};
el("selectFiltered").onclick=function(){itemsFiltered().forEach(function(it){state.selected.add(it.lineId);});renderAssign();toast("已选中全部筛选物料，跨页选择仍然保留。");};
function bulkChange(add){var id=state.activeSupplier,n=0;state.selected.forEach(function(line){var set=state.links[line];if(!set)return;if(add&&!set.has(id)){set.add(id);n++;}if(!add&&set.delete(id))n++;});renderAssign();toast((add?"已追加 ":"已取消 ")+n+" 条供应商关联；其他供应商分配保留。","good");}
el("bulkLink").onclick=function(){bulkChange(true);};el("bulkUnlink").onclick=function(){bulkChange(false);};
el("newSupplier").onclick=function(){modal("新增供应商","SUPPLIER / CREATE",'<label>供应商编码（必填）<input id="newSupplierCode" type="text" placeholder="例如 S0100" maxlength="30"></label><label>供应商名称（必填）<input id="newSupplierName" type="text" placeholder="例如 虚构供应商 E" maxlength="100"></label><p class="helper">编码精确重复拒绝；名称相同但编码不同时进入人工核查，不自动合并。</p><div id="supplierError" aria-live="polite"></div>',[{label:"取消",action:closeModal},{label:"检查并添加",primary:true,action:function(){var code=el("newSupplierCode").value.trim().toUpperCase(),name=el("newSupplierName").value.trim(),err="";if(!code||!name)err="编码和名称均为必填项。";else if(state.suppliers.some(function(s){return s.code.toUpperCase()===code||s.id===code;}))err="已有相同供应商编码，不能重复创建。";else if(state.suppliers.some(function(s){return s.name.replace(/\s/g,"")===name.replace(/\s/g,"");}))err="发现同名供应商，请先核对编码和实体身份，原型不自动合并。";if(err){el("supplierError").innerHTML='<div class="error">'+esc(err)+'</div>';return;}var id="SUP-"+code;state.suppliers.push({id:id,name:name,code:code});state.activeSupplier=id;closeModal();renderAssign();toast("已加入虚构供应商 "+name+"。","good");}}]);};
el("simulateImport").onclick=function(){
  var addName="虚构供应商 E";
  modal("Excel 导入预览与去重","SUPPLIER / IMPORT PREVIEW",'<p class="helper">演示 3 行 Excel 数据：自动识别重复编码和可疑同名。导入前必须检查，不会自动覆盖原记录。</p><div class="preview-list"><div><b>01 · S0001 / 演示供应商 AAA</b><br><span class="warning-line">重复编码：跳过，保留原供应商</span></div><div><b>02 · S0099 / 演示供应商 BBB</b><br><span class="warning-line">名称疑似重复：需要人工核查，不自动合并</span></div><div><b>03 · S0100 / 虚构供应商 E</b><br><span style="color:#138268">唯一新供应商：允许导入</span></div></div>',[{label:"取消",action:closeModal},{label:"仅导入唯一项",primary:true,action:function(){if(state.suppliers.some(function(s){return s.code==="S0100";})){toast("唯一项已存在，本次没有可导入的新供应商。","error");closeModal();return;}state.suppliers.push({id:"SUP-E",name:addName,code:"S0100"});closeModal();renderAssign();toast("已导入 1 家；另 2 行被跳过或留待核查。","good");}}]);
};
el("exportRfq").onclick=function(){
  var sup=supplierById(state.activeSupplier);if(!sup)return;
  var assigned=state.items.filter(function(it){return state.links[it.lineId].has(sup.id);});
  if(!assigned.length)return toast("当前供应商没有分配物料。","error");
  var rows=[["RFQ业务编号","供应商编码","RFQ Line ID","存货编码","名称","规格","数量","单位"]];
  assigned.forEach(function(it){rows.push([RFQ,sup.code,it.lineId,it.code,it.name,it.spec,it.qty,it.unit]);});
  downloadCsv(RFQ+"_"+sup.code+"_询价清单-原型.csv",rows);
  toast("已导出演示 CSV（"+assigned.length+" 项）；正式系统仍应使用既有 Excel/PDF 询价包。","good");
};
/* QUOTATION VERSIONS / isolated synthetic immutable confirmed snapshots. */
function currentHistory(){return state.history.find(function(h){return h.key===state.quoteVersion&&h.supplier===state.quoteSupplier;});}
function supplierHistory(id){return state.history.filter(function(h){return h.supplier===id;}).sort(function(a,b){return b.round-a.round||b.version-a.version;});}
function quoteKey(sid,round,version){return sid+"|"+round+"|"+version;}
function makeLine(lineId,price,status,lead){return {lineId:lineId,price:price===null?"":String(price),status:status||"quoted",lead:lead||7};}
function latestConfirmed(sid){return supplierHistory(sid).filter(function(h){return h.confirmed;})[0]||null;}
function initQuotes(){
  state.suppliers.slice(0,3).forEach(function(s,idx){
    var lines=state.items.filter(function(it){return state.links[it.lineId].has(s.id);}).map(function(it,i){
      if(idx===2&&i%7===0)return makeLine(it.lineId,"","noquote");
      if(idx===1&&i%9===0&&it.lineId!=="RFQ-L00001")return makeLine(it.lineId,"","cannot");
      return makeLine(it.lineId,(idx===0&&it.lineId==="RFQ-L00001"?"18.50":idx===1&&it.lineId==="RFQ-L00001"?"18.50":(12+i*3.2+idx*1.9).toFixed(2)),"quoted",7+idx);
    });
    state.history.push({key:quoteKey(s.id,1,1),supplier:s.id,round:1,version:1,confirmed:true,created:"虚构初始报价 · R1 V1",lines:lines});
  });
  state.quoteVersion=quoteKey("SUP-A",1,1);
}
initQuotes();
function chosenHistory(){return currentHistory();}
function historyLine(h,id){return (h?.lines||[]).find(function(x){return x.lineId===id;})||null;}
function getPrior(h){if(!h)return null;return supplierHistory(h.supplier).filter(function(x){return x.confirmed&&(x.round<h.round||(x.round===h.round&&x.version<h.version));}).sort(function(a,b){return b.round-a.round||b.version-a.version;})[0]||null;}
function lineDiff(cur,previous){if(!cur)return"missing";if(!previous)return"new";return cur.status===previous.status&&String(cur.price)===String(previous.price)&&cur.lead===previous.lead?"same":"change";}
function quoteStatusText(s){return ({quoted:"正常报价",noquote:"明确未报价",cannot:"不供货",missing:"缺报"})[s]||"缺报";}
function priceInfo(line,qty){
  if(!line||line.status!=="quoted")return null;
  var v=String(line.price).replace(/：/g,":").trim();if(!v)return null;
  if(!v.includes(":")){var n=Number(v);return Number.isFinite(n)&&n>=0?n:null;}
  var parts=v.split(/[|｜]/).map(function(s){return s.trim();}).filter(Boolean),hit=null;
  for(var i=0;i<parts.length;i++){var p=parts[i].lastIndexOf(":"),range=parts[i].slice(0,p),value=Number(parts[i].slice(p+1)),match;if(p<1||!Number.isFinite(value)||value<0)return null;
    match=range.match(/^(\d+)(?:-(\d+)|\+)$/);if(!match)return null;
    var low=Number(match[1]),hi=match[2]?Number(match[2]):Infinity;if(qty>=low&&qty<=hi)hit=value;
  }return hit;
}
function parsePriceValid(str){var value=String(str||"").replace(/：/g,":").trim();if(!value)return false;if(!value.includes(":"))return Number.isFinite(Number(value))&&Number(value)>=0;var parts=value.split(/[|｜]/).filter(Boolean);return parts.length>0&&parts.every(function(v){return /^(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?)|\+):(\d+(?:\.\d+)?)$/.test(v.trim());});}
function renderQuotes(){
  var supplier=el("quoteSupplier");supplier.innerHTML=state.suppliers.map(function(s){return '<option value="'+esc(s.id)+'">'+esc(s.name)+'</option>';}).join("");
  if(!supplierById(state.quoteSupplier))state.quoteSupplier=state.suppliers[0].id;supplier.value=state.quoteSupplier;
  var histories=supplierHistory(state.quoteSupplier);
  if(!histories.some(function(h){return h.key===state.quoteVersion;}))state.quoteVersion=histories[0]?.key||"";
  el("quoteVersion").innerHTML=histories.map(function(h){return '<option value="'+esc(h.key)+'">第 '+h.round+' 轮 / V'+h.version+(h.confirmed?" · 已确认":" · 草稿")+'</option>';}).join("");
  el("quoteVersion").value=state.quoteVersion;
  var h=chosenHistory(),prior=getPrior(h),confirmed=h?.confirmed||false;
  el("newRevision").disabled=!h||!confirmed||histories[0].key!==h.key;
  el("newRound").disabled=!!h&&!confirmed;
  el("quoteVersionStatus").className="status "+(h?(confirmed?"good":"warn"):"neutral");
  el("quoteVersionStatus").textContent=h?(confirmed?"已确认 · 不可修改":"草稿 · 可修改"):"尚无报价";
  el("quoteMeta").textContent=h?(h.created||"演示记录")+" · 不持久化":"点击模拟导入或创建版本";
  var assigned=state.items.filter(function(it){return state.links[it.lineId].has(state.quoteSupplier);});
  var filled=assigned.filter(function(it){return !!historyLine(h,it.lineId);}).length;
  var quoted=assigned.filter(function(it){return historyLine(h,it.lineId)?.status==="quoted";}).length;
  var diff=assigned.filter(function(it){return lineDiff(historyLine(h,it.lineId),historyLine(prior,it.lineId))==="change";}).length;
  el("quoteMetrics").innerHTML=metric("本轮应报",assigned.length,"当前供应商询价范围",true)+metric("已记录",filled,"报价 / 不报价 / 不供货")+metric("有效报价",quoted,"已确认后参与正式比价")+metric("相对上次变更",diff,"展示变更行，不复制界面噪声");
  el("quoteDiffSummary").textContent=(prior?"较上版":"初始版本")+" · "+diff+" 项已调整";
  el("confirmVersion").disabled=!h||confirmed;
  el("quoteBody").innerHTML=assigned.map(function(it){
    var line=historyLine(h,it.lineId),older=historyLine(prior,it.lineId),kind=lineDiff(line,older);
    var status=line?.status||"missing",price=line?.price||"",p=priceInfo(line,it.qty);
    var editable=!confirmed&&!!h;
    var fieldStatus=editable?'<select aria-label="报价状态" data-qstatus="'+esc(it.lineId)+'">'+["quoted","noquote","cannot","missing"].map(function(s){return '<option value="'+s+'"'+(s===status?' selected':'')+'>'+quoteStatusText(s)+'</option>';}).join("")+'</select>':'<span class="status '+(status==="quoted"?"good":status==="cannot"?"bad":status==="noquote"?"warn":"neutral")+'">'+quoteStatusText(status)+'</span>';
    var fieldPrice=editable?'<input type="text" data-qprice="'+esc(it.lineId)+'" value="'+esc(price)+'" placeholder="单价 / 1-99:18|100+:16" aria-label="报价单价">' :'<span class="readonly">'+(status==="quoted"?esc(price)+(p!==null&&price.includes(":")?' · 适用 '+money(p):""):"—")+'</span>';
    var label=({change:"已调整",same:"未变化",new:"新增记录",missing:"待录入"})[kind];
    return "<tr><td><div class='cell-primary'>"+esc(it.code)+" · "+esc(it.spec)+"</div><div class='cell-secondary'>"+esc(it.lineId)+"</div></td><td class='num'>"+it.qty+" "+esc(it.unit)+"</td><td class='quote-edit'>"+fieldStatus+"</td><td class='quote-edit'>"+fieldPrice+"</td><td>"+(older&&older.status==="quoted"?esc(older.price):"<span class='placeholder'>—</span>")+"</td><td><span class='difference "+esc(kind)+"'>"+label+"</span></td></tr>";
  }).join("")||'<tr><td colspan="6" class="empty-state">当前供应商未分配物料</td></tr>';
  el("quoteFooter").textContent="覆盖 "+filled+"/"+assigned.length+" · 有效报价 "+quoted+" · 版本只在确认后锁定";
}
el("quoteSupplier").onchange=function(e){state.quoteSupplier=e.target.value;state.quoteVersion="";renderQuotes();};
el("quoteVersion").onchange=function(e){state.quoteVersion=e.target.value;renderQuotes();};
function nextVersion(round,version,baseLines){
  var h={key:quoteKey(state.quoteSupplier,round,version),supplier:state.quoteSupplier,round:round,version:version,confirmed:false,created:"演示草稿 "+now(),lines:clone(baseLines||[])};
  state.history.push(h);state.quoteVersion=h.key;renderQuotes();toast("已创建 R"+round+" V"+version+" 草稿。原确认版本保持不变。","good");
}
el("newRevision").onclick=function(){var h=chosenHistory();if(!h||!h.confirmed)return;nextVersion(h.round,h.version+1,h.lines);};
el("newRound").onclick=function(){var all=supplierHistory(state.quoteSupplier),latest=all[0];if(latest&&!latest.confirmed)return toast("请先确认当前草稿。","error");nextVersion(latest?latest.round+1:1,1,[]);};
function setDraftLine(id,change){var h=chosenHistory();if(!h||h.confirmed)return;var line=historyLine(h,id);if(!line){line=makeLine(id,"","quoted");h.lines.push(line);}Object.assign(line,change);if(line.status==="missing")h.lines=h.lines.filter(function(l){return l.lineId!==id;});renderQuotes();}
el("quoteBody").onchange=function(e){var status=e.target.closest("[data-qstatus]"),price=e.target.closest("[data-qprice]");if(status){var id=status.dataset.qstatus;setDraftLine(id,{status:status.value,price:status.value==="quoted"?(historyLine(chosenHistory(),id)?.price||""):""});}else if(price){setDraftLine(price.dataset.qprice,{price:price.value.trim(),status:"quoted"});}};
el("confirmVersion").onclick=function(){
  var h=chosenHistory();if(!h||h.confirmed)return;
  var invalid=h.lines.filter(function(x){return x.status==="quoted"&&!parsePriceValid(x.price);});
  if(invalid.length)return toast("有 "+invalid.length+" 行单价/阶梯价无效，不能确认。","error");
  if(!h.lines.length)return toast("当前草稿没有任何报价记录。","error");
  var count=state.items.filter(function(it){return state.links[it.lineId].has(h.supplier);}).length;
  modal("确认并锁定报价版本","HISTORY / CONFIRM",'<p>将锁定 <b>第 '+h.round+' 轮 / V'+h.version+'</b>。此后不能修改当前版本，只能新增修订或轮次。</p><p class="helper">已记录 '+h.lines.length+' / 应报价 '+count+' 项；如存在缺报，会保留缺报状态，不会自动补零。</p>',[{label:"返回检查",action:closeModal},{label:"确认锁定",primary:true,action:function(){h.confirmed=true;h.created="虚构确认于 "+now();closeModal();renderQuotes();renderCompare();toast("已锁定版本；上一版及本版均可独立查看。","good");}}]);
};
el("quotePasteBtn").onclick=function(){
  var h=chosenHistory();if(!h||h.confirmed)return toast("请先点击“基于当前版本修订”或“新建下一轮”。","error");
  var assigned=state.items.filter(function(it){return state.links[it.lineId].has(state.quoteSupplier);}).slice(0,3);
  var rows=assigned.map(function(it,i){return it.lineId+","+(18.5+i*4.1).toFixed(2)+",正常报价";}).join("\n");
  modal("报价导入 · 粘贴校验","QUOTES / PREVIEW",'<p class="helper">可粘贴 CSV。模拟按 RFQ Line ID 匹配；所有修改先进入草稿，确认前不会覆盖历史。</p><label>输入数据（RFQ Line ID,报价单价,报价状态）<textarea id="mockCsv" rows="6"></textarea></label><div id="importFeedback" class="helper"></div>',[{label:"取消",action:closeModal},{label:"检查并写入草稿",primary:true,action:function(){
    var text=el("mockCsv").value.trim(),lines=text.split(/\r?\n/).filter(Boolean),updates=[],invalid=[];
    lines.forEach(function(line,index){var x=line.split(",").map(function(z){return z.trim();}),it=itemById(x[0]);if(!it||!state.links[it.lineId].has(state.quoteSupplier))invalid.push("第 "+(index+1)+" 行 RFQ Line ID 非本供应商范围");else if(!["正常报价","明确未报价","不供货"].includes(x[2]))invalid.push("第 "+(index+1)+" 行状态不支持");else if(x[2]==="正常报价"&&!parsePriceValid(x[1]))invalid.push("第 "+(index+1)+" 行报价无效");else updates.push({lineId:it.lineId,price:x[2]==="正常报价"?x[1]:"",status:({"正常报价":"quoted","明确未报价":"noquote","不供货":"cannot"})[x[2]]});});
    if(invalid.length){el("importFeedback").innerHTML='<div class="error">'+esc(invalid.join("；"))+'</div>';return;}
    if(!updates.length){el("importFeedback").innerHTML='<div class="error">没有可导入的数据</div>';return;}
    updates.forEach(function(u){var row=historyLine(h,u.lineId);if(!row){row=makeLine(u.lineId,"","quoted");h.lines.push(row);}Object.assign(row,u);});
    closeModal();renderQuotes();toast("已检查并写入 "+updates.length+" 条草稿报价；确认前可继续修订。","good");
  }}]);
  el("mockCsv").value=rows;
};
/* COMPARISON / separates calculated recommendations from buyer awards. */
function confirmedForLine(sid,lineId){/* Never silently carry old-round prices into a new-round scope. */var current=latestConfirmed(sid);return historyLine(current,lineId);}
function compareRows(){
  // 中文：少于两家供应商时不形成可比较的报价集合。
  // English: Require two suppliers before forming a comparable group.
  if(state.compareSuppliers.size<2)return [];
  return state.items.filter(function(it){return [...state.compareSuppliers].some(function(sid){return state.links[it.lineId].has(sid);});}).map(function(it){
    var cells=[...state.compareSuppliers].map(function(sid){var row=state.links[it.lineId].has(sid)?confirmedForLine(sid,it.lineId):null;return{sid:sid,row:row,price:priceInfo(row,it.qty)};});
    var finite=cells.filter(function(c){return c.price!==null;}).map(function(c){return c.price;});var low=finite.length?Math.min.apply(null,finite):null;
    var winners=cells.filter(function(c){return low!==null&&c.price!==null&&Math.abs(c.price-low)<.0000001;}).map(function(c){return c.sid;});
    return {item:it,cells:cells,min:low,winners:winners,tied:winners.length>1,decision:state.awards[it.lineId]||null};
  });
}
function renderCompare(){
  el("comparisonSuppliers").innerHTML=state.suppliers.map(function(s){return '<label class="picklabel"><input type="checkbox" data-compare-supplier="'+esc(s.id)+'"'+(state.compareSuppliers.has(s.id)?' checked':'')+'><strong>'+esc(s.name)+'</strong></label>';}).join("");
  document.querySelectorAll("#compareFilters button").forEach(function(b){b.classList.toggle("selected",b.dataset.filter===state.filter);});
  var rows=compareRows(),tie=rows.filter(function(r){return r.tied&&!r.decision;}),undecided=rows.filter(function(r){return !r.decision;}),chosen=rows.filter(function(r){return !!r.decision;});
  var total=chosen.reduce(function(sum,r){var sid=r.decision.sid,entry=r.cells.find(function(c){return c.sid===sid;});return sum+(entry?.price||0)*r.item.qty;},0);
  el("compareMetrics").innerHTML=metric("当前比较范围",rows.length+" 项",state.compareSuppliers.size+" 家参与 · 含独立价格状态",true)+metric("并列最低待确认",tie.length+" 项","不会按照排序自动选第一家")+metric("已人工决定",chosen.length+" 项","每项需记录决策理由")+metric("已决定金额",money(total),"只有已选且有适用价的行计入");
  el("analysisInsight").innerHTML='<div class="insight-icon" aria-hidden="true">✦</div><div class="insight-copy"><strong>本轮比价提醒</strong><span>'+
    (state.compareSuppliers.size<2?"当前仅选择一家供应商，请至少勾选两家再进行比较。":tie.length?"发现 "+tie.length+" 项并列最低价。已确认报价仅用于推荐，采购员仍需填写中选理由。":undecided.length?"还有 "+undecided.length+" 项尚未决定中选供应商。":"所有项目已记录人工决策和理由。")+
    '</span></div><button type="button" id="insightAction">'+(tie.length?"查看并列最低项":undecided.length?"查看待决定项":"查看全部")+' →</button>';
  el("insightAction").onclick=function(){state.filter=tie.length?"ties":undecided.length?"open":"all";renderCompare();};
  el("compareScope").textContent="参与 "+state.compareSuppliers.size+" 家 · 显示 "+rows.length+" 项";
  var suppliers=[...state.compareSuppliers].map(supplierById).filter(Boolean);
  el("compareHead").innerHTML="<tr><th>存货编码 / 规格</th><th class='num'>数量</th>"+suppliers.map(function(s){return "<th>"+esc(s.name.replace("演示供应商 ",""))+"<br><span class='muted'>适用单价</span></th>";}).join("")+"<th>系统推荐</th><th>采购决定</th></tr>";
  var filtered=rows.filter(function(r){return state.filter==="all"||state.filter==="ties"&&r.tied||state.filter==="open"&&!r.decision;});
  el("compareBody").innerHTML=filtered.map(function(r){
    var it=r.item,prices=suppliers.map(function(s){var c=r.cells.find(function(x){return x.sid===s.id;}),v=c?.price,css=(v!==null&&r.winners.includes(s.id)?r.tied?"tie":"best":"");return "<td>"+(v===null?"<span class='mutedquote'>"+(c?.row?quoteStatusText(c.row.status):"缺报 / 未分配")+"</span>":"<span class='price "+css+"'>"+money(v)+"</span>")+"</td>";}).join("");
    var recommend=r.min===null?"没有有效报价":r.tied?'<span class="status warn">并列最低 · 待确认</span>':'<span class="status good">'+esc(supplierById(r.winners[0])?.name.replace("演示供应商 ",""))+' · '+money(r.min)+'</span>';
    var award=r.decision?'<span class="status blue">'+esc(supplierById(r.decision.sid)?.name.replace("演示供应商 ",""))+' · 已选定</span>':'<span class="muted">未决定</span>';
    return "<tr><td><div class='cell-primary'>"+esc(it.code)+" · "+esc(it.spec)+"</div><div class='cell-secondary'>"+esc(it.lineId)+"</div></td><td class='num'>"+it.qty+" "+esc(it.unit)+"</td>"+prices+"<td>"+recommend+"</td><td><div class='decision-line'>"+award+" <button class='btn btn-outline btn-small award-btn' data-award='"+esc(it.lineId)+"'>"+(r.decision?"修改决定":"选择供应商")+"</button></div></td></tr>";
  }).join("")||'<tr><td colspan="'+(suppliers.length+4)+'" class="empty-state">此筛选下暂无物料；可以切换条件查看。</td></tr>';
  el("compareFooter").textContent="共 "+rows.length+" 项 · 当前显示 "+filtered.length+" 项 · 并列最低待选 "+tie.length+" 项 · 未决定 "+undecided.length+" 项";
  el("exportComparison").disabled=!rows.length;
}
el("comparisonSuppliers").onchange=function(e){var b=e.target.closest("[data-compare-supplier]");if(!b)return;if(b.checked)state.compareSuppliers.add(b.dataset.compareSupplier);else state.compareSuppliers.delete(b.dataset.compareSupplier);renderCompare();if(state.compareSuppliers.size<2)toast("建议至少选择两家供应商进行同范围比较。");};
el("compareFilters").onclick=function(e){var b=e.target.closest("[data-filter]");if(!b)return;state.filter=b.dataset.filter;renderCompare();};
el("compareBody").onclick=function(e){
  var b=e.target.closest("[data-award]");if(!b)return;
  var lineId=b.dataset.award,row=compareRows().find(function(r){return r.item.lineId===lineId;});if(!row)return;
  var options=row.cells.filter(function(c){return c.price!==null;});if(!options.length)return toast("该物料没有有效报价，不能选定供应商。","error");
  var old=state.awards[lineId];
  var content='<p class="helper">物料 '+esc(row.item.code)+' / '+esc(row.item.spec)+'。'+(row.tied?"<strong class='warning-line'>存在并列最低价，系统不会自动选定。</strong>":"系统最低价仅为推荐，不会替代采购决定。")+'</p><label>采购最终选定供应商<select id="awardSupplier"><option value="">请选择供应商</option>'+options.map(function(c){return '<option value="'+esc(c.sid)+'"'+(old?.sid===c.sid?' selected':'')+'>'+esc(supplierById(c.sid).name)+' · '+money(c.price)+'</option>';}).join("")+'</select></label><label>选择理由（必填）<textarea id="awardReason" rows="3" placeholder="如：交期更短、质量验证、历史合作、并列最低后的采购判断"></textarea></label><div id="awardError"></div>';
  modal("确认采购决定","AWARD / BUYER DECISION",content,[{label:old?"撤销决定":"取消",action:function(){if(old){delete state.awards[lineId];closeModal();renderCompare();toast("已撤销该物料的人工决定。");}else closeModal();}},{label:"保存人工决定",primary:true,action:function(){var sid=el("awardSupplier").value,reason=el("awardReason").value.trim();if(!sid||!reason){el("awardError").innerHTML='<div class="error">请明确选择供应商并填写理由；不能以供应商排序代替采购决定。</div>';return;}state.awards[lineId]={sid:sid,reason:reason,at:now()};closeModal();renderCompare();toast("已记录采购员选择及原因；系统推荐与最终选择仍分别显示。","good");}}]);
  if(old)el("awardReason").value=old.reason;
};
el("exportComparison").onclick=function(){
  var rows=[["RFQ编号","RFQ Line ID","存货编码","物料规格","询价数量","单位","最低适用单价","并列最低供应商","最终选定","选定单价","选择理由"]];
  compareRows().forEach(function(r){var s=r.decision?.sid,price=r.cells.find(function(c){return c.sid===s;})?.price;rows.push([RFQ,r.item.lineId,r.item.code,r.item.spec,r.item.qty,r.item.unit,r.min??"",r.tied?r.winners.map(function(id){return supplierById(id)?.name;}).join(" / "):"",s?supplierById(s)?.name:"未决定",price??"",r.decision?.reason||""]);});
  downloadCsv(RFQ+"_比价决策清单-原型.csv",rows);toast("已导出演示 CSV；并列最低价未决定的行会明确标示，不会自动选供应商。","good");
};
navigate("compare");
})();