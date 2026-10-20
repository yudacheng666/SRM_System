# PR24 merged candidate: independent continuation / TEST-ONLY

**NOT-READY. The exercised procurement, history and backup/restore paths pass, but one confirmed P2 false export refusal and one related P3 false unsaved warning remain. This is not acceptance of the whole software. No new P1 or observed corruption; untested safety scenarios remain unknown.**

This fresh continuation follows the user's updated authorization to execute the remaining regression. Published PR35 is preserved: its original31checks/30true/1false and bounded follow-up are not rewritten. After newly observed failures, evidence is retained and independent nondependent checks continue under the revised instruction; no product/original-test edits bypass a failure.

## Version and CI / 版本与门槛

- 唯一产品 / Only product: `d411f4e17a0ab8e75412e5c91a91ccba6abbbc0e`; checkout directly at this SHA, not CI synthetic merge `3d50a902...`.
- Tree: `80b2f45b37771b278fb663ebc55f7bf08fedc8ae`. Served `/` bytes equal checked-out `prototype/m1-lite/index.html`, SHA256 `6ab488c8eb0e246e8776187a2222adec07a754b1a83cd5488ae73886812e9ec3`.
- [UI Unified #48 /39379118995](https://github.com/yudacheng666/SRM_System/actions/runs/39379118995): Windows118483896372 + Linux118483896234 SUCCESS.
- [S3/S4 #148 /39379119121](https://github.com/yudacheng666/SRM_System/actions/runs/39379119121): Windows118483896719 + Linux118483896945 SUCCESS.
- Each Linux log reports43Python /10Node /44Chromium passes. Artifact-upload quota warnings remain separate best-effort CI limitations. Independent evidence is archived here; CI does not establish whole-product acceptance.
- [Gate snapshot](evidence/github-gate.json), [final PR state](evidence/github-final.json), [identity](evidence/runtime-identity.json), [before refs](evidence/protected-refs-before.txt), [after refs](evidence/protected-refs-after.txt). PR24 remained Draft/open/unmerged and exact HEAD throughout browser tests; main/development/fix refs unchanged.

## Method and actual coverage

Main browser: 2026-10-20 UTC06:37:52–06:46:18 (Beijing14:37:52–14:46:18). Real Chromium154.0.8037.57, Playwright1.58.2, production M1-Lite and fresh SQLite folders `/tmp/r4/data`, `restore`, `restore-final`, `fault-data`, ports9090–9093. Fictional RFQ `RFQ-1792478290303-FO4WEZ`, a second empty RFQ, four lines, three suppliers and a valid592-byte PDF. No existing business data accessed. Independent scripts are archived as TXT under `method`; actual step sources and commands are preserved in JSONL. No CI suite was simply rerun as a substitute for these browser operations.

Real XLSX materials/suppliers and quotes, two specifications sharing an ERP code, additive assignments, unique/multiple/unmatched drawing preview, confirmed PDF, quoteA10→9 within one round with V1 retained, A/B20 ties, true higher8vs12 requiring reasons. NewC20 keeps the chosenB20; confirmedB21 reopens review, survives F5, selectingC20 clears it. Common-scope totalsA/B638/692 become638/717; theoretical638 and manual662. Unquoted rows remain blank. Real service restart, two empty restores and two nonempty refusals compare all persisted business and PDFs.

## Results

| ID | Result | Scope / 范围 | Evidence / 证据 |
|---|---|---|---|
| GATE | PASS | 准确产品SHA、两项Windows/Linux CI及HTTP文件字节 / Exact product, CI gate and served bytes | [evidence](evidence/runtime-identity.json) |
| B01 | PASS | 真实XLSX物料/供应商导入、同编码不同规格、追加多对多关联 / Real XLSX imports and additive relationships | [evidence](evidence/02-supplier-multi-allocation.png) |
| B02 | PASS | 图纸唯一/多候选/未匹配预览、确认、重启后真实PDF / Drawing matching and native PDF after restart | [evidence](evidence/PDF-real-preview-after-restart.png) |
| B03 | PASS | 报价V1锁定、同轮V2草稿不生效、确认后差异及V1保留 / Quote history, locks and effective revision | [evidence](evidence/V04-V2-confirmed-diff.png) |
| B04 | PASS | 20/20单行键盘及批量定标不需理由；8/12真正高价拒绝空白理由 / Tied-lowest vs genuine higher-price reasons | [evidence](evidence/T04-bulk-B-tie-has-no-exception.png) |
| B05 | PASS | 人工选择清除待核对；C20不误重开，B21重开，F5保留，改选C20清除 / Review lifecycle with new confirmed prices | [evidence](evidence/T09-reconfirmed-C-no-pending.png) |
| B06 | PASS | CSV实际数量金额/共同范围、报价报表/业务Excel内容 / CSV and business/comparison workbook contents | [evidence](evidence/business-file-validation.json) |
| B07 | PASS | 手动保存、F5、跨RFQ、真实服务重启、非法/取消预览不变更业务 / Save, refresh, RFQ switch, service restart and invalid preview safety | [evidence](evidence/19-final.json) |
| S01 | PASS | 24次RFQ切换+顶部管理入口立即S4下载：24成功、0失败、0超时 / 24 rapid S4 downloads after RFQ switch | [evidence](evidence/obs-attempts.csv) |
| S02 | PASS | 本轮25份新S4及3份PR35同SHA历史输入，完整ZIP/SQLite历史/PDF校验 / 25 new plus3 historical archive content checks | [evidence](evidence/archive-validation.json) |
| S03 | PASS | 两份不同阶段备份恢复到两个空目录；两个非空拒绝且不覆盖 / Two empty restores and two nonempty refusals | [evidence](evidence/history-final-restored.json) |
| S04 | PASS | 真实后端409及实际断服保持警告/不备份/数据不覆盖，重载或真保存后清除 / Actual409 and service outage safety | [evidence](evidence/final-fault-results.json) |
| U01 | PASS | 三尺寸页面、导航、V01–V04、禁用报价按钮和解释提示 / Three-size layout and disabled quote controls | [evidence](evidence/prod-1024-items.png) |
| F01 | FAIL P2 | 供应商A首轮询价包导出被“未保存”误阻止，20秒无下载 / First supplier RFQ export falsely refused | [evidence](ISSUE-P2-EXPORT-01.md) |
| F02 | FAIL P3 | 只读界面切换后新建RFQ误报未保存，快照相同 / View-only navigation falsely warns of unsaved edits | [evidence](ISSUE-P3-NAV-01.md) |
| H01 | PASS prior / 原有证据 | PR35同SHA三尺寸S4邻近原因/自动保存清除、BUSY及有限500补验；本轮不重算原31断言 / Prior bounded same-SHA evidence only | [evidence](https://github.com/yudacheng666/SRM_System/blob/f3274a8f0e25b02b8108bfdbb597d839750ab3eb/docs/uat/20261020-pr24-integration-d411f4e/REPORT.en.md) |
| N01 | NOT TESTED | Windows本机、桌面Excel重算打印、生产物理故障/长期负载 / Native Windows, desktop Excel and physical/long-duration failures | [evidence](REPORT.en.md) |
| N02 | NOT TESTED | PR23完整像素一致性、所有业务组合/多轮阶梯价/全部模板重新填充导入 / Full design pixel parity and every business/import combination | [evidence](REPORT.en.md) |
| N03 | NOT TESTED this continuation | 受控HTTP500与route.abort不在本轮重跑；500仅引用PR35有限补验 / Controlled500 and route.abort not rerun | [evidence](REPORT.en.md) |

## Confirmed findings and raw accounting

**P2-EXPORT-01:** Supplier allocation → generate RFQ → selectA → download: no browser download within20s. Product explicitly rejects “unsaved changes” while autosave says revision10 is synchronized with no pending change. Download remains enabled. Subsequently observed in-memory snapshot equals the saved snapshot and persisted fingerprint is unchanged. A single retry without business edit/manual save downloads `retry-supplier-A.zip`; B and all-supplier package then download. The retry does not erase the first failure. [Reproduction, screenshot, exact facts and recommendation](ISSUE-P2-EXPORT-01.md).

**P3-NAV-01:** View-only allocation mode/supplier selection leaves complete memory snapshot unchanged but New RFQ wrongly warns that changes will be discarded. Dismissal preserves data. Native dialog text is evidenced by events/trace; the PNG is explicitly after dismissal. [Details](ISSUE-P3-NAV-01.md).

These are related symptoms of view interactions being treated as dirty. Read-only source supports that candidate explanation: global input/click handlers set dirty, committed export refuses dirty. Exact internal transition at the original export click was not sampled; no code is fixed here and no baseline comparison proves this merge introduced either issue.

Main raw checks189:188true/1false (navigation warning), plus a separate download-wait driver error (outside that boolean denominator). Actual409/outage15/15; file/event integrity311/311; business workbook/CSV checks37/37. These different assertion layers are not a count of all independent business cases. Zero main pageerrors; three console404/icon failures retained. `06b` resumes remaining actions after the export incident; failed original06 and its retry remain visible.

## Backup/restore evidence and limitations

24rapid RFQ-return/admin/S4 attempts:24downloads/0failures/0timeouts. Admin-to-backup click85–796ms. First20 have read-only CDP guard logs showing clean dirty/busy/blocked; final4 disable that logpoint and still download. Each records real201→200 responses and a download event. One earlier full backup makes25new S4 files. Three explicitly attributed PR35 same-product-SHA ZIPs are historical inputs, not new attempts.

All28archives have CRC, manifest DB/PDF SHA, SQLite integrity, every current/history row and phase-appropriate PDF hashes validated. First and latest backup restored in separate blank directories; final entire history equals the source. Two nonempty restores refused without overwrite. ZIP validation is not merely file existence. Business validation of supplierA uses the explicit retry file.

Fresh actual409: hold a real stale PUT, save from a second browser, release to obtain backend409. Previously established S4 notice stays in viewport, no backup API, winning DB intact; safe reload clears it. Actual service stop yields real network failure with retained notice/disabled backup/unchanged DB; genuine post-restart save clears it. These are not mocked409 responses. Three-size local S4 notice/clear, BUSY and bounded controlled500 rely on PR35 same-SHA published evidence; not rerun/recounted here, and its original false is retained.

## NOT TESTED and next action

Native Windows; desktop Excel recalculation/print; actual disk-full/power failure; production/long-duration loads; full PR23 pixel parity; every business combination, multiround tier pricing and filling/reimporting every template: NOT TESTED. Controlled500 and route.abort are not rerun in this continuation. SQLite/PDF backup does not claim original emails/screenshots are included. Full procurement product acceptance remains unproven.

ChatGPT should prioritize P2 export and jointly address P3 false dirty navigation, preserving genuine unsaved/busy/conflict protections. Run CI on the fix SHA, independently reproduce both original paths, genuine unsaved export refusal and S4/restore/core procurement regression. Do not declare PR24 fully accepted based on partial passes. No PR merged/closed; only this independent evidence directory is added.

[98screenshots](SCREENSHOTS.md), [main trace](evidence/independent-v31-browser-trace.zip), [actual-fault trace](evidence/conflict-recheck-trace.zip), [browser](evidence/browser.jsonl), [S4 request/guard events](evidence/obs-browser.jsonl), [fault browser](evidence/conflict-recheck-browser.jsonl), [main server](evidence/server.log), [fault initial server](evidence/fault-server.log), [fault restarted server](evidence/feedback-server.log), [restore server](evidence/restore-server.log), [final restore server](evidence/final-restore-server.log), [structured results](results.json), [checksums](SHA256SUMS.txt).
