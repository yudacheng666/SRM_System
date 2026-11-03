# SRM_System AI Working Rules / AI 持久工作规则

> Scope: all SRM_System work. Effective after this file is available on the checked-out branch. This is an execution protocol, not a background daemon.
> 适用范围：SRM_System 项目；仅对实际读取到本文件的工作流程生效，不代表已部署后台守护进程。

## Startup / 任务启动

1. Read AGENTS.md, docs/ai-memory/PROJECT_STATE.md and docs/ai-memory/DECISIONS.md before substantive work.
   实质任务开始前先读这三个文件。
2. If optional docs/ai-memory/sessions/ milestone records exist, read only those directly relevant; never require dated transcripts.
   仅在存在且与任务直接相关时补读阶段交接；历史对话不必保存在仓库。
3. Check actual GitHub refs, branch HEAD, open/merged PRs, changed paths and exact-SHA CI/independent evidence before deciding what is implemented.
   以 GitHub 实际引用、当前代码及准确 SHA 测试为准；不得把 Draft、证据 PR、计划或旧 MD 当作发布事实。
4. When a state file contradicts current facts, preserve links and update the state; unresolved contradictions are marked 待核实 / UNVERIFIED.
   出现冲突以可核实仓库事实修正，不猜测缺失结论。
5. Confirm the authorized target branch and write permissions for this task; never silently select or update main.
   明确工作目标分支；禁止默默选择 main。

## Roles and branch protection / 职责与分支保护

- ChatGPT owns planning, approved product changes, bug fixes, and canonical memory maintenance.
  ChatGPT 负责规划、已批准的产品开发修复、主记忆。
- Codex Cloud runs independent TEST-ONLY acceptance, files evidence/report PRs, and may update only specifically authorized testing records; it does not change product code, existing tests or CI during TEST-ONLY work.
  Codex Cloud 独立验收，仅按授权更新测试证据；测试任务不修改产品代码/原测试/CI。
- GitHub refs/Commits/PRs are the durable record. Do not merge or close PRs, directly commit to main, enable auto-merge, or overwrite concurrent memory changes without explicit owner authorization.
  GitHub 为持久记录；未经用户明确批准，不合并/关闭 PR、不直写 main、不覆盖他人记忆。
- A TEST-ONLY PR should link its tested product SHA and pass/fail/not-tested scope. ChatGPT independently verifies and consolidates into canonical PROJECT_STATE.md.
  独立证据 PR 标注准确产品 SHA 和验收边界，主记忆由 ChatGPT 核实后统一维护。
- Do not run two concurrent branches as competing writers to the same canonical memory file. Use a single documentation PR queue or rebase/reconcile before writing.
  不允许并行分支相互覆盖主状态文件。

## CI-first, risk-based acceptance & quota protection / 测试分级与去重（2026-10-30 新决策）

**规则：优先 GitHub Actions 自动回归；Codex Cloud 仅做增量、独立、无法由 CI 充分替代的验收。不要重复测试浪费额度。**

1. **每轮先核对证据**：确认 PR 产品 HEAD、测试 SHA、变更文件、已有 GitHub Actions job（含 OS/浏览器/实际服务路径）、日志/trace、PASS/FAIL/SKIP/NOT TESTED。相同 SHA、用例、配置、执行环境及断言已有可核验 PASS，则**默认不允许 Codex 重跑同套脚本**。仅当新改动影响已有结果、证据缺失/失效或出现具体新风险时才重测，并说明原因。
2. **CI 为默认自动验收入口**：ChatGPT 负责开发和补足自动化用例；GitHub Actions 在有额度时执行单元/集成/Chromium/Windows Runner 测试；优先审查其证据。CI 失败要先定位原因，不得改用 Linux Codex 重复全套并把原 CI FAIL 说成已通过。
3. **风险分级决定 Codex 是否必要**：
   - 低风险：文档、注释、纯文案、无业务逻辑影响的调整 → 仅必要静态检查/受影响 CI；默认不安排 Codex。
   - 中风险：普通 UI/交互、导入展示、非破坏性流程 → CI + 定向浏览器检查；仅未覆盖的采购员操作、视觉/可用性问题或特定故障交 Codex。
   - 高风险：RFQ 身份/分配、报价历史/轮次/阶梯价/定标与比价口径、PDF 供应商隔离、S4 备份恢复、数据持久化/覆盖、程序更新和安全边界 → 精确 SHA CI + **针对遗漏风险的一轮独立 Codex 探索性验收**（若高风险必须项尚未覆盖，不得跳过而宣称 READY）。无需重跑全部已通过的自动脚本。
4. **派单最小化**：每个 Codex 任务必须列出已通过且不重测的范围、CI 未覆盖的新增目标、明确验收方式、风险及终止条件。失败/修复后只复验原失败和受影响回归；无新变更、无新风险或无证据缺口不重复派单。Codex TEST-ONLY 不修改产品代码、原测试、CI 或主记忆。
5. **Windows 与配额限制**：优先用 GitHub Windows Runner + 真实 Chromium 验证可自动化的 Windows 链路；只有原生文件对话框、打印、Excel、用户真实设备等不能等价替代的部分才安排专项实机，禁止逐轮让用户重复测试。GitHub Actions 额度不足/不可用时，仅让 Codex **替代此前没有有效 PASS 证据的必要测试**，记录替代条件和 NOT TESTED；不得将替测冒充 CI 全绿。额度恢复后只补关键缺口，不盲目重跑全部历史 PASS。
6. **合并判定与旧规则衔接**：保留高风险原有准确 SHA CI、必要独立验收及用户明确批准的门槛；普通低风险改动不再无条件要求“CI 全绿 + Codex 完整 UAT + Windows 实机”三件套。CI 异常或未测不得标 PASS；若需例外合并必须用户逐项明确批准，并披露剩余风险。记录精确 SHA、已有证据链接、新增测试和未测项。文档规则修改本身不触发额外 Codex 全回归。

