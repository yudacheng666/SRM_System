# PR38 独立验收 / TEST-ONLY

**结论：PASS（本次定向及所列回归范围）。建议PR38合入其目标开发分支`feat/20261019-srm-ui-v3-integration`；不代表整个软件验收完成，不建议据此直接合入main。没有执行任何合并。**

PR36的P2首次供应商询价包导出及P3纯导航误报，在本轮真实操作中均通过；真实未保存修改仍被导出/新建/S4保护。未确认新的产品P1/P2/P3。原始诊断中1条观察断言false保留并解释，不能说“所有原始断言都通过”。

## Version and CI gate / 版本门槛

- Product SHA: `9633c03948b1763f99dfa8c2f2f5edc5aa87ba70`. Direct checkout, not a synthetic PR merge. PR38 HEAD unchanged at start/end, Draft/open/unmerged.
- Tree: `33688a7d740816f3082606c87e00ee367ff575ea`; served `/` SHA256 `bc4288bf60f8971f8549dac3bdb4015617a23eeb4ce383ed103c66908f00cb6b` equals checked-out M1-Lite index.
- [UI Unified #54 /39389547065](https://github.com/yudacheng666/SRM_System/actions/runs/39389547065): Linux118517460442 and Windows118517460797 SUCCESS.
- [S3/S4 #157 /39389547071](https://github.com/yudacheng666/SRM_System/actions/runs/39389547071): Linux118517460648 and Windows118517460793 SUCCESS.
- Linux logs show46/46Chromium tests passed; artifact quota warnings retained as a CI evidence limitation. CI is a gate, not this independent test conclusion. No CI reruns were used.
- [Gate/comments/jobs](evidence/github-gate.json), [final PR identity](evidence/github-final.json), [HTTP identity](evidence/runtime-identity.json), [UI CI log](evidence/ci-ui-linux.txt), [S3/S4 CI log](evidence/ci-s3s4-linux.txt), [protected refs before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt).

## 独立方法与虚构数据

2026-10-20主浏览器UTC08:18:22–08:23:45（北京时间16:18:22–16:23:45），真实Chromium154.0.8037.57、Playwright1.58.2，正式M1-Lite，非PR23静态原型。隔离SQLite：`/tmp/r38/data`、`restore`、`restore-final`、`fault-data`、`fault-data-r2`；服务9380–9384。后两目录分别保存原观察失败和独立补验，未覆盖旧资料。所有五个本轮自建服务已匹配精确命令/端口停止，未删除数据。未访问原有业务数据。

主虚构RFQ `RFQ-1792484313429-8IMKQH`，另建空RFQ验证切换。4行物料：同编码M16/M20（10/25件）、明确不供货4件、8/12高价理由项6件；A/B/C虚构供应商，592字节真实PDF。独立驱动为采购员操作路径，复用了本项目此前Codex自建独立方法并增加真正第2轮和脏数据安全场景，没有执行现有CI用例作为替代。原产品测试和CI未编辑；独立方法以TXT归档。

## 结果

| ID | Result | Scope / 范围 | Evidence / 证据 |
|---|---|---|---|
|G01|PASS|唯一SHA及两项CI Windows/Linux；HTTP产品字节与checkout一致 / Exact SHA, CI and HTTP byte identity|[evidence](evidence/runtime-identity.json)|
|P2|PASS|重走原分配→生成询价单→选A→首次下载，无重试即成功 / Original first supplier ZIP path, no retry|[evidence](evidence/P2-original-path-result.json)|
|P3|PASS|只读分配视角/供应商导航不误报未保存，完整前后快照相同 / No false dirty warning after view-only navigation|[evidence](evidence/P3-original-path-result.json)|
|S01|PASS|真实新物料未保存时：导出拒绝、新建丢弃警告、S4禁用/邻近原因可见 / Real unsaved edit protects export, New RFQ, S4|[evidence](evidence/safety-retest/dirty-safety-results.json)|
|S02|PASS|真实PUT进行中及受控500后保护；真保存后清除提示并允许导出 / In-flight PUT/controlled500 preserve protection, true save clears|[evidence](evidence/safety-retest/final-fault-results.json)|
|S03|PASS|双浏览器真实后端409和实际断服，数据不覆盖，重载/真保存恢复 / Actual backend409 and service outage safety|[evidence](evidence/safety-retest/final-fault-results.json)|
|B01|PASS|真实XLSX物料/供应商、同编码两规格、追加多对多分配、既有报价防解除 / Imports and additive assignments/history guard|[evidence](evidence/02-supplier-multi-allocation.png)|
|B02|PASS|图纸唯一/多候选/未匹配预览、人工确认、重启后原生PDF显示 / Drawing preview, match confirmation and PDF|[evidence](evidence/PDF-real-preview-after-restart.png)|
|B03|PASS|同轮V1/V2锁定、草稿不生效、历史不变及差异展示 / Quote version history and effective-state rules|[evidence](evidence/V04-V2-confirmed-diff.png)|
|B04|PASS|20/20并列单项/键盘/批量定标；8/12高价理由，重开/清除待核对 / Tied-lowest and higher-price awards/review lifecycle|[evidence](evidence/T09-reconfirmed-C-no-pending.png)|
|B05|PASS|真实第2轮7/19/7录入、确认、定标、金额587/717、历史和F5保持 / Real round2 and persisted decisions/history|[evidence](evidence/R2-final-decision.png)|
|B06|PASS|实际CSV/XLSX/单家和三家嵌套ZIP内容/隐私/PDF校验 / Actual exports, scope, blank prices and PDFs|[evidence](evidence/extra-file-validation.json)|
|D01|PASS|保存/F5/跨RFQ/实际主服务重启；非法取消预览不改业务 / Save, refresh, RFQ switch, restart and invalid preview safety|[evidence](evidence/19-final.json)|
|D02|PASS|24次RFQ返回/顶部管理/S4快速下载，24成功0失败0超时 / 24 rapid S4 downloads after RFQ switch|[evidence](evidence/obs-attempts.csv)|
|D03|PASS|25本轮新S4，CRC、manifest、SQLite当前/历史全行及PDF /25new archives with complete DB and PDF validation|[evidence](evidence/archive-validation.json)|
|D04|PASS|两个空目录恢复、两个非空拒绝且数据不变 / Two empty restores, two nonempty refusals|[evidence](evidence/history-final-restored.json)|
|U01|PASS|1024×768/1366×768/1600×900导航布局、V01–V04/禁用按钮提示 / Three viewport layout and disabled-control checks|[evidence](SCREENSHOTS.md)|
|OBS|FAIL assertion; product PASS / 观察断言失败，产品保护有证据|初次安全诊断误读折叠状态innerText为空；原trace已有正确拒绝，独立观察修正后复验31/31 / Initial observer failure preserved, corrected fresh run31/31|[evidence](evidence/RAW-first-safety-classification.json)|
|N01|NOT TESTED|Windows本机、桌面Excel重算/打印、物理磁盘满/断电及长期负载 / Native Windows, desktop Excel and physical failures/long load|[evidence](REPORT.en.md)|
|N02|NOT TESTED|完整PR23像素一致性、所有业务组合/阶梯价/所有模板填充重导入 / Full design parity, all tier-price/import combinations|[evidence](REPORT.en.md)|

## 两个原问题：按原路径重走

**P2-EXPORT-01 PASS。** 已保存RFQ→供应商分配→生成询价单→选择U24-A→首次下载。真实下载直接得到`downloads/supplier-A.zip`，只有一次A下载、没有20秒超时、没有重试/点击保存掩盖问题。随后B和全部打包亦成功；完整持久化数据不变。核对单家Excel4条已分配行、保留RFQ Line ID、报价单价空、无ERP私有额外字段或竞争方，PDF内容与已保存原图一致。三家总包解开各自嵌套ZIP，C仅获自己分配的1行且无未分配图纸。[精确路径结果](evidence/P2-original-path-result.json)、[操作后截图](evidence/P2-first-supplier-exports-pass.png)、[ZIP](downloads/supplier-A.zip)。截图拍在后续B/总包成功后，首次A下载时间/顺序以JSONL和trace为准。

**P3-NAV-01 PASS。** 已保存/重启RFQ→分配→供应商优先→选B→新建。完整前后内存快照相同，确认文字为正常“新建一笔空白询价？原来已保存的数据仍保存在SQLite”，无“尚有未保存修改”。取消确认后DB/PDF全量不变。native confirm文字在dialog事件/trace，PNG明确是取消后。[前后快照/确切dialog](evidence/P3-original-path-result.json)、[截图](evidence/UI-view-navigation-dialog-dismissed.png)。

原失败参考：[PR36 P2](https://github.com/yudacheng666/SRM_System/blob/c1c686dfb51ebeed662f7f63d6f27df2d51547f8/docs/uat/20261020-pr24-integration-d411-continued/ISSUE-P2-EXPORT-01.md)、[PR36 P3](https://github.com/yudacheng666/SRM_System/blob/c1c686dfb51ebeed662f7f63d6f27df2d51547f8/docs/uat/20261020-pr24-integration-d411-continued/ISSUE-P3-NAV-01.md)。旧SHA d411f4e的失败不改写；新SHA的PASS来自本轮重新操作，不继承旧报告结论。

## 安全反例和失败原证据

独立fresh目录真正添加`PR38-TRUE-DIRTY`物料，内存有行、数据库无行；暂扣真实autosave PUT，仅用于固定可观察顺序，未修改内部状态或产品保护。导出明确拒绝未保存，新建弹放弃真实修改警告且取消不丢数据；S4禁用，项目区收起且页面滚动后邻近红色原因可见、无备份请求。真实PUT进行中保持禁用，受控500后警告/数据库保持；实际手动保存成功后清除旧提示，真实提交新增行并允许导出。[31项补验结果](evidence/safety-retest/final-fault-results.json)、[脏数据导出](evidence/safety-retest/TRUE-DIRTY-export-blocked.png)、[S4邻近原因](evidence/safety-retest/TRUE-DIRTY-S4-blocked.png)。

真实并发409：暂扣第一浏览器PUT，让第二浏览器真实保存，再释放陈旧PUT，后端返回409；保持警告、不调用备份、不覆盖胜出数据库，安全重载清除提示。真实断服使用SIGTERM本轮9384进程，保存收到网络错误；原因保持、备份禁用、数据库不变，重启后真实保存清除。500明确为浏览器网络层受控响应；409是真实服务器冲突，断服是真实进程停止，不混称。

**必须保留的观察断言FAIL：** 原`fault-data`诊断2条检查1true/1false。产品已正确拒绝导出，原trace甚至记录`pilotReportHint`正确拒绝文字和`pilotSaveStatus`定位文本；但诊断使用折叠Details内`innerText`返回空，导致“应包含未保存文字”断言false。原driver停止，未执行后续安全分支。只将本轮独立观察方法改为`textContent`，在另一个全新`fault-data-r2`复验完整序列31/31；产品、原有测试和CI未动。原false、原日志、原trace和原DB不变比较全保留，不删除/覆盖，也不误报为产品安全失败。[分类](evidence/RAW-first-safety-classification.json)、[原trace拒绝文字](evidence/RAW-first-safety-message-trace.json)、[原trace](evidence/conflict-recheck-trace.zip)、[新完整trace](evidence/safety-retest/conflict-recheck-trace.zip)。

安全RFQ无PDF，因此保存成功后的单家导出实际为XLSX。独立驱动原存名`after-genuine-save-supplier-A.zip`是测试命名不准确，原文件保留，并新增完全相同字节`.xlsx`便捷别名；不是S4文件，不计25份S4。格式和哈希见[safety-export-format](evidence/safety-export-format.json)。

## 采购/文件/备份业务回归

追加分配不覆盖已有供应商；有确认报价时解除关联被拒绝。报价A10→同轮V2=9，草稿不生效，V1保留；A/B20并列单项/键盘/批量选任一无非最低理由，真实8/12拒绝空白理由。新C20不使已选B20失效；B修订21后正确重开待复核、F5保持，改选C20清除。

再真实创建A第2轮，按4个RFQ行导入7/19/不供货/7，草稿期间仍用第1轮9，确认后采用第2轮7和19；所有此前已确认提交逐对象完全不变。逐项改选A最低价，旧高价理由清空，人工已选3、待决定/同价待核对/新报价待复核皆0，保存F5保持。实际CSV、业务和比较Excel核对轮次版本历史与数量金额：10×7+25×19+6×7=587，B为717；之前阶段638/692及638/717也核验。未报价/不供货不是零。Excel公式文本核对，不冒称桌面Excel引擎已重算。

跨RFQ、F5、真实主服务终止重启均保存业务/PDF；非法及取消预览不改版本/行号/数据。真实PDF原生查看器可见虚构文字，正常关闭。

24次RFQ切出/返回→顶部管理→立即S4下载：24成功、0失败、0超时，入口至备份点击约128–426ms。前20次只读CDP日志dirty/busy/blocked均false，最后4次停用guard日志仍成功；未修改产品脚本。每次POST201/GET200和真实下载事件保留。另首份S4共25本轮新文件，0历史输入。293文件/事件断言逐份检查CRC、manifest哈希、SQLite完整性、全部workspaces及workspace_versions字段行、PDF字节。一早一晚两份ZIP恢复至两个独立空目录，当前/完整历史/PDF一致；两个非空目标拒绝且不覆盖。恢复不是只看页面无报错。

统计分层：主浏览器207/207；新鲜安全补验31/31；初次观察2条中1false保留；归档事件293/293；业务文件37/37；额外文件/路径40/40。断言层级不相加称为独立业务用例数。主/安全浏览器无pageerror；3条主console404图标请求保留，不当作采购业务失败。

## NOT TESTED及合入建议

Windows本机、桌面Excel重算/打印、真实磁盘满/断电、生产数据/长期压力、完整PR23像素级对照、全部模板填充重导入和阶梯价/所有组合未测。本轮手动安全S4视口为1366×768；三尺寸页面/禁用报价提示已重跑，三尺寸全部保存失败时序没有穷尽。现有S4 SQLite/PDF不声称包括原始邮件/截图。

**建议：PR38在本次修复和已测范围内可以合入其目标开发集成分支，实际合并由负责人决定。** 没有未解决的新确认P1/P2/P3阻止这一建议；初次观察false已用原trace分类和独立新环境验证。不能据此宣布PR24整软件、main发布或未测项目PASS。TEST-ONLY：只新增报告和证据分支，未更改产品/现有测试/CI/开发/main引用，未合并/关闭PR。

## 证据

[106张截图](SCREENSHOTS.md) · [主trace](evidence/independent-v31-browser-trace.zip) · [主浏览器](evidence/browser.jsonl) · [S4逐次CSV](evidence/obs-attempts.csv) · [S4网络/guard](evidence/obs-browser.jsonl) · [安全浏览器](evidence/safety-retest/conflict-recheck-browser.jsonl) · [主服务](evidence/server.log) · [安全初始服务](evidence/safety-retest/fault-server.log) · [安全重启服务](evidence/safety-retest/feedback-server.log) · [恢复服务1](evidence/restore-server.log)/[2](evidence/final-restore-server.log) · [完整归档校验](evidence/archive-validation.json) · [分层机器结果](results.json) · [SHA256](SHA256SUMS.txt)。
