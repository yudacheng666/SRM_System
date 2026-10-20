# OBS-01 独立诊断报告 / Independent backup-download diagnosis

**唯一产品目标 / Exact product SHA:** `0cd1278468d0471b862e16ca4ffcac41aead5e6d`  
**日期 / Date:** 2026-10-20，北京时间10:34–10:43（UTC02:34–02:43，为点击样本区间）。  
**分支 / Evidence branch:** `test/20261020-pr24-obs01-diagnostic`  
**TEST-ONLY：无产品、原测试、CI、开发分支或main改动，无合并、关闭PR或已有业务数据覆盖。**

## 结论 / Conclusion

**OBS-01 已复现。下载流程验收 FAIL。已确认一条导致同症状的产品根因：非业务的管理入口点击设置内部dirty标志，但未同步禁用备份按钮；随后备份点击在dirty保护条件处静默早退。**  
**REPRODUCED; ROOT CAUSE IDENTIFIED FOR THIS RUN.** An enabled backup button can silently do nothing because a non-business admin click sets internal `dirty=true` without updating button availability. The download handler exits before any API call.

本轮 **28次点击尝试：13次成功下载，13次异常超时（各20秒），2次自动保存进行中的预期禁用阻止（各1秒观测无下载）**。成功下载与预期禁用控制合计15 PASS，异常下载13 FAIL。原始下载等待到期共15次，**其中2次是预先声明的禁用负向控制，不是额外产品失败**。没有备份API HTTP错误、没有requestfailed；13份成功ZIP均通过实际SQLite/快照校验。

28 attempts: **13 successful downloads, 13 unexpected 20-second download-event timeouts, 2 expected disabled-button controls** observed for 1 second each. Report cases: 15 PASS including expected blocks, 13 FAIL. All raw outcomes are retained. These deliberately timed samples do not estimate a real-world population failure rate.

**现有OBS-01由可靠性观察升级为已确认P2功能/操作反馈缺陷，不建议关闭。产品没有修复；等待或重试成功只证明时序依赖，不证明问题消除。** 未发现其他新的已确认产品缺陷，也未重开已PASS的P2-B01/P3-U01/V05。

**历史PR #28那一次的精确因果仍为 `ROOT CAUSE UNKNOWN`**：旧记录没有内部入口标志。本轮证实同版本、同操作路径、同无请求/无下载症状的一条原因；推测旧超时可能同因，但不能把推测写成历史事实。The historical single event cannot be conclusively attributed retrospectively. The present reproductions have direct gate-state evidence; the old event remains causally unproven.

## 任务、版本与环境 / Task, version and environment

- 已读[最新OBS交接](https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6281881981)、PR #28报告及原始超时trace/log。仓库状态与任务一致，PR #24 HEAD仍为指定0cd12784，Draft、未合并。[交接快照](evidence/github-task.json)。
- 新独立worktree `/tmp/srm-obs01`、新临时 `SRM_DATA_DIR=/tmp/obs01/data`，正式M1-Lite `prototype/m1-lite/tests/e2e/serve.py 8990`。没有启动PR23原型；没有使用合成merge作为运行目标。
- [checkout核对](evidence/checkout.json)、[运行身份](evidence/runtime-identity.json)：实际HTTP返回HTML与此SHA的正式`index.html` SHA256逐字节一致，哈希 `35bf976459f693cfa45124828c053e116e51baed9596f067a20cd4ef2053bde3`。
- Linux Codex Cloud，Chromium154.0.8037.57、Playwright1.58.2、1366×768。仅虚构采购件；新建两个RFQ，A有一行物料、B为空，随后在A增加三个虚构行以触发真实自动保存。B始终未改。[fixture](fixtures/material.xlsx)、[初始状态](evidence/01-seed.json)、[最终状态](evidence/04-final.json)。

