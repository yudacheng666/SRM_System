# PR24 C03起独立续验 / TEST-ONLY

**NOT-READY。C03、C04、C05在新环境通过；C06首次非预期操作超时后立即停止，C06余项和C07–C09未测。失败分类：测试前置状态／操作路径错误，未确认新的产品P1/P2/P3。不能批准PR24合入或宣布整个软件完成验收，仍须ChatGPT审核。**

执行[新任务评论](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6287590146)。PR40原失败报告、trace和证据保持不变。本轮事先阅读PR40失败及只读源码，写好正确人工指定步骤；全新临时SQLite，仅用最小虚构物料/PDF准备，不计作C01/C02再次验收。

## Exact version and CI / 准确版本与CI

Product: `c8429ef51731da570c7a556d7cdce89e7123e739`. PR24 exact HEAD before/after; Draft/open/unmerged. Direct checkout, real official M1-Lite (`prototype/m1-lite`), real Chromium154.0.8037.57 / Playwright1.58.2. Served HTML equals checkout SHA256 `bc4288bf60f8971f8549dac3bdb4015617a23eeb4ce383ed103c66908f00cb6b`. New isolated SQLite `/tmp/c842r2/data`, service9430.

- [UI Unified #55 /39394554901](https://github.com/yudacheng666/SRM_System/actions/runs/39394554901): Linux118533929283 / Windows118533929739 SUCCESS.
- [S3/S4 #158 /39394554892](https://github.com/yudacheng666/SRM_System/actions/runs/39394554892): Linux118533929189 / Windows118533929525 SUCCESS.
- [Task/comments/gate/jobs](evidence/github-gate.json), [final HEAD](evidence/github-final.json), [runtime identity](evidence/runtime-identity.json), [protected refs before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt). No CI reruns as independent evidence, no prior-SHA PASS inherited.

## 实际方法与范围

主浏览器UTC2026-10-20 09:16:52–09:21:24（北京时间17:16:52–17:21:24），1366×768，虚构RFQ `RFQ-1792487839576-POZOBQ`。4行物料：同码M16/M20、数量10/25，底座4件和另一物料6件；三份有效虚构PDF、三家虚构供应商。没有真实采购资料，没有访问旧业务数据。9431恢复服务和其他浏览器未启动。自建9430已停止，数据未删除。

| Scope | Result | Detail / 细节 | Evidence / 证据 |
|---|---|---|---|
|SETUP|SETUP ONLY|重建4物料及虚构PDF，非重新验收C01/C02 / Minimum synthetic RFQ only|[evidence](method/00-minimum-setup-C03.js.txt)|
|C03|PASS|两份人工指定、确认前不写入、保存关系/三PDF哈希、真实PDF查看器 / Manual overrides, save and PDF bytes/viewer|[evidence](evidence/C03-unmatched-now-real-PDF-viewer.png)|
|C04|PASS|新下载供应商模板填写导入、追加多对多与视角保持关系 / Native supplier template import and additive relationships|[evidence](evidence/05-additive-supplier-allocation.png)|
|C05|PASS|同轮修订/历史、第二轮限制范围、阶梯、明确沿用、比较与定标 / Revisions, restricted round2, tiers, carry and awards|[evidence](evidence/09-round2-decisions.png)|
|C06 downloads|PARTIAL PASS|A/B询价ZIP、三家总ZIP及共同范围CSV实际下载；首次A成功 / Actual package/CSV downloads, first A success|[evidence](evidence/C06-first-supplier-A-export.png)|
|C06 export picker|FAIL operation: TEST PRECONDITION|误将已打开报表面板切为关闭，选择隐藏类型20s超时 / Toggling an open panel closed then selecting hidden type|[evidence](FAILURE-C06-REPORT-PANEL.md)|
|C06 full content|NOT TESTED|单家/总包完整行数量金额及隔离校验、比较/业务Excel实际导出 / Full output/content/isolation checks and report/business XLSX|[evidence](TEST-SCOPE.md)|
|C07|NOT TESTED|跨RFQ、F5及真实服务重启数据一致性 / Cross-RFQ, refresh and actual restart|[evidence](TEST-SCOPE.md)|
|C08|NOT TESTED|单份S4/内容校验、空目录恢复和非空拒绝 / Single S4 and empty/nonempty restore|[evidence](TEST-SCOPE.md)|
|C09|NOT TESTED|三尺寸关键V3兼容和P3冒烟 / Three-size V3 compatibility and P3 smoke|[evidence](TEST-SCOPE.md)|

## C03 — 真正完成原未测人工路径

先预览，保存指纹不变。对多候选文件和未匹配文件分别执行：行内“指定此文件”→全局“手工指定到”选RFQ行→“指定给选中文件”→读取暂存目标/勾选状态。两份暂存后再次核对DB/PDF未变，随后明确点击确认关联并保存。

已保存精确关系：L00001→`U24-D16_A.pdf`，L00002→`UAT24-SHAFT_A.pdf`，L00003→`NO-MATCH_U24.pdf`，L00004无PDF；三份实际文件SHA与上传字节完全一致。真实原生PDF查看器显示`V31 FICTIONAL UNMATCHED`、1/1页，正常关闭。C03 PASS来自新操作和物理字节，不是源码存在或PR40推测。[暂存](evidence/C03-both-manual-targets-staged.png)、[保存](evidence/C03-confirmed-saved-relations.png)、[原生PDF](evidence/C03-unmatched-now-real-PDF-viewer.png)。日志中一次早期人工截图注释的文本标签写错，随后明确追加更正，原日志未覆盖；实际PNG文字如上，不影响状态/字节断言。

## C04 / C05 — 供应商与完整报价链

新UI下载供应商原生模板，保留表头填3家虚构供应商并真实导入。A/B覆盖4行，C只分配第2行；追加后A/B关系保留，反复切换供应商/物料视角不覆盖。[模板元数据](evidence/C04-template-file.json)、[分配](evidence/05-additive-supplier-allocation.png)。

第一轮A/B实际XLSX报价，确认锁定；A第1轮V1价格10→同轮V2=9，草稿不参与有效报价，确认后V1对象不变，UI展示-1/-10%。20/20选B不需非最低理由；第4行12高于8录入真实虚构理由。

第二轮A限制范围为L1/L2/L4，规格和不可变RFQ身份明确。粘贴L1阶梯`1-9:8|10+:7`及L4=7，L2不报；“沿用上轮”默认不勾选，仅L2为可安全候选，填写供应商明确确认依据并勾核实声明后沿用20。草稿时仍用前轮9；确认后数量10使用10+档7，L2保持20，所有以前确认报价对象完全不变；第2轮锁定。逐项选A后旧高价理由清除，人工已选3、待决定/同价待核对/新报价待复核皆0。UI金额A612、B692，理论和人工612，与10×7+25×20+6×7一致；不供货/未报价未当零元逐行价格。C05涵盖UI与保存后的业务快照，未冒称后续导出文件已经核验。[范围/阶梯预览](evidence/07-round2-tier-and-missing-preview.png)、[明确沿用](evidence/08-round2-explicit-carry-and-tier.png)、[最终决策](evidence/09-round2-decisions.png)、[保存状态](evidence/06-round2-business-final.json)。

## C06 — 下载部分完成，首失败后停止

实际首次A包直接成功，B包、三家总包和共同范围CSV也已下载。随后驱动进入管理区，**未检查报表面板原本已经打开，错误再次点击具有toggle行为的“导出询价单/比价议价单”入口**，将面板关闭，然后尝试选择隐藏的`pilotReportType`。Playwright同一动作等待20秒，在UTC09:21:24.648超时。独立驱动当即记录停止、原截图/内存/SQLite、关闭trace/browser，未重试，未修正失败脚本后继续。

原trace明确记录`pilotReportPanel`由`display:block`变为`display:none`；失败截图没有内部选择器，只显示外部入口。只读源码证明入口按当前showing切换，而不是幂等打开。**TEST PRECONDITION / 未核对toggle状态；不是已确认产品缺陷，也无环境故障证据。** 新一轮若获审核应先读取可见状态，已打开则直接操作；本轮没有执行此后续路径。

[失败细节](FAILURE-C06-REPORT-PANEL.md) · [原停止](evidence/failure-stop.json) · [原失败截图](evidence/FAIL-first-observed.png) · [trace面板变化](evidence/FAIL-report-panel-trace-excerpts.json) · [只读源码](evidence/FAIL-readonly-source.txt) · [分类](evidence/FAIL-classification.json)。

比较/业务Excel未下载，计划的C06文件行/数量/金额/隔离断言未运行。停止后只对现有下载做证据可读/CRC/SHA/成员清单归档，**不把其当业务文件内容PASS**。[文件清单](evidence/downloaded-evidence-inventory.json)。未执行校验器明确以NOT-EXECUTED命名归档，不存在C06-file-checks.json结果。保存当前/PDF与C05结束全量相同，捕获内存等于保存；停止时完整历史归档仅供审核，不宣称已通过重启/恢复。

## 计数、未测与建议

原始浏览器61条检查61true/0false（含准备/导航），另1次独立操作超时；不是“61业务用例全过”。17张实际1366截图、1份CRC有效完整trace；5个下载（供应商模板1、询价ZIP3、CSV1）；0完整S4/0恢复。无pageerror，1图标404保留。没有重跑完整CI、P2/P3套件、24次S4或故障注入。

C06完整内容/隔离/实际比较Excel，C07跨RFQ/F5/真实服务重启，C08单份S4/空白恢复/非空拒绝，C09三尺寸UI兼容及P3冒烟均NOT TESTED。P2首次A下载仅是此次顺路冒烟通过；不能代表完整旧缺陷套件。Windows本机、桌面Excel重算打印、磁盘满/断电/长期负载、所有业务组合仍未测。

建议ChatGPT审核本轮已通过C03–C05及新操作状态错误，再单独安排从C06剩余导出开始完成C07–C09；不要求为了这一测试路径错误修改产品。**本轮仍NOT-READY，不批准PR24或main合并，不宣告整体软件完成。** 只提交独立报告/证据/方法TXT，产品、现有测试、CI、开发/main引用未改，不合并/关闭任何PR。

## Evidence

[17张截图](SCREENSHOTS.md) · [原trace](evidence/independent-browser-trace.zip) · [原浏览器/请求/错误](evidence/browser.jsonl) · [服务日志](evidence/server.log) · [停止时完整SQLite历史](evidence/history-at-stop.json) · [机器状态](results.json) · [范围与预审步骤](TEST-SCOPE.md) · [SHA256](SHA256SUMS.txt)。