English summary: Review existing exact-SHA CI evidence first; don't replay passing suites in Codex. Run GitHub CI by default, select incremental independent UAT based on risk, use Windows runners before on-site Windows, and use Codex as quota fallback only for missing tests. Preserve explicit approval and safety gates.

## Memory checkpoint triggers / 自动固化触发器

Perform a memory checkpoint as part of the **same authorized task** immediately after:
在同一次受授权任务中，遇以下事件及时固化，不等对话结束：

1. A substantial feature or fix is implemented; 功能开发或重要修复完成。
2. A CI run or independent acceptance changes what is known; CI / 独立验收结束。
3. The owner confirms a consequential requirement/design decision; 用户确认重要需求或决策。
4. A phase ends or is blocked; 阶段结束或阻塞。
5. Actual GitHub state contradicts memory. 发现实际代码状态与记忆不符。

Checkpoint procedure / 固化动作：
- Refresh PROJECT_STATE.md (brief current truth; target <=200 lines); update DECISIONS.md only for new/changed durable decisions; write a dated session only for substantial milestones.
- Link relevant issue/PR/Commit/SHA/workflow/evidence. Distinguish proposed, implemented-in-branch, CI-verified, independent-UAT-verified, merged-to-development, and released-to-main.
- Remove stale items from current status but retain chronology in sessions and superseded decision links. Do not write empty session notes.
- Before committing, recheck the target branch and latest HEAD; use a docs-only branch/PR and preserve prior edits.
- If a tool fails or context ends before commit, mark the checkpoint incomplete; next task must reconcile GitHub before resuming.
- No actual GitHub commit = no persisted project memory. Unmerged PR memory is visible on its own head only, not on target/main.

## Acceptance, safety and privacy / 验收、安全与隐私

- Normally require successful exact-SHA developer CI before risk-required independent Codex UAT. If CI is unavailable due to quotas or outages, Codex may cover only necessary missing cases, explicitly marked as substitute evidence (not CI PASS); high-risk merge exceptions need the owner's explicit approval.
  常规先核对准确 SHA CI；配额异常仅定向替测，不宣称 CI PASS，高风险例外须用户明确批准。
- Preserve accepted RFQ identities, quotation history, tier-price semantics, supplier isolation and S4 restore protections; scope changes require an owner-confirmed decision.
  不擅自变更已确认的采购业务不变量。
- Never commit identifiable enterprise/person/supplier/customer/product data, actual pricing, original emails, or private screenshots; use fictional fixtures only, even though the repo is private.
  仓库一律使用匿名/虚构资料。
- For documentation-only memory tasks, edit only AGENTS.md and docs/ai-memory/**. No product/test/CI changes.
  纯记忆任务只改本规则和记忆目录。
- Existing project documents and rules are not superseded by a status summary; do not rewrite product requirements opportunistically.
  项目主需求与业务规则继续有效，记忆摘要不得擅自取代。

## New chat recovery / 新对话恢复

When a new ChatGPT/Codex session receives repo access, perform the Startup checks above and pick up the last evidence-backed unfinished item. Do not assume the model automatically loaded these files; explicitly fetch them if unavailable.
新对话需要主动从 GitHub 读取这三个入口文件，并重新核实 PR/代码事实；仅靠聊天记忆无法保证自动注入。

## Documentation hygiene / 文档精简纪律

- Keep only canonical product requirements, business rules, current architecture, ERP field scope, project memory and currently useful run/test instructions in the working tree.
  工作树只保留正式需求、业务规则、当前架构、ERP 字段范围、项目记忆及仍可用的运行/测试说明。
- Do not accumulate dated scratch plans, duplicate per-commit reports, obsolete UI concepts, repeated CI logs or raw screenshots in main. Keep historical traceability in Git commits, PR discussions and Actions artifacts.
  main 不堆积日期草稿、重复修复报告、过时 UI 概念、重复 CI 日志或零散截图；历史追溯使用 Git 提交、PR 讨论和 Actions 产物。
- Before deleting a document, move any still-valid approved rule into the canonical PRD/business rules/architecture and update all active references.
  删除文档前，先把仍有效的已批准规则并入正式需求/业务规则/架构文档，并更新所有当前引用。
- Keep screenshots only when a current defect cannot be reproduced without them; anonymize them and link them to a specific issue/PR. Do not commit screenshots as general progress records.
  仅在当前缺陷无法复现时保留必要截图，必须匿名并关联具体 Issue/PR，不把截图当作日常进度记录提交。
- Keep PROJECT_STATE concise (target <=200 lines); detailed chronology belongs in Git history, not in dated cleanup/session logs.
  PROJECT_STATE 保持精简（目标不超过 200 行）；详细历史由 Git 记录，不积累日期清理日志/会话日志。

## Canonical memory paths / 主记忆路径

- docs/ai-memory/PROJECT_STATE.md — current status / 当前状态
- docs/ai-memory/DECISIONS.md — durable decisions with history / 长期决策
- 