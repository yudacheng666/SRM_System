# U7 页面顶端视觉复验 / U7 top-of-page visual recheck

**结论：PASS。1366×768、scrollY=0，导入12项后与新标签页加载后，首条实际物料均完整处于首屏内；U7 可关闭。项目/保存入口、继续导入、PDF 面板和960布局快速检查通过。**
**Verdict: PASS. At 1366×768 and scrollY=0, the full first real item row is inside the viewport both after import and in a fresh tab. U7 may close. Entry-point and narrow-layout checks also pass.**

- [任务](https://github.com/yudacheng666/SRM_System/pull/5#issuecomment-6185365819)；被测精确 SHA：`d0a25118d6ee0ef167d2dd25521d7eacbfc25b42`。
- [同 SHA CI 38688080928](https://github.com/yudacheng666/SRM_System/actions/runs/38688080928)：completed/success；[Windows](https://github.com/yudacheng666/SRM_System/actions/runs/38688080928/job/116267446805)、[Linux](https://github.com/yudacheng666/SRM_System/actions/runs/38688080928/job/116267446534) success。读取 Linux 日志：场景13通过，**13 passed (2.2m)**。本轮只读取，不重复 Python/Node/13场景套件。
- 实际操作：2026-10-15 约13:47–13:49（Asia/Shanghai）；Linux Chromium 154、Playwright 1.58.2，1366×768与960×900；固定 SHA 的独立 worktree、端口8815、全新临时 SRM_DATA_DIR，全部虚构资料。
- 测试前后应用、测试及CI跟踪文件无差异；只提交本目录文档/证据，不改程序、不修复、不合并、不推送PR源分支。PR #5保持Draft，main和开发基线不变。

## 操作与结果 / Operations and results

| 检查 / Check | 结果 / Result | 实际证据 / Evidence |
|---|---|---|
| 导入后真实页面顶部 | **PASS** | 新建正式RFQ→可见入口选择items12.xlsx→确认12项→通过鼠标滚动回页面顶部。首行TST-012完整可见；没有把表头当数据行。 |
| 新标签页顶部 | **PASS** | 通过项目入口实际保存，再新开标签加载同一已保存RFQ；默认物料页、scrollY=0，首行完整可见。 |
| 项目操作入口 | PASS | 顶部“询价项目”可展开；新建/历史/保存控件可见，实际执行保存成功。本轮仅一笔RFQ，历史下拉无其他可切换记录，未重跑跨询价流程。 |
| 继续导入 | PASS | 从收起状态再次点“+ 添加询价物料”，文件控件可见；上传独立[followup.xlsx](followup.xlsx)，预览确认1项，新增U7-EXTRA，物料总数由12变13。 |
| 图纸入口 | PASS | 位于物料操作栏的“图纸匹配与管理”可点击并展开PDF匹配/关联控件；未测试PDF渲染或恢复。 |
| 960操作区 | PASS | 项目与业务按钮正常换行可用，图纸面板无入口遮挡；document width=innerWidth=960。宽表在自身区域内，未见页面级横向溢出。 |

No UI state was injected through an API. All mutations used visible controls and synthetic XLSX uploads. Geometry is read-only corroboration of actually reviewed screenshots, not a substitute for visual inspection.

## 两次首行几何 / First-row geometry

| 时点 / State | scrollY | top | bottom | 行高 / Row height | 视口高 / Viewport height |
|---|---:|---:|---:|---:|---:|
| 导入12项后回顶部 / After import, page top | 0 | 548.5 | 615.5 | 67 | 768 |
| 已保存RFQ新标签 / Fresh tab, saved RFQ | 0 | 548.5 | 615.5 | 67 | 768 |

第一条实际行是 `RFQ-L00012 / TST-012 / 虚构物料12`。两次满足 **0 ≤ top 且 bottom ≤ 768**，整行下方仍有152.5px余量。相比前次9696bf8的top=858.5，本轮首行上移310px，且截图确能读到实际数据行。

The first actual data row, rather than a header/filter row, is fully visible in both states. The fresh-tab check avoids incidental scrolling caused by file selection. This independently confirms the strengthened CI result for the tested viewport.

- [导入后1366×768页面顶部](01-import-top-1366.png)
- [新标签1366×768页面顶部](02-fresh-top-1366.png)
- [原始坐标JSON](geometry.json)
- [960项目操作与追加物料](03-project-controls-960.png)
- [960展开图纸面板](04-pdf-panel-960.png)
- [控件与宽度观察记录](controls.json)

## 范围与证据 / Scope and retention

本轮仅复验U7；**SKIP**：U8/N1、F1/F2、完整Python/Node/Playwright回归、Windows原生行为、PDF像素及长期运行，未重新给这些项目结论。没有发现本轮U7的阻断问题，也不将单一视口扩展为全设备验收。

Only U7 is evaluated here. Other findings, complete regression suites and native rendering/endurance checks were deliberately not rerun or newly certified.

本目录含4张原始截图、坐标/控件观察记录、确认文本及轻量追加样本。[manifest](evidence-manifest.json)记录原始会话文件大小和SHA-256；约4.3MB trace仅在`/tmp/srm-u7-evidence/exploration-trace.zip`临时保留，published=false，未上传为CI Artifact。远端证据随独立文档分支保留，受私有仓库访问权限限制，非Actions限期产物。所有截图实际打开审查，未改写内容。

**交接：本SHA的U7可关闭。仅报告与证据提交，PR保持Draft，未经用户授权不合并。**
**Handoff: close U7 for this tested SHA and viewport. Documentation/evidence only; Draft remains and no merge is performed.**