Only the requested exact product was run, with fresh isolated SQLite and fictional materials. No existing user data was read or overwritten. Existing CI or unrelated UAT was not rerun as a substitute for this diagnosis.

## 实证根因链 / Evidence-backed causal chain

1. 经真实GUI在A/B间切换，返回A；打开顶部“数据与备份”入口，再快速点击可见的“下载S4完整备份”。
2. 被动DOM监听捕获trusted pointer/click，按钮`disabled=false`；不是Playwright尚未点击、遮挡或禁用按钮导致的失败。
3. 9个带入口观测的失败样本（D02–D09、S03）在真实`downloadS4Full()`首行同时记录：`s4Available=true, busy=false, dirty=true, blocked=false, disabled=false`。
4. 真实处理函数在`if(!s4Available||busy||dirty||blocked)return;`返回。没有`POST /api/backups/full`、没有后续GET、没有download事件，也没有明确的“备份未开始”反馈。
5. 同期自动保存状态仍显示“已同步…无待保存修改”或“已自动保存”，但保存状态的通用文案可能称“工作内容可能有未保存修改”。UI与入口保护条件不一致。
6. 只等1000ms、不改业务数据，4个同路径对照全部成功；改为管理区内部原生details入口、避免顶部admin点击，2个立即下载对照全部成功。移除CDP入口logpoint后4个同路径立即下载仍全部超时，证明logpoint不是必要触发条件。

The trusted click reaches the handler, whose `dirty` guard exits before network activity. UI labels/button state are inconsistent with that guard. Waiting for a poll or using the native details opener avoids the observed race; neither is a fix. Four reproductions without the gate logpoint support that the logpoint did not create the failure condition. Passive listeners and normal Playwright instrumentation remain, so no population-rate claim is made.

### 具体失败样本 / Concrete failure example

**D02，2026-10-20 10:35:32北京时间 / 02:35:32UTC：**
- 02:35:32.047Z trusted click，`disabled=false`，自动保存文案为“已同步第1版；无待保存修改”。
- 02:35:32.048Z 入口观测：`dirty=true`，其余三个保护标志均不阻止执行。
- 之后20秒：无备份请求、无download，判FAIL。原始事件以页面`date/mono`记录；Node接收时间可能略晚，不能按异步接收顺序反推浏览器内执行顺序。

[逐次记录](evidence/attempts-enriched.json) / [CSV](evidence/attempts.csv) / [D02截图](evidence/D02-after.png) / [完整原始日志](evidence/browser.jsonl)。第二段有效trace中的S03亦直接捕获同样的dirty早退失败：[trace](evidence/trace-part2-complete.zip)、[S03截图](evidence/S03-after.png)。

### 只读源文件佐证 / Read-only source corroboration

