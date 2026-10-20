# PR24 C06–C09独立验收停止报告 / TEST-ONLY

**NOT-READY。C06、C07通过；单份S4文件内容校验通过，空目录恢复API200后独立驱动读取响应体遭遇浏览器协议错误，立即停止。非空恢复拒绝和C09三尺寸未测。失败分类为测试观测前置条件／导航时序问题，未确认产品恢复缺陷或新的P1/P2/P3；不能宣布整个软件完成验收。**

执行[最新评论任务](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6288365279)。PR40/PR41报告及原始失败保持不变。脚本执行前预审并冻结14份文件：toggle先查开合，可见/可用/选项再选择；整个验收期间文件哈希保持不变，没有失败后改脚本重试。

## Exact product and gate / 准确版本与门槛

Product`c8429ef51731da570c7a556d7cdce89e7123e739`; PR24 HEAD exact at start/end, Draft/open/unmerged. Direct checkout; official M1-Lite served bytes equal checked-out SHA256`bc4288bf60f8971f8549dac3bdb4015617a23eeb4ce383ed103c66908f00cb6b`. Real Chromium154.0.8037.57 / Playwright1.58.2.

- [UI Unified #55 /39394554901](https://github.com/yudacheng666/SRM_System/actions/runs/39394554901): Linux118533929283 / Windows118533929739 SUCCESS.
- [S3/S4 #158 /39394554892](https://github.com/yudacheng666/SRM_System/actions/runs/39394554892): Linux118533929189 / Windows118533929525 SUCCESS.
- [Gate/comments/jobs](evidence/github-gate.json), [final HEAD](evidence/github-final.json), [runtime identity](evidence/runtime-identity.json), [protected refs before](evidence/protected-refs-before.txt)/[after](evidence/protected-refs-after.txt). CI not rerun as independent conclusion, prior evidence not rewritten.

## 准备与方法

主浏览器UTC2026-10-20 10:42:36–10:46:11（北京时间18:42:36–18:46:11），1366×768。全新SQLite`/tmp/c06/data`和空恢复目录`/tmp/c06/restore`，正式服务9460/9461。虚构RFQ`RFQ-20261020-C06-INDEPENDENT-R3`：4物料、3供应商、3真实虚构PDF、15条报价历史行、A第1轮V1/V2和第2轮阶梯/明确沿用、人工定标3项。

准备阶段从PR41公开的虚构快照生成新workspaceId/revision夹具，通过正式受保护API创建新工作区、上传PDF、提交关联，未直接写SQLite或修改产品。源报价历史是准备数据，**不是本轮重新操作C03–C05流程的PASS**。准备形成两版快照；后续UI新建第二RFQ后，备份包含2工作区/3历史快照/3附件登记。所有C06–C08验收操作走真实浏览器，所有下载来自正式UI。[准备来源](evidence/setup-provenance.json)、[正式API准备日志](evidence/setup-api-log.json)、[冻结预审](evidence/preflight-frozen.json)、[执行后哈希一致](evidence/frozen-scripts-after-run.json)。

| Scope | Result | Details / 细节 | Evidence / 证据 |
|---|---|---|---|
|GATE|PASS|唯一HEAD/真实HTTP字节/两套CI所有Windows/Linux作业 / Exact version and CI gates|[evidence](evidence/runtime-identity.json)|
|SETUP|SETUP ONLY|正式API装入最小虚构状态，未重复C03–C05完整验收 / Official API fixture only|[evidence](evidence/setup-provenance.json)|
|C06 Excel|PASS|比价/业务Excel实际下载，RFQ行数量/阶梯/历史/来源/共同范围 / Real XLSX contents and quote history|[evidence](evidence/C06-workbooks-checks.json)|
|C06 packages/CSV|PASS|单家/总包行数量/PDF/隔离及CSV金额 / Actual supplier/nested archives and CSV amounts|[evidence](evidence/C06-supplier-checks.json)|
|C07|PASS|跨RFQ/F5/真实进程重启，当前/全历史/附件登记/PDF一致 / Actual persistence and process restart|[evidence](evidence/C07-history-after-restart.json)|
|C08 file|PASS|1份新S4，CRC/SQLite当前历史/资产表/manifest/PDF / Single complete ZIP/DB/PDF integrity|[evidence](evidence/C08-file-checks.json)|
|C08 restore action|HTTP200 observed; verification INTERRUPTED|空目录恢复API200，驱动读取响应体时CDP错误 / Empty restore200, observer protocol failure|[evidence](FAILURE-C08-RESPONSE-BODY.md)|
|C08 readonly evidence|POST-STOP FACT, not original assertion PASS|恢复后只读数据与预期完全相同；原验证链未完成 / Readonly recovered data matches, original chain incomplete|[evidence](evidence/C08-poststop-readonly-observations.json)|
|C08 nonempty|NOT TESTED|首失败后未尝试非空拒绝 / No nonempty refusal attempted|[evidence](TEST-SCOPE.md)|
|C09|NOT TESTED|三尺寸UI关键兼容未运行 / Three-size compatibility not executed|[evidence](TEST-SCOPE.md)|
|P2/P3 smoke|PASS limited|首次A包成功、纯导航新建无假未保存警告 / First supplier and clean navigation smoke only|[evidence](evidence/browser.jsonl)|

## C06 — 完成实际Excel、包与CSV内容验收

先展开管理区，检查报表面板。第一次关闭时仅点击一次入口；后续已展开时不再点击toggle。每次选择前确认类型可见/可用、选项为rfq/comparison；A/B比较组选项存在。先下载比较Excel、业务Excel并完成17内容检查，再切rfq，实际下载A包/B包/三家总包/共同范围CSV，完成45检查。

核验逐条RFQ Line ID和数量10/25/4/6；比较共同范围仅L1/L2/L4，L3不供货/未报价保持空，不当0。数量10使用`10+:7`档，L2明确沿用20，L4=7，A同范围612，B692；CSV逐行单价×数量与金额一致。比较Excel当前有效价7/20/7、正确共同标记及ROUND/SUMIF公式，历史包含A的1|1、1|2、2|1和有效价10/9/7、carry来源。业务表保留4物料/3供应商/15报价行与原阶梯表达式。只校验公式文本和已导出数值，不声称桌面Excel已重算。

单家包和总包内各自嵌套ZIP核验CRC、RFQ身份、数量、空白询价价格，不含竞争方或内部定标/理由字段；A/B各4行和3PDF，C仅自己第2行、数量25和对应1PDF。PDFSHA与物理虚构输入一致。导出未改变保存状态/PDF。首次A下载作为P2有限冒烟通过，不重跑旧套件。[17项Excel](evidence/C06-workbooks-checks.json)、[45项单家/总包/CSV](evidence/C06-supplier-checks.json)、[首次A](evidence/C06-first-A-download-success.png)。

## C07 — 完成真实持久化

F5保留整个当前修订/附件；纯供应商视角导航后新建只出现正常确认，无假未保存警告（P3冒烟）。新RFQ为空、无旧供应商选择；切回原询价全量一致。关闭页面，实际SIGTERM9460原进程并启动新进程，重开浏览器页面，比较两笔当前快照、所有历史行、附件登记及PDF，完全一致。人工已选3/待决定0/待复核0。[真实进程重启记录](evidence/C07-actual-service-restart.json)、[重启后历史](evidence/C07-history-after-restart.json)、[页面](evidence/C07-actual-service-restart-decisions.png)。这不是刷新代替服务重启。

## C08 — 文件通过，恢复观测错误导致停止

仅下载1份S4ZIP。10项检查通过：CRC、manifest数据库SHA、SQLite integrity_check、全部workspaces/workspace_versions行字段、全部assets表、全部PDF及manifest SHA；当前工作不变。向独立空目录正式提交恢复，实际HTTP200已检查通过。

随后脚本`await restoreResponse.json()`失败：

`Protocol error (Network.getResponseBody): No resource with given identifier found`

UTC10:46:11.095第一新非预期错误立即停止，自动保留日志/trace/状态并关闭浏览器，无重试、无脚本修复继续。产品恢复处理在成功分支立即`location.reload()`；原服务日志记录POST200后GET页面重载，trace也有POST200，但没有可恢复的响应体资源。**分类：TEST PRECONDITION / 独立响应体观测依赖跨重载的资源寿命。** 确切Chrome资源保留机制未单独隔离，不把观测错误说成后端恢复失败，也不凭200推断未读到的`verified/restored`字段。没有产品pageerror或后端4xx/5xx证据。

[原错误和分类](FAILURE-C08-RESPONSE-BODY.md) · [原停止标记](evidence/failure-stop.json) · [原trace](evidence/independent-browser-trace.zip) · [协议/POST trace片段](evidence/FAIL-response-json-trace-excerpts.json) · [原响应体缺失证据](evidence/C08-original-response-trace-evidence.json) · [产品重载只读源码](evidence/FAIL-readonly-reload-source.txt)。

停止后只读已有数据：恢复目录当前/PDF和全部历史/附件行，均与备份前2工作区/3历史/3附件一致；主工作区也未变。这是**失败分类用的事后事实**，不是原脚本后续验证已执行PASS。没有重新打开浏览器或另一次恢复。原`verified/restored`响应体断言、恢复页面决策检查、非空拒绝均未运行。失败PNG为停止时**主工作区9460**，不是恢复目标9461的界面；没有伪造恢复成功/失败截图。[只读观察](evidence/C08-poststop-readonly-observations.json)、[恢复后完整历史](evidence/C08-poststop-restored-history.json)。

## 数量、未测与建议

25条原始浏览器断言25true/0false，另1次独立驱动协议错误；不是整轮PASS。文件检查分层为17+45+10均通过，不相加冒称独立业务用例数。7实际下载、7张1366截图、1份CRC有效trace；1次S4下载、1次空目录恢复POST、0次非空尝试、0个C09尺寸。无pageerror，两个图标404保留。C03–C05只作准备，旧24次S4、故障注入、CI及完整P2/P3套件未重复。

**NOT TESTED：非空恢复拒绝、C09的1024×768/1366×768/1600×900关键UI比较；原恢复响应体验证/恢复页断言未完成。** Windows本机、桌面Excel重算/打印、物理故障/长期负载、完整像素一致性及所有业务组合仍未测。本轮1366存在截图不是C09兼容验收通过。

建议ChatGPT审核原协议错误与只读恢复一致性事实；后续独立轮次应避免在产品立即重载后依赖`Response.json()`，改以原始HTTP状态、已恢复数据库和重载后的实际UI验证，并完成非空拒绝/C09。不要因此修改产品恢复逻辑或掩盖原错误。当前仍NOT-READY，不批准PR24合并，不宣布整个软件通过。

严格TEST-ONLY：只新增独立报告/证据/方法TXT；产品、现有测试、CI、开发/main引用不变，PR40/41未改，不合并/关闭PR。两自建服务已停止，隔离数据未删除。

[截图索引](SCREENSHOTS.md) · [浏览器/请求/错误](evidence/browser.jsonl) · [主服务](evidence/server.log) · [恢复服务](evidence/restore-server.log) · [状态JSON](results.json) · [范围/冻结说明](TEST-SCOPE.md) · [SHA256](SHA256SUMS.txt)。
