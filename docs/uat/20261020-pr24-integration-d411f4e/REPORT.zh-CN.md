# PR #24 集成候选独立回归：NOT-READY（TEST-ONLY）

日期：2026-10-20，北京时间；原始日志为UTC。**唯一测试产品SHA：`d411f4e17a0ab8e75412e5c91a91ccba6abbbc0e`**。

## 结论

**NOT-READY：本轮独立集成业务回归未完成。** 两项CI均PASS；独立提示与部分保存保护已通过。原HTTP500警告保留断言出现false后自动停止扩展，只做了一次同失败用例的限定补证，未运行后续采购/比价/恢复/重复下载。因此不能判PR24整体验收通过，也不能引用旧版本PASS替代本SHA的未测项。

原始31条检查 **30 true /1 false**。trace证明原失败样本点击前自动保存已经失败、S4按钮disabled、局部警告从未建立；**该false不能证明产品错误清除了既有警告**。随后唯一一次同例补验先明确建立可见警告，再返回受控500，结果警告保留、备份禁用、无备份API、数据库不变。没有将原false改成true，也没有据此恢复扩展测试。

目前**没有新确认的P1/P2/P3产品缺陷**；有一项保存先失败时的可见性观察留给负责人评估。NOT-READY依据是本轮回归范围未完成和原执行中断，不是声称合并导致产品回归。完整[结果与未测清单](results.json)。

## 准确版本与两项CI

已读取PR24当前说明和相关历史交接；开始、结束HEAD均等于指定d411f4e，PR24仍Draft/open/unmerged，base=`draft/20261013-m1-storage-ui-audit` / `457edcf4214220deacb4288b372ea78f144e5333`。[CI门槛快照](evidence/github-gate.json)、[结束快照](evidence/github-final.json)。

