# Review-only method source / 仅供审阅的方法原文

These are newly authored independent drivers archived as non-executable TXT. No original tests were edited. The authoritative executed step order and exact code are the `step` records in `../evidence/browser.jsonl`; `02b-tie-observation.js.txt` was an exploratory source kept for transparency and was not executed in this run. Fixtures such as pagination-materials.xlsx may be unused; presence does not imply coverage. Existing suite commands and exit codes are in existing-suite-results.json.

主驱动在正式UI上操作；只读SQLite/快照用于业务状态核对。N02原控制错过进行中窗口，两个false断言保留；B01用暂扣真实PUT的闸门补验，不改产品/业务状态。F01/B01项目操作区展开时左侧状态可见，不能用顶部状态越出视口来单独判其反馈失败；N01项目区收起时所有原因均不在当前视口，才是报告确认的问题。

The validator intentionally preserves the N01 visibility false result, writes all results, and separately asserts integrity checks. Exit0 of that validator must not be presented as all acceptance assertions passing. All three raw false browser checks remain archived.
