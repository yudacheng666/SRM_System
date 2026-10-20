# Independent final-candidate method / 最终候选独立方法

Only the steps actually executed in browser.jsonl are archived here. Drivers are review-only TXT; no product/original test/CI file was edited. Real UI handles materials, assignments, quote confirmations/revisions, awards, files, saves and restore. Read-only SQLite snapshots validate persisted state. Passive event observers and a read-only false-condition CDP logpoint record actual guard flags; O21–24 disable that logpoint. No dirty/business/guard-state override.

Feedback.cjs tests three viewports, a held genuine autosave request and explicit browser-network500/409/connectionfailed controls. Conflict-recheck.cjs also tests an actual backend409 by holding a stale real request while another GUI window commits, then an actual owned-service stop/restart. Injected errors are not mislabeled as physical production failures. All raw attempts and failure events are retained. Historical PR31/33 driver errors are documented in their original evidence, not copied into this run or counted as new tests. Current final run has no failed checks or driver/page errors.

本次只新建独立证据分支；现有开发/修复/main分支不改，不合并或关闭PR。所有数据目录均为/tmp/f9本轮新建；只停止自建9050–9053服务，不删除业务数据。Fixtures存在不等于全部组合已测；大型分页输入夹具未用于本轮探索。