- [SRM UI V2 Unified Candidate Acceptance #48 /39379118995](https://github.com/yudacheng666/SRM_System/actions/runs/39379118995)：Windows118483896372、Linux118483896234均SUCCESS。
- [SRM S3/S4 Regression #148 /39379119121](https://github.com/yudacheng666/SRM_System/actions/runs/39379119121)：Windows118483896719、Linux118483896945均SUCCESS。
- 两项工作流全部结束成功后才启动独立浏览器。各Linux日志Python43/Node10/Chromium44通过；这是CI基线，不计作本轮独立业务PASS。
- CI日志checkout的是合成merge3d50a90…（d411f4e合入457edcf）；独立worktree和实际HTTP程序直接是d411f4e。HTTP实际index字节与候选tracked文件一致，SHA256=`6ab488c8eb0e246e8776187a2222adec07a754b1a83cd5488ae73886812e9ec3`。[运行身份](evidence/runtime-identity.json)。无PR23原型或其他产品版本。
- CI附件上传存在配额告警；工作流配置将该步骤设为best-effort，业务测试仍阻断。上传限制单列保存，未绕过任何失败的业务检查。两项CI成功不代表已有可下载的CI截图/trace；本次自行生成的证据直接存Git。

## 计划、命名及失败后边界

[TEST-SCOPE.md](TEST-SCOPE.md)在执行前记录REG01–REG14具体回归用例与停止规则。报告目录为`20261020-pr24-integration-d411f4e`；主报告`REPORT.zh-CN.md`/`REPORT.en.md`；失败说明`FAILURE-REG02-SAVE500.md`，限定补证前缀`FAIL-REG02-SAVE500-*`。原自动截图`FAIL-current-case-SAVE500.png`保留原名，不改写历史。

逐用例串行执行。独立驱动任何首条失败断言立即暂停；只允许同一失败截图、状态、请求/服务日志、trace结束、只读落盘检查，及最多一次必要最小复现；不换SHA、不做其他模块、不修产品/原测试/CI、不跳过检查后继续。本轮确实遵守：原false在北京时间14:23:59触发停止，之后只读取同例证据并在14:26:48完成唯一补验。**没有启动主采购浏览器或恢复服务，没有运行REG03–REG14。**

## 已通过部分

正式M1-Lite Python/SQLite，真实Chromium154.0.8037.57/Playwright1.58.2；只启动本轮独立9073反馈服务，`SRM_DATA_DIR=/tmp/d4/feedback-data`，虚构物料。其余主业务/恢复目录仅预建、服务未启动。初始XLSX导入仅用于反馈用例建模，不代表完整采购REG03通过。

REG01在1366×768、1024×768、1600×900验证：项目操作区收起、页面滚动，真实未保存修改后物理点击仍启用的S4按钮；局部原因完整进入当前视口、按钮禁用且无备份API。真实PUT200与revision增加后，旧提示hidden=true/textContent为空、按钮解禁。三个场景各得到实际ZIP。[结果](evidence/feedback-results.json)、[截图](SCREENSHOTS.md)。

REG02-BUSY暂扣真实PUT并保持原请求内容，已有警告保留、原生按钮disabled、物理点击无备份API；释放成功后警告清除。对应5条断言通过，真实保存第5版已确认，trace中保留全部状态。

三份ZIP属于以上提示场景的下载证据，没有PDF业务数据。只检查归档可读取/CRC及SHA，**没有补跑REG14 SQLite/PDF完整性业务校验，也没有恢复它们**；不能因此给备份恢复或完整性PASS。

## 首条失败及限定补证

### 原执行：FAIL断言，产品结论INCONCLUSIVE

`SAVE500 warning not incorrectly cleared`期望notice.hidden=false，实际true。原驱动在批次确认后尝试导航/滚动到S4，但在最终点击前，3秒自动保存已发出并得到模拟HTTP500：

- UTC06:23:50.508：新虚构行确认。
- 06:23:54.656：真实UI生成autosave PUT，被浏览器网络层返回受控500；06:23:54.720收到响应。
- trace call@332的点击前状态：revision5、buttonDisabled=true、notice.hidden=true/text为空、autosave显示保存失败。
- 后续物理点击不能触发disabled按钮handler；call@342/call@348仍没有局部警告。全局错误状态top=-165、bottom=-106.828，项目区收起，当前视口截图看不到错误原因。
- 06:23:59.072：保留警告断言false；06:23:59.073停止。原始[false标记](evidence/failure-stop.json)、[截图](evidence/FAIL-current-case-SAVE500.png)、[trace解码状态](evidence/FAIL-REG02-SAVE500-trace-states.json)、[分类](evidence/FAIL-REG02-SAVE500-classification.json)。

这是“警告未建立”的前置条件问题，不能据此报告“先显示后被清除”的已确认缺陷。保存先失败且项目区/全局错误不可见时，备份按钮已禁用而无局部原因是实际观察，交负责人评估是否需要新增UI要求；本轮不自行定级成新的P3，也不修改程序。只读对比证明原模拟失败后SQLite当前/历史/PDF状态与失败前相同。

### 唯一同用例补验：PASS，未恢复扩展

同一准确SHA、同一独立数据目录，只新增虚构`D411-SAVE500-ONE-CONTROL`。预先准备UI，确认行后点S4；记录点击前enabled、点击后局部警告可见。仅暂扣该真实autosave请求以记录前置条件，随后释放为受控HTTP500。保存失败后警告仍在视口、buttonDisabled=true、backupRequests=0、SQLite前后完全一致。没有成功保存重试、没有换故障模式、没有比较或恢复业务。

[补验结果](evidence/FAIL-REG02-SAVE500-minimal-result.json)、[响应前截图](evidence/FAIL-REG02-SAVE500-minimal-before-response.png)、[失败后截图](evidence/FAIL-REG02-SAVE500-minimal-after-response.png)、[补验trace](evidence/FAIL-REG02-SAVE500-minimal-trace.zip)。这仅支持既有警告在该受控500时保持，不抵消原执行false，不完成整个REG02。

## 用例状态（CI与独立覆盖分别列示）

|ID|具体目标 / Target|本轮状态|
|---|---|---|
|CI-UI|UI Unified Candidate Acceptance|PASS|
|CI-S4|S3/S4 Regression|PASS|
|REG-01|三尺寸折叠/滚动警告、真实autosave清除、随后实际下载 / Three-size notice,clean-save clearing,actual downloads|PASS|
|REG-02-BUSY|真实PUT进行中保持既有警告、禁用备份 / Genuine pending PUT protection|PASS|
|REG-02-SAVE500-ORIGINAL|原警告保留断言false；点击前已失败/禁用，警告未建立 / Original assertion false,precondition unmet|FAIL (assertion; product verdict INCONCLUSIVE)|
|REG-02-SAVE500-MINIMAL|仅一次同例补验，先建立警告再500，保持警告/禁用/无备份请求/DB不变 / One same-case controlled recheck|PASS (limited evidence)|
|REG-02-REMAINDER|网络/409/真实双窗口/实际断服及成功重试 / Remaining failure modes and recovery|NOT TESTED|
|REG-03|完整物料/供应商/多对多/图纸 / Full material,supplier,assignment,drawing flow|NOT TESTED|
|REG-04|确认报价、同轮修订、锁定历史 / Confirmed quote/revision/locked history|NOT TESTED|
|REG-05|并列最低、高价理由、批量和人工状态 / Ties,higher-price reasons,bulk/manual awards|NOT TESTED|
|REG-06|逐页三尺寸布局、导航、旧UI兼容 / Page layout/navigation/prior UI compatibility|NOT TESTED|
|REG-07|采购CSV/Excel/比较单实际金额 / Actual purchasing exports and totals|NOT TESTED|
|REG-08|跨RFQ、F5、真实主服务重启 / RFQ/F5/main-service restart|NOT TESTED|
|REG-09|空目录S4恢复与非空拒绝 / First empty restore/nonempty refusal|NOT TESTED|
|REG-10|新报价复核、刷新、重新选择 / New-quote review persistence/reselection|NOT TESTED|
|REG-11|OBS快速重复24次 /24 rapid OBS repeats|NOT TESTED|
|REG-12|最新ZIP完整历史恢复与安全 / Latest full-history restore|NOT TESTED|
|REG-13|供应商包/原生PDF/非法取消预览 / Supplier package,PDF,invalid/canceled preview|NOT TESTED|
|REG-14|全部S4 ZIP/SQLite/PDF业务完整性 / Full S4 archive/database/PDF validation|NOT TESTED|

REG02其他故障分支、真实冲突/断服与恢复没有运行；REG03–REG14均未启动。原CI/PR34等报告的采购、比价、恢复历史PASS不能移植成本次唯一SHA的独立PASS。整体验收NOT-READY。

范围外额外NOT TESTED：Windows本机、桌面Excel重算打印、生产磁盘/断电/长期负载、完整像素与全部业务组合。当前只验证了备份提示相关的三尺寸交互，不称为逐页UI全部通过。

## 证据与下一步

已保存10张实际匿名截图、完整主反馈trace和唯一补验trace、浏览器/网络/服务日志、原31条检查、停止标记、只读数据库前后快照和3个预先已下载ZIP。没有主采购trace，因为该浏览器从未启动；没有恢复/报价截图，不虚构缺失证据。见[截图索引](SCREENSHOTS.md)、[执行汇总](evidence/execution-summary.json)、[SHA256](SHA256SUMS.txt)。

建议先审阅原前置条件失败与保存先失败可见性观察；下一轮明确从REG02剩余项及REG03–REG14继续，采用显式记录前置状态的受控时序，仍保留原false。没有证据要求修改采购算法或数据库；不得仅靠旧PASS、重试成功或隐藏检查宣布当前集成候选通过。

TEST-ONLY：只新增独立证据分支/报告；产品、原测试、CI、main和开发分支前后引用一致，无合并/关闭PR，无用户数据清理。已停止唯一自建9073服务。后续工作建议不等于已执行。
