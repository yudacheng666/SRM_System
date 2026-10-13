/* 中文：离线 ZIP Store 格式打包多个供应商独立 XLSX，不引入网络依赖。
 * English: Small offline ZIP archive with CRC32 and UTF-8 names; no network dependencies. */
(function(root){
"use strict";
const MAX_ENTRY_BYTES=12*1024*1024,MAX_TOTAL_BYTES=64*1024*1024,MAX_ENTRIES=200;
const table=new Uint32Array(256);
for(let n=0;n<256;n++){let c=n;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0}
function crc32(bytes){let c=0xffffffff;for(const x of bytes)c=(c>>>8)^table[(c^x)&255];return (c^0xffffffff)>>>0}
function fail(message){throw Error("ZIP: "+message)}
function u16(bytes,pos,n){bytes[pos]=n&255;bytes[pos+1]=(n>>>8)&255}
function u32(bytes,pos,n){u16(bytes,pos,n);u16(bytes,pos+2,n>>>16)}
async function create(entries){
 if(!Array.isArray(entries)||!entries.length||entries.length>MAX_ENTRIES)fail("文件数量必须在 1 到 200 之间");
 const enc=new TextEncoder(),seen=new Set(),local=[],central=[];
 let offset=0,total=0;
 for(const entry of entries){
  if(!entry||typeof entry.name!=="string"||!(entry.blob instanceof Blob))fail("文件格式错误");
  const name=entry.name.trim();
  if(!name||name.includes("/")||name.includes("\\")||name.includes("..")||!name.toLowerCase().endsWith(".xlsx")||seen.has(name))
   fail("文件名冲突或无效");
  seen.add(name);
  const data=new Uint8Array(await entry.blob.arrayBuffer()),nameBytes=enc.encode(name);
  if(nameBytes.length>65535||data.length>MAX_ENTRY_BYTES)fail("单个文件过大");
  total+=data.length;
  if(total>MAX_TOTAL_BYTES)fail("打包文件总量超过安全限制");
  const crc=crc32(data),header=new Uint8Array(30+nameBytes.length);
  u32(header,0,0x04034b50);u16(header,4,20);u16(header,6,0x0800);
  u16(header,8,0);u32(header,10,0);u32(header,14,crc);
  u32(header,18,data.length);u32(header,22,data.length);
  u16(header,26,nameBytes.length);header.set(nameBytes,30);
  const c=new Uint8Array(46+nameBytes.length);
  u32(c,0,0x02014b50);u16(c,4,20);u16(c,6,20);
  u16(c,8,0x0800);u16(c,10,0);u32(c,12,0);
  u32(c,16,crc);u32(c,20,data.length);u32(c,24,data.length);
  u16(c,28,nameBytes.length);u32(c,42,offset);c.set(nameBytes,46);
  local.push(header,data);central.push(c);
  offset+=header.length+data.length;
 }
 const centerSize=central.reduce((n,x)=>n+x.length,0);
 const end=new Uint8Array(22);
 u32(end,0,0x06054b50);u16(end,8,entries.length);u16(end,10,entries.length);
 u32(end,12,centerSize);u32(end,16,offset);
 return new Blob([...local,...central,end],{type:"application/zip"});
}
root.SRMZip=Object.freeze({create,MAX_ENTRIES,MAX_TOTAL_BYTES});
if(typeof module!=="undefined"&&module.exports)module.exports=root.SRMZip;
})(typeof window!=="undefined"?window:globalThis);
