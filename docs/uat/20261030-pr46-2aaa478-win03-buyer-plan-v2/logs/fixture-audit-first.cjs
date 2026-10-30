'use strict';
// Read-only static checks. No file extraction, browser rendering or business UAT.
const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path');
const {digest}=require('./source-probes.cjs');
function crc32(b){let crc=0xffffffff;for(const x of b){crc^=x;for(let k=0;k<8;k++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1;}return (crc^0xffffffff)>>>0;}
function zip(b){
 let end=-1;for(let n=b.length-22;n>=Math.max(0,b.length-65557);n--)if(b.readUInt32LE(n)===0x06054b50){end=n;break;}
 if(end<0)throw Error('ZIP end missing');
 const count=b.readUInt16LE(end+10),parts=new Map();let p=b.readUInt32LE(end+16);
 for(let i=0;i<count;i++){
  if(b.readUInt32LE(p)!==0x02014b50)throw Error('ZIP central header');
  const method=b.readUInt16LE(p+10),crc=b.readUInt32LE(p+16),compressed=b.readUInt32LE(p+20),size=b.readUInt32LE(p+24),nl=b.readUInt16LE(p+28),el=b.readUInt16LE(p+30),cl=b.readUInt16LE(p+32),lo=b.readUInt32LE(p+42);
  const name=b.subarray(p+46,p+46+nl).toString('utf8');
  if(name.includes('..')||name.startsWith('/')||name.includes('\\')||parts.has(name))throw Error('ZIP unsafe/duplicate name');
  if(b.readUInt32LE(lo)!==0x04034b50)throw Error('ZIP local header');
  const start=lo+30+b.readUInt16LE(lo+26)+b.readUInt16LE(lo+28),raw=b.subarray(start,start+compressed);
  const data=method===0?raw:method===8?zlib.inflateRawSync(raw):null;
  if(!data||data.length!==size||crc32(data)!==crc)throw Error('ZIP method/size/CRC mismatch');
  parts.set(name,data);p+=46+nl+el+cl;
 }
 if(parts.size!==count)throw Error('ZIP entry count');return parts;
}
const decode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'");
function xlsxRows(b){
 const parts=zip(b),sheet=parts.get('xl/worksheets/sheet1.xml');if(!sheet)throw Error('Missing worksheet1');
 const shared=parts.get('xl/sharedStrings.xml')?.toString('utf8');
 const strings=shared?[...shared.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map(m=>[...m[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(m=>decode(m[1])).join('')):[];
 const rows=[];
 for(const r of sheet.toString('utf8').matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)){
  const cells=[];
  for(const c of r[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)){
   const letters=/\br="([A-Z]+)\d+"/.exec(c[1])?.[1];if(!letters)throw Error('Cell reference missing');
   let col=0;for(const ch of letters)col=col*26+ch.charCodeAt(0)-64;
   let v=/<v\b[^>]*>([\s\S]*?)<\/v>/.exec(c[2])?.[1]??[...c[2].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(m=>m[1]).join('');
   if(/\bt="s"/.test(c[1]))v=strings[Number(v)];cells[col-1]=decode(String(v??''));
  }
  rows.push(Array.from({length:cells.length},(_,i)=>cells[i]??''));
 }return {rows,parts:[...parts.keys()]};
}
function pdf(b){
 const s=b.toString('ascii');if(!s.startsWith('%PDF-1.4\n')||!s.endsWith('%%EOF\n'))throw Error('PDF header/EOF');
 const offset=Number(/startxref\n(\d+)\n%%EOF/.exec(s)?.[1]);if(s.slice(offset,offset+5)!=='xref\n')throw Error('PDF xref pointer');
 const entries=s.slice(offset).split('\n').slice(4,9);if(entries.length!==5)throw Error('PDF xref entries');
 entries.forEach((e,i)=>{const pos=Number(e.slice(0,10));if(!s.slice(pos).startsWith((i+1)+' 0 obj\n'))throw Error('PDF object xref');});
 const stream=/\/Length (\d+) >>\nstream\n([\s\S]*?)endstream/.exec(s);
 if(!stream||Number(stream[1])!==Buffer.byteLength(stream[2]))throw Error('PDF stream length');
 return {structuralStatus:'PASS',pages:1,sha256:digest(b),bytes:b.length,rendering:'NOT TESTED; no viewer launched'};
}
function audit(root){
 const m=JSON.parse(fs.readFileSync(path.join(root,'fixture-manifest.json'))),results=[];
 for(const f of m.files){
  const b=fs.readFileSync(path.join(root,f.path));if(b.length!==f.bytes||digest(b)!==f.sha256)throw Error('Fixture bytes changed');
  const result={path:f.path,bytes:b.length,sha256:digest(b),integrity:'PASS'};
  if(f.path.endsWith('.xlsx'))Object.assign(result,xlsxRows(b));
  if(f.path.endsWith('.pdf'))Object.assign(result,pdf(b));
  results.push(result);
 }
 return {kind:'STATIC FICTIONAL FIXTURE CHECKS ONLY',files:results,browserRendering:'NOT TESTED',businessImport:'NOT TESTED'};
}
module.exports={audit,zip,xlsxRows,pdf,crc32};
if(require.main===module)console.log(JSON.stringify(audit(__dirname),null,2));
