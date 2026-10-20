# P3-NAV-01 — 只读导航误报未保存 / View-only false unsaved warning

**P3 · 操作体验 / usability · product d411f4e17a0ab8e75412e5c91a91ccba6abbbc0e. FAIL.**

已保存并真实重启后的虚构RFQ。进入供应商分配→切换供应商优先→选择U24-B→打开项目操作→新建。无业务编辑，操作前后完整window.SRMPilot.snapshot()完全一致（含revision7），SHA256均20dff89bad8565b301ef213ae3eecbe2b7f40268988f0df8cccb8eb31459db2f。

预期：新建走正常流程，不声称已保存数据将丢弃。实际：native confirm“当前询价尚有未保存修改，新建将放弃这些修改。继续？”。UTC06:41:15.987断言false。测试取消弹窗，SQLite完整数据/PDF未改变，无实际数据丢失。

[完整前后快照、哈希与弹窗事件](evidence/P3-NAV-01-evidence.json) · [取消后截图](evidence/UI-view-navigation-dialog-dismissed.png) · [只读源码](evidence/P3-NAV-01-readonly-source-excerpt.txt) · [trace](evidence/independent-v31-browser-trace.zip)。原生confirm并不绘制在截图中，截图明确是取消后状态；文字证据来自dialog事件与trace，不伪称截图包含弹窗。

影响：只读查看也让采购员担心放弃真实修改，并促成对安全提示的忽视。建议将界面选择与业务快照变化区分；与P2导出误阻止联合定位，保留真正dirty保护。只报告，不修复；没有旧版对照证明此次合并新引入。

**English:** Saved/restarted RFQ → allocation → supplier-first → chooseB → New RFQ wrongly shows discard-unsaved confirmation. Complete before/after snapshots and hashes equal; cancellation leaves persisted data unchanged. Screenshot is after dismissal, while native dialog text is recorded in events/trace. Distinguish view changes from actual business edits without weakening genuine safeguards. Related to P2, not a proven newly introduced regression.
