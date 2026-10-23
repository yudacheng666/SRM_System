# SRM_System AI Working Rules / AI 持久工作规则

> Scope: all SRM_System work. Effective after this file is available on the checked-out branch. This is an execution protocol, not a background daemon.
> 适用范围：SRM_System 项目；仅对实际读取到本文件的工作流程生效，不代表已部署后台守护进程。

## Startup / 任务启动

1. Read AGENTS.md, docs/ai-memory/PROJECT_STATE.md and docs/ai-memory/DECISIONS.md before substantive work.
   实质任务开始前先读这三个文件。
2. Read only directly relevant records under docs/ai-memory/sessions/; do not load every historical session.
   仅按任务目标补读相关 Session，不全量加载。
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

- **Default:** Exact-SHA successful GitHub Actions/developer CI precedes independent Codex Cloud TEST-ONLY review; a failed, unallocated or unverified GitHub runner is never `PASS`.
  默认门槛：准确 SHA 的正式 CI 先行；未启动或无验证不得写作通过。
- **Explicit time-limited SRM M1 exception — D-022:** While GitHub Actions cannot allocate runners, an exact-SHA Codex Cloud full Python+Node+Chromium run plus independent buyer UAT can substitute for the **development testing evidence only**. A proposed M1 development merge still requires real isolated **native Windows** Python3.13/Node22/PowerShell/BAT + local launch/safety verification and **separate explicit user merge approval**. If any of these are untested/failed, do not call the temporary development merge gate complete. This does **not** set GitHub required checks to SUCCESS, permit bypassing branch protection, authorize main/release, or relieve the team of rerunning official exact-SHA GitHub Actions once the account allows it. Codex remains TEST-ONLY; no code/CI modifications from independent tests.
  用户选定的方案 A 仅限本 SRM M1 开发阶段；云端测试和独立业务验收 + Windows 本机专项齐备后，仍须用户单独批准 M1 合并。不能宣称 Actions PASS，不能绕过仓库规则，恢复额度后要补跑正式 CI。
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

## Canonical memory paths / 主记忆路径

- docs/ai-memory/PROJECT_STATE.md — current status / 当前状态
- docs/ai-memory/DECISIONS.md — durable decisions with history / 长期决策
- docs/ai-memory/sessions/ — milestone handoffs / 阶段交接