运行时证据之后再核对固定SHA源文件，未据代码阅读直接判功能：
- [L5402点击捕获](https://github.com/yudacheng666/SRM_System/blob/0cd1278468d0471b862e16ca4ffcac41aead5e6d/prototype/m1-lite/index.html#L5402)：排除了`#pilotControls`等内部控件，但顶部`data-srm-v2-action=admin`不在排除范围；点击置`dirty=true`，未调用`buttons()`同步状态。
- [L5458下载保护](https://github.com/yudacheng666/SRM_System/blob/0cd1278468d0471b862e16ca4ffcac41aead5e6d/prototype/m1-lite/index.html#L5458)：dirty时无提示早退；API调用在保护条件之后。
- [L5282轮询](https://github.com/yudacheng666/SRM_System/blob/0cd1278468d0471b862e16ca4ffcac41aead5e6d/prototype/m1-lite/index.html#L5282)核对实际业务签名，无变化时清dirty；[L5027](https://github.com/yudacheng666/SRM_System/blob/0cd1278468d0471b862e16ca4ffcac41aead5e6d/prototype/m1-lite/index.html#L5027)定义轮询750ms。这解释了为何等待超过一次轮询可恢复，而不是服务器自行修复。

Root cause category: **UI state inconsistency → handler triggered but request not issued**, not server failure or a completed response lost by Chromium.

## 分组结果 / Results by group

| 分组 / Group | 成功下载 | 异常超时 | 预期禁用阻止 | 说明 |
|---|---:|---:|---:|---|
| D01–D10，A/B切换返回后首次下载 | 2 | 8 | 0 | 返回后等1500ms，顶部admin后立即下载；D01有截图开销，其他立即样本跳过点击前截图 |
| D11–D14，同路径admin后等1000ms | 4 | 0 | 0 | 超过750ms轮询；无业务修改 |
| D15–D18，移除CDP入口logpoint | 0 | 4 | 0 | 保留被动DOM/网络观测；仍是真实浏览器点击 |
| S01–S06，自动保存时序 | 3 | 1 | 2 | 两个进行中控制被禁用；完成后3次成功；S03刚保存完又点admin仍可早退 |
| C01–C02，内部原生details入口 | 2 | 0 | 0 | 同样RFQ切换，不经顶部admin，立即下载 |
| R01–R02，第二段trace附加对照 | 2 | 0 | 0 | R01立即样本刚好通过，不人为改写结果；R02等1000ms通过 |
| **合计 / Total** | **13** | **13** | **2** | **28次，所有样本保留** |

R01成功说明短时窗口依赖轮询相位；不能说每次快速点击必失败。D01点击前截图增加耗时，D02起取消该截图以避免观测遮蔽短窗口，仍保留状态JSON、trace与点击后截图。

Full per-attempt timestamps, button/save states, exact gate flags when available, request/response timings, download outcomes and files are in [ATTEMPTS.md](ATTEMPTS.md). No successful samples were substituted for failed ones.

## 自动保存及数据安全 / Autosave and data safety

- 自然自动保存：通过正式物料单条录入/预览确认产生实际业务变化。S03在真实PUT200及已自动保存文案后，顶部admin点击重新置dirty；仍可能触发静默早退。
- 可控进行中场景：仅在浏览器运行时将一次真实SQLite PUT请求延迟3000ms，无响应篡改、无服务错误注入、无产品文件修改。S01/S05记录保存进行中、按钮disabled，原生鼠标点击不能提交备份，是预期保护。S02/S06保存完成后下载成功。
- 全部纯切换/下载样本后，A/B原始revision与snapshot hash均未变；进行中场景只添加预先声明的虚构物料。最终A含4个预期物料，B保持原始哈希不变。
- 13份下载ZIP均验证ZIP完整、SQLite `integrity_check=ok`、2个RFQ、活动RFQ备份revision与当次一致、另一个RFQ哈希不变。备份POST均201、文件GET均200；本轮POST完成耗时5–27ms、GET3–77ms。失败样本未产生备份请求。总计[94项证据/文件检查](evidence/file-validation.json)通过，**不能抵消13个下载失败**。

Controlled network delay was confined to this disposable browser/data environment. Normal saved-state download controls pass, while the real in-flight save correctly blocks backup. Successful archive integrity does not turn silent no-op samples into PASS.

## 事实、推测、未知 / Facts, hypotheses, unknowns

**已证实 / Established:** 同SHA真实GUI复现；可信点击、可用按钮、dirty早退；13异常样本无请求/下载；1000ms和native-details对照成功；移除入口logpoint仍复现；成功ZIP/SQLite正确。

**有依据的推测 / Supported hypothesis:** PR #28那次相同路径、同版本、同无请求症状可能也是此dirty窗口；其旧trace没有内部标志，不能确定。

**未知或未测 / Unknown / NOT TESTED:**
1. 历史PR28单次的精确因果：`ROOT CAUSE UNKNOWN`，不伪称已追溯证明。
2. 产品修复后验证：未执行，产品未改，不能说“已解决”或建议直接关闭。
3. 无任何监听的纯人工操作失败率、Windows本机、长时间/大数据/网络中断等可靠性矩阵：未测。样本是定向时序调查，不代表总体概率。
4. 本轮没有PDF/供应商报价大数据，本目标不重跑已通过业务UAT，不扩大为整个S4或产品通过。

## 诊断工具异常与trace限制 / Harness incidents and trace limits

第一段在S02完成后，诊断代码过早撤销仍有延迟handler的route；handler随后继续而报`Route is already handled!`，Node退出。**这属于诊断脚本清理错误，不是产品异常**。浏览器初始空RFQ阶段还出现2个`__obsState`读取null快照的pageerror，堆栈明确指向观测器；仅临时观测器改为null-safe。全部错误、源代码记录和时间仍保留：[incident](evidence/harness-incident.txt)、[原始日志](evidence/browser.jsonl)。

第一段Playwright临时trace在进程退出时被清理，**不可用，未伪造恢复或提供空ZIP当trace**。因此D01–D18、S01/S02有逐次状态/事件/截图/server日志，但没有可回放trace。第二段使用同一隔离SQLite恢复，核对先前写入和B未改变，正确等待handler结束再撤销route；[完整trace](evidence/trace-part2-complete.zip)覆盖S03/S04、C01/C02、R01/R02、S05/S06，包含一次直接同症状失败及成功/禁用对照。源文件、原测试、CI未改。

A diagnostic cleanup crash and null-read observer errors are explicitly retained. The lost first trace is a coverage limitation; the complete second trace supplies independently repeated failure/control evidence. Do not read console progress labels such as “24 planned attempts” as counts; authoritative totals come from 28 persisted attempt records.

## 缺陷与建议 / Defect and recommendation

**P2-OBS01：备份入口可用状态与dirty保护不同步，快速点击静默不下载。**  
页面：数据与备份；类型：功能错误/操作反馈。影响：采购员看到可点击按钮但备份不生成，可能误以为已启动；重试才成功，削弱备份可信度。没有观察到数据丢失或备份内容损坏。

**最小复现 / Minimal reproduction:** 保存两笔虚构RFQ → 切到B再返回A → 点击顶部“数据与备份” → 在下一次750ms轮询前点击S4备份 → UI仍可点但dirty guard直接返回，无POST/下载。不是每个轮询相位都失败，多次快速操作可复现。

**预期 / Expected:** 实际业务未变时应允许备份；如果确实需等待保存，按钮状态与保护条件同步且明确反馈“未启动/等待保存”，不能静默吞掉已接受的点击。

**修复方向（仅建议，未实施）/ Direction only:** 区分非业务管理入口与数据修改；统一dirty、按钮与自动保存提示；在受保护路径显示清楚反馈。新增针对快速RFQ返回/打开admin/立即备份及真正保存中禁用的回归，由开发者处理。不要仅加固定等待来掩盖产品问题。

**保留OBS-01/缺陷待修复，不自行关闭或合并。** 找到原因不等于修复完成。已PASS的P2-B01/P3-U01/V05保持原结论，本报告不重开它们，也不宣布全产品可靠性通过。

## 证据索引 / Evidence index

[逐次表](ATTEMPTS.md) / [JSON](evidence/attempts-enriched.json) / [CSV](evidence/attempts.csv) / [browser log](evidence/browser.jsonl) / [server log](evidence/server.log) / [完整第二段trace](evidence/trace-part2-complete.zip) / [统计](evidence/summary.json) / [校验](evidence/file-validation.json) / [SHA256](SHA256SUMS.txt)。

[旧PR28证据来源](evidence/previous-pr28/provenance.json)：历史对照为原证据提交5660a020的原报告、截图与trace/log抽取，不当作本轮新样本。13份本轮ZIP只含虚构数据，在downloads目录归档。临时诊断driver以`.txt`保留供审查；未提交可执行测试或改动任何原测试。
