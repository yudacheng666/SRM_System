# P2-EXPORT-01 — 供应商询价导出误阻止 / False supplier export refusal

**P2 · 功能与操作体验 / functionality and usability · product d411f4e17a0ab8e75412e5c91a91ccba6abbbc0e. FAIL.**

采购员已保存虚构RFQ，三个供应商、四物料、已确认报价和一份图纸。浏览器从比价页进入供应商分配，点击生成询价单，选择U24-A，点击“下载当前供应商询价Excel”。未修改业务数据。首次下载等待20秒超时（UTC06:43:25.212记录driver-error）；现场保留到06:44:47。

预期：从已保存正式快照生成A的Excel+PDF包；选择报表对象不算业务修改。实际：明确拒绝“不能导出：有未保存的修改，请先点击‘保存到本机’，成功后再导出单据”，而自动保存同时显示“已同步第10版；无待保存修改”，下载按钮未禁用。采购员无法判断要重新保存什么。

[原失败截图](evidence/INCIDENT-supplier-export-timeout.png) · [原页面文字](evidence/INCIDENT-supplier-export-timeout.txt) · [状态、原错误、完整内存及已保存快照](evidence/P2-EXPORT-01-evidence.json) · [持久化指纹](evidence/INCIDENT-export-refusal-verified.json) · [完整trace](evidence/independent-v31-browser-trace.zip) · [只读guard/input源码](evidence/P2-EXPORT-01-readonly-source-excerpt.txt)。

后续只读内存与SQLite保存快照完全相同，原始指纹不变。未编辑业务/未点手动保存，单次显式重试成功；文件为[retry-supplier-A.zip](downloads/retry-supplier-A.zip)。B与全部打包随后成功，37文件检查通过，但不把首轮记为PASS。此处并非S4下载超时，也非只凭等待事件推断服务器异常：现场可见产品主动拒绝。

建议：区分报表选择/视图事件与真正业务变更，导出guard依据可靠保存状态；统一自动保存和导出反馈。保留真正未保存保护。源码显示input监听仅排除pilotControls，报表下拉可能误设dirty；原点击时内部转换未直接采样，因此该具体事件链为修复候选解释，不能当作已测断点结论。与P3-NAV-01相关，是否同一个根因待修复者确认。本轮不修改代码。

**English:** On a saved fictional RFQ, allocation → generate RFQ → chooseA → first download times out after20s. UI explicitly refuses unsaved changes while autosave states revision10 synchronized/no pending change, button enabled. Later full memory equals persisted snapshot; all persisted data unchanged. One retry without business edit/manual save succeeds; the failed first attempt remains FAIL. Candidate direction: distinguish report/view selection from actual business dirtiness and reconcile feedback, retaining genuine safety guards. Exact initial dirty transition not sampled; not proven newly introduced by this merge.
