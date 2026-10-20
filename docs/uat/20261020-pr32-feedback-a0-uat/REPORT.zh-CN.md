# PR #32 独立定向验收（TEST-ONLY）

日期：2026-10-20，原始日志为UTC；北京时间为UTC+8。**产品SHA：`a0edd9a753733c738360fc437d0a3ee4a29144e4`**。

## 结论与范围

**P3-S4-01 视觉/交互：PASS；备份与采购业务：PASS（限本报告实际执行范围）。** 三种分辨率均在折叠项目操作区、页面已滚动、真实未保存修改时，显示按钮旁可见阻止原因；SQLite自动保存成功后，旧提示清除，备份恢复可用。保存进行中、失败、真实服务不可用和真实版本冲突均未错误清除已经建立的警告。没有发现新的已确认P0/P1/P2/P3产品缺陷。

分组为 **19 PASS /0 FAIL /4 NOT TESTED**。这不是全产品、全视觉设计或所有并发时序的认证，不批准任何合并。原始一次无效时序false及两次驱动准备/观察器错误均保留，不能宣称所有原始检查都无条件通过。

## 任务、版本及CI

已读取 [PR32最新交接](https://github.com/yudacheng666/SRM_System/pull/32#issuecomment-6283410152)、全部当前评论和 [PR31失败报告](https://github.com/yudacheng666/SRM_System/pull/31) 及其N01截图。旧产品69f660cb在收起项目区时，将原因写在折叠区/视口上方；本轮使用该证据确定原场景，没有再次运行旧产品来冒充候选验收。

- [Push CI39369245980](https://github.com/yudacheng666/SRM_System/actions/runs/39369245980)：Windows118453118954、Linux118453118671均 SUCCESS。
- [PR CI39369250226](https://github.com/yudacheng666/SRM_System/actions/runs/39369250226)：Windows118453131251、Linux118453130969均 SUCCESS。PRCI运行的是合成merge `c8da9d5…`，日志明确含a0edd9a合入69f660cb；独立checkout直接使用准确候选a0edd9a。
- 两条均为同一S3/S4工作流的不同触发，不称为两种独立套件。各Linux日志Python43、Node10、Chromium44成功。本轮没有在本地再跑完整44项；CI作为基线，独立UI操作如下。
- 两个CI日志仍包含artifact配额错误，尽管作业最终结论SUCCESS。**不声称已有可用的CI截图/trace**；本报告独立截图、trace、ZIP、日志另行提交Git，不依赖该上传。
- PR32开始与结束HEAD一致，open/Draft、未合并。[开始快照](evidence/github-initial.json) / [结束快照](evidence/github-final.json)。[运行身份](evidence/runtime-identity.json) 的HTTP实际index与候选tracked文件字节相同，SHA256为 `6ab488c8eb0e246e8776187a2222adec07a754b1a83cd5488ae73886812e9ec3`。
- 独立测试分支：`test/20261020-pr32-feedback-a0-uat`，从产品SHA直接创建，证据PR面向 `fix/20261020-s4-visible-block-feedback`。开发、两个修复分支和main引用[前](evidence/protected-refs-before.txt)/[后](evidence/protected-refs-after.txt)一致。

## 云端环境与真实操作

Chromium154.0.8037.57、Playwright1.58.2、正式M1-Lite Python/SQLite服务。主项目 `/tmp/a0/data`，两个空目录恢复 `/tmp/a0/restore`、`/tmp/a0/restore-final`，独立反馈/故障项目 `/tmp/a0/feedback-data`。全部目录本轮新建，未复制既有业务数据库。虚构物料、供应商、Excel报价和PDF；没有企业真实资料。

真实UI完成文件上传/预览/确认、单条录入、图纸匹配、分配、报价修订/确认、单项和批量定标、保存、RFQ切换、导出与恢复。只读SQLite和快照用于核对业务结果，不写业务状态。结束时只停止自建9030–9033四个服务，保留证据与数据。

## P3原场景：可见性、保存与清除

在正式询价中先完成初始保存，收起“项目操作”，展开数据/报表工具。新增虚构物料 `P32-REAL-DIRTY-1366/1024/1600`，各数量2，真实确认。顶部admin→正常滚动到S4按钮→对仍启用按钮物理鼠标点击，无强制DOM点击、无修改dirty变量。

| 分辨率 | 点击前scrollY | 点击后警告rect top/bottom | 结果 |
|---|---:|---:|---|
|1366×768|172|164.844 /220.844|整段提示在按钮附近、当前视口内|
|1024×768|185|165.344 /239.344|整段提示在当前视口内|
|1600×900|191|169.375 /225.375|整段提示在当前视口内|

三次均 projectOpen=false、点击前buttonDisabled=false；点击后buttonDisabled=true，无备份API。红色提示含“尚未保存”“等待自动保存完成或点击保存到本机”“再重新下载”。不是只检查textContent，实际核对整个bounding rect并查看截图。

随后等待真实PUT200及revision增加，自动保存状态为“已自动保存第N版”；三次均提示hidden=true且textContent为空，按钮enabled。每次再点击并得到实际ZIP，分别保存 `p3-1366.zip`、`p3-1024.zip`、`p3-1600.zip`。三份ZIP的SQLite当前/全部历史与当时快照相等；该反馈项目没有PDF，manifest的0PDF与实际一致，没有虚构附件。

[三尺寸结果](evidence/feedback-results.json)；[1366警告](evidence/P3-1366-blocked-visible.png)/[保存后](evidence/P3-1366-saved-cleared.png)，其他尺寸见[截图索引](SCREENSHOTS.md)。

## 保护与异常：清除必须等待真实成功

- **BUSY**：一次真实autosave PUT在浏览器路由层暂扣，不改请求；已有警告继续可见且按钮disabled。物理点击不产生备份API；释放真实PUT并成功保存后才清除。
- **SAVE500 / OFFLINE / CONFLICT409**：对实际UI产生的保存请求分别注入500、connectionfailed、409。说明这是浏览器网络层故障注入，并非真实磁盘损坏/真实服务冲突。所有失败均不改SQLite任何当前/历史行，警告保持、备份禁用、无备份API；撤去故障后手工保存真正成功才清除。
- **REAL409-BARRIER**：真实双窗口、真实SQLite版本冲突。先在第一窗口建立可见警告并暂扣其真实保存请求；第二窗口通过UI新增 `P32-REAL409-BARRIER-WINNER` 并提交到SQLite；释放第一窗口陈旧请求后，**真实后端返回HTTP409**，赢家的全部数据库行保持，原警告仍在当前视口，备份无请求。明确“恢复当前已保存记录”后读取新版本，才清除过期警告。闸门只协调请求顺序，没有伪造409响应。
- **REAL-SERVICE-DOWN**：警告建立后，实际SIGTERM停止仅属于本轮的9033服务；后续真实保存网络失败，数据库保持，警告未清除、备份禁用。用相同独立数据重启服务，通过UI真实保存成功后警告清除。

[受控故障](evidence/feedback-browser.jsonl)、[真实服务及首次冲突](evidence/real-fault-browser.jsonl)、[真实冲突闸门](evidence/conflict-recheck-browser.jsonl)。本报告不把网络模拟500当成物理磁盘故障通过，也不把双窗口的一个调度顺序当成所有并发行为通过。

## OBS-01、完整性及恢复

**O01–O24快速下载24/24 PASS，意外下载超时0。** 每次从第二RFQ切回主RFQ，切回后轮换0/100/350/650ms，顶部admin后不固定延时。可信admin→备份点击间隔 **86.2–364.9ms**。每次POST201→GET200→一个浏览器下载事件，文件真实落地。O01–O20只读入口logpoint记录dirty=false,busy=false,blocked=false；O21–O24关闭该探针仍成功，保留被动点击/网络记录。观察器未改任何业务变量或保护条件。

[24次CSV](evidence/obs-attempts.csv)、[原始结果](evidence/obs-attempts.json)、[事件/时序](evidence/obs-browser.jsonl)、[汇总](evidence/summary.json)。导航及24次备份前后当前快照/revision/PDF不变。

全程实际 **28个S4 ZIP**：主采购流程首次1份、快速重复24份、反馈项目保存成功后3份。25份主项目ZIP含两个RFQ和1个PDF；初次8条历史，重复时11条历史。逐份CRC、manifest SQLite/PDF SHA、SQLite integrity_check及 `workspaces` / `workspace_versions` **全部行全部列**比较，共311项校验全部通过。3份反馈ZIP各对照对应阶段（无PDF）。[逐份校验](evidence/archive-validation.json)。

首次和最新O24分别恢复到两个空目录，恢复后真实页面定标、理由与PDF正确，最新完整历史与原SQLite相等；两个非空目录再次恢复都明确拒绝，当前数据/历史/PDF没有覆盖。见14/15/34/35快照、history-final-restored及恢复截图。

## 采购业务回归

同编码不同规格M16/220数量10、M20/350数量25，无有效报价件数量4，高价理由件数量6；A/B/C虚构供应商。双向追加分配、唯一/多候选/未匹配图纸预览、唯一文件人工确认及重启后的原生PDF均实际操作。

A同轮报价10→9，草稿不替代已确认价、V1保持只读、V1→V2差异为-1/-10%。A/B同20任选无需非最低理由，含键盘Enter；批量同价不索理由，真正8/12高价空白理由拒绝，接受理由实际落盘/导出。人工选3项后待决定/并列待核对为0。新增C20不错误使B20待复核；B改21后复核重开，F5保持，选C20后清零，原历史保留。

实际CSV和工作簿独立计算：A/B原合计638/692，B修订后638/717，理论最低638、人工合计662；未报价不当作0。实际XLSX的ROUND/SUMIF公式、选择、理由和分组历史均核对；A/B组不混入C。供应商包价格空白，无内部ERP备注/竞品信息，PDF哈希相同。**37项文件检查全部PASS**，见[business-file-validation](evidence/business-file-validation.json)。没有启动桌面Excel重算。

保存、刷新、跨RFQ供应商上下文、真实进程重启后数据保持；非法导入和取消预览不改SQLite revision、RFQ行号、业务内容。三分辨率原V01–V04和确认后禁用按钮回归未见退化；这是本轮观察到的当前产品UI，不声称重新完成PR23逐像素认证。

## 分组结果

|ID|目标 / Target|结果|
|---|---|---|
|C01|准确版本、HTTP字节、两条CI / Identity and both CI gates|PASS|
|C02|P3原1366折叠滚动提示 / Original collapsed-scrolled1366 notice|PASS|
|C03|1024/1600提示在视口 / Additional viewport notice visibility|PASS|
|C04|真实自动保存后清除并能下载 / Clear after committed autosave then download|PASS|
|C05|真实保存进行中保护与警告保留 / Genuine busy-save protection|PASS|
|C06|保存HTTP500失败不清除 / Save500 failure retains warning|PASS|
|C07|网络失败及真实服务停止不清除 / Aborted request and real service outage|PASS|
|C08|真实双窗口409保留警告与数据 / Real two-window409 safety and warning|PASS|
|C09|OBS快速下载24次 /24 rapid OBS repeats|PASS|
|C10|28ZIP全量SQLite历史与PDF校验 /28 actual archives full history/PDF integrity|PASS|
|C11|两次空目录恢复 / Two empty-directory restores|PASS|
|C12|两次非空拒绝覆盖 / Two nonempty overwrite refusals|PASS|
|C13|并列最低单项选择 / Single tied-lowest awards|PASS|
|C14|批量定标与真正高价理由 / Bulk awards and genuine higher-price reasons|PASS|
|C15|人工待核对与新报价复核 / Manual pending and new-quote review|PASS|
|C16|同轮修订、草稿与锁定历史 / Same-round revision, draft and locked history|PASS|
|C17|保存、刷新、切RFQ与真实服务重启 / Save,F5,RFQ switch and real restart|PASS|
|C18|图纸、实际导出金额和取消预览 / Drawings,actual export totals,invalid/canceled previews|PASS|
|C19|三尺寸原V01–V04与禁用按钮回归 / Three-resolution prior UI/disabled-control regression|PASS|
|C20|Windows本机人工操作 / Native Windows manual use|NOT TESTED|
|C21|桌面Excel重算打印 / Desktop Excel recalculation/printing|NOT TESTED|
|C22|生产磁盘断电、全负载并发 / Production disk/power/full-load concurrency|NOT TESTED|
|C23|PR23完整逐像素重认证与所有业务组合 / Full PR23 pixel recertification/every business combination|NOT TESTED|

## 原始失败、误差及未测边界

主浏览器184/184检查、反馈50/50、真实故障13条中12true/1false、真实冲突闸门8/8。共255条原始检查中254true、1false。保留的false为首次REAL409“警告仍可见”：其点击前按钮已经disabled、警告从未建立，不满足“已有警告不得错误清除”的前提；该样本证明后端409未覆盖数据，不能证明提示保留或缺陷。随后的REAL409-BARRIER先证实警告已建立，再真实冲突，8项通过。**没有删除false或把它改成true。**

另外两次驱动错误：准备时在收起的项目区找手工保存，超时；只读入口探针查找旧源字符串而安装失败。前者修正为通过UI展开项目区，后者由07b恢复观察器。仅改本轮独立驱动，原产品/测试未动。所有旧日志、准备trace和源码文本保留，详见[分类汇总](evidence/summary.json)、[全部检查](evidence/independent-checks.json)、method说明。无pageerror；主项目三个favicon404保留，故障注入和真实断服预期的HTTP/网络错误也保留。

Windows本机、桌面Excel重算打印、生产磁盘/断电/全负载并发、完整设计像素认证及全部业务组合均未测，不能从CI或局部PASS推断。有限样本无法穷尽race。原PR31的旧失败作为对照引用，本轮未再运行旧版本。

## 证据与权限

[截图索引](SCREENSHOTS.md)包含110张匿名实际截图，三分辨率前后状态、异常、恢复、报价历史和PDF；[主trace](evidence/independent-v31-browser-trace.zip)、[反馈trace](evidence/feedback-browser-trace.zip)、[真实故障trace](evidence/real-fault-browser-trace.zip)、[冲突补验trace](evidence/conflict-recheck-trace.zip)、[准备超时trace](evidence/feedback-preparation-trace.zip)。可用Playwright trace viewer打开；PNG为单独视口截图。浏览器、网络、服务端原始日志全部位于evidence；实际ZIP和导出位于downloads。

本报告只提交新报告、证据、虚构输入/下载及只读审阅用TXT方法，没有修改产品、原测试、CI、开发或main引用；无PR合并/关闭。没有使用固定延时或反复点击掩盖失败。**本轮P3及要求范围可判PASS，保留以上明确限制，是否进入下一步由维护者决定。**
