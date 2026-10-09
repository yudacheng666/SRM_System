// 中文：生成完全虚构的 M0 测试数据：100 个物料、10 个供应商、各供应商两轮不完全覆盖的报价。
 // English: Generate fully synthetic M0 fixtures: 100 items, 10 suppliers and two nonuniform quote rounds.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'fixtures','generated');
fs.mkdirSync(root,{recursive:true});
// 中文：M0 导入规则要求精确表头，所有输出文件均带 UTF-8 BOM，兼容 Excel。
 // English: All import files use exact M0 headers and UTF-8 BOM for Excel compatibility.
const cell=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
const csv=rows=>'\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n')+'\r\n';
const write=(name,rows)=>fs.writeFileSync(path.join(root,name),csv(rows),'utf8');
const items=Array.from({length:100},(_,i)=>({
  code:'SIM-'+String(i+1).padStart(5,'0'),
  name:i%11===0?'示例 304 不锈钢配件 '+(i+1):'虚构物料 '+(i+1),
  cat:'类别'+String.fromCharCode(65+i%5),
  qty:1+(i*7)%30,unit:['件','套','个'][i%3]
}));
write('m0_100_物料.csv',[
  ['物料编码','物料名称','分类','数量','单位'],
  ...items.map(x=>[x.code,x.name,x.cat,x.qty,x.unit])
]);
const suppliers=Array.from({length:10},(_,i)=>({
  id:'SUP-'+String(i+1).padStart(3,'0'),name:'示例供应商 '+String(i+1).padStart(2,'0'),idx:i
}));
write('m0_10_供应商参考.csv',[
  ['供应商编码','供应商名称','说明'],
  ...suppliers.map(s=>[s.id,s.name,'与现有 M0 虚构供应商池对应；此文件仅供核对，不通过 M0 导入'])
]);
// 中文：供应商覆盖不同物料，首轮故意包含漏报、明确未报和不供货；后轮只针对部分物料议价。
 // English: Supplier coverage differs; Round 1 deliberately includes omissions/no-quotes/cannot-supply and Round 2 negotiates subsets.
const manifest=[['供应商编码','报价轮次','物料编码','期望分配','是否出现在报价文件']];
let quoteLines=0;
for(const sup of suppliers){
  const assigned=items.filter((x,i)=>(i+sup.idx*3)%10<6);
  const second=assigned.filter((x,i)=>i%3===0);
  for(const roundNo of [1,2]){
    const scope=roundNo===1?assigned:second;
    const rows=[['物料编码','单价','交期','MOQ','状态']];
    scope.forEach((it,j)=>{
      const omitted=roundNo===1?(j+sup.idx)%13===0:(j+sup.idx)%11===0;
      manifest.push([sup.id,roundNo,it.code,'是',omitted?'否':'是']);
      if(omitted)return;
      const status=(j+sup.idx)%17===0?'不供货':(j+sup.idx)%13===0?'未报价':'正常报价';
      const base=Number((70+sup.idx*3+j%29-(roundNo-1)*3).toFixed(2));
      const tier=j%9===0?'1-9:'+base.toFixed(2)+'|10-49:'+(base-2).toFixed(2)+'|50+:'+(base-5).toFixed(2):base.toFixed(2);
      rows.push([it.code,status==='正常报价'?tier:'',3+(j%12),1+(j%4),status]);
      quoteLines++;
    });
    write('m0_'+sup.id+'_第'+roundNo+'轮报价.csv',rows);
  }
}
write('m0_供应商分配与轮次范围参考.csv',manifest);
// 中文：生成的 20 个报价 CSV 要在 M0 中选中对应供应商及轮次后分别导入。
 // English: Import the 20 quote CSV files individually after selecting the corresponding M0 supplier and round.
process.stdout.write('Generated '+items.length+' items, '+suppliers.length+' suppliers, 20 round files, '+quoteLines+' quotation records.\n');
