// 中文：B0 仅将两份自有静态源码打成单文件，用户打开构建结果不需要联网或安装工具。
// English: Bundle only local first-party sources; the resulting HTML requires no network or tooling.
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const template=fs.readFileSync(path.join(root,"src/m1-b0/offline-shell.html"),"utf8");
const probe=fs.readFileSync(path.join(root,"src/m1-b0/storage-probe.js"),"utf8");
const marker="<!-- INLINE_B0_STORAGE_PROBE -->";
if(template.split(marker).length!==2)throw Error("B0 template marker missing or repeated");
if(probe.includes("</script>"))throw Error("Unsafe closing-script sequence in bundled source");
const output=template.replace(marker,"<script>\n"+probe+"\n</script>");
if(output.includes(marker)||output.includes('src="http')||output.includes('href="http'))throw Error("B0 must be fully offline");
const destination=path.join(root,"prototype/m1-b0/index.html");
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(destination,output,"utf8");
process.stdout.write("M1 B0 offline HTML generated: "+destination+"\n");
