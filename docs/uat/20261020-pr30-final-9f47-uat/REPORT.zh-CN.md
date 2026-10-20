# PR #30 最终合并前独立报告（TEST-ONLY）

日期：2026-10-20，北京时间；原始日志为UTC，转换北京时间加8小时。**实际产品SHA：`9f47a238bc9b3015f713c4e075977d98c1cb9ca1`**。

## 最终结论：RELEASE-READY

**本次约定的云端合并前测试门槛已满足，可供维护者评估将PR30合入当前开发基线。** 目标基线 `feat/20261019-srm-ui-v3-integration` / `0cd1278468d0471b862e16ca4ffcac41aead5e6d`。这不是已执行合并、不是main/生产部署决定，也不把未测项目宣称通过。

视觉/交互 **PASS**；备份/数据安全和关键采购业务 **PASS**。分组 **21 PASS /0 FAIL /4 NOT TESTED**。本轮249/249原始独立检查、311/311归档及事件校验、37/37业务文件校验通过；未记录driver-error/pageerror。当前验收范围内，**没有未解决的已确认P1/P2/P3、没有未完成的必测目标，也没有缺失的必需独立证据**。详见[机器可读门槛审计](evidence/release-audit.json)。有限样本结论不等于仓库所有缺陷为零。

## 版本与修复组合核实

已读取PR30说明、全部当前评论，重点[最终组合交接](https://github.com/yudacheng666/SRM_System/pull/30#issuecomment-6284314866)，及[PR31失败证据](https://github.com/yudacheng666/SRM_System/pull/31)、[PR33复验与限制](https://github.com/yudacheng666/SRM_System/pull/33)。历史结果从各自发布的准确证据commit读取，未混作本轮实测：[历史审计](evidence/historical-evidence-audit.json)。

最终候选是PR32修复纳入PR30分支后的merge commit，两个parent为69f660cb与a0edd9a。其**完整Git tree与PR33实测的a0edd9a完全一致**，tree=`80b2f45b37771b278fb663ebc55f7bf08fedc8ae`，git diff为空；不存在未说明的新产品文件差异。仍在新SHA上独立运行了以下所有场景，没有仅用tree相同或旧报告判通过。

[checkout/完整tree](evidence/checkout.json)、[修复包含检查](evidence/fix-inclusion.json)、[相对开发基线的产品diff](evidence/final-product-patch.txt)证明：
- 顶部admin导航排除在误标dirty的全局点击判断之外（OBS-01）。
- S4阻止原因写入按钮旁alert并scrollIntoView，不依赖折叠区/视口外全局状态。
- 在真实SQLite PUT成功且dirty=false后清除旧提示；未保存/处理中/失败仍保留保护。

正式M1-Lite HTTP服务实际返回的index与候选tracked文件字节相等，SHA256=`6ab488c8eb0e246e8776187a2222adec07a754b1a83cd5488ae73886812e9ec3`。[运行身份](evidence/runtime-identity.json)。直接checkout该产品SHA，未运行PR23原型、PRCI合成merge或其他开发版本。

## CI开始门槛与环境

- [Push39376374837](https://github.com/yudacheng666/SRM_System/actions/runs/39376374837)：Windows118475333122、Linux118475332910均SUCCESS。
- [PR39376379481](https://github.com/yudacheng666/SRM_System/actions/runs/39376379481)：Windows118475346462、Linux118475346641均SUCCESS。PRCI测试合成merge75a65c6…，独立运行仍是准确9f47a238。
- 两条是同一S3/S4工作流的不同触发。各Linux日志Python43/Node10/Chromium44通过；本轮没有再次本地重跑完整既有44项，以下是另行执行的独立真实UI和落盘校验。
- CI日志仍有artifact存储配额告警，虽然作业最终SUCCESS。没有冒称已成功取得CI截图/trace；本次Git归档提供独立完整替代证据，未删旧artifact、未改CI。

真实Linux Chromium154.0.8037.57、Playwright1.58.2、正式Python/SQLite。`/tmp/f9/data`主采购项目，`/tmp/f9/restore`与`restore-final`恢复，`/tmp/f9/feedback-data`反馈/故障项目，均全新隔离，虚构数据。UI实际操作Excel/确认/图纸/分配/报价/定标/保存/导出/恢复；只读SQLite与快照核对最终业务状态。测试后只停止自建9050–9053服务，数据保留。

## 本轮实测

### 1. 提示可见性与保存清除

1366×768、1024×768、1600×900各在已保存RFQ中新增真实虚构物料，收起项目操作区、展开备份/报表区，点击顶部数据与备份并正常滚动后，物理点击仍启用的S4按钮。三次均未发出备份API，按钮随即禁用；警告在按钮旁且整个bounding rect处于当前视口。不是仅断言DOM有文本。

随后等待真实PUT200及revision增加、“已自动保存第N版”后，三次均警告hidden=true、textContent为空、按钮enabled；每次成功下载实际ZIP。三尺寸[阻止/清除截图](SCREENSHOTS.md)及[逐步状态](evidence/feedback-results.json)。

真实PUT暂扣进行中，既有警告不清除、备份禁用且无请求。对UI实际保存请求注入HTTP500/409、connectionfailed，完整SQLite当前/历史不变、警告保持；去掉故障并真实保存成功后才清除。模拟错误明确作为网络层注入，未称作物理磁盘故障。

真实双窗口冲突：第一窗口建立警告后暂扣原始PUT，第二窗口经UI成功提交SQLite，释放第一请求后**真实后端409**；赢家数据未覆盖，既有警告仍在视口。明确恢复当前保存记录后正确清除。真实停止独立9053服务也触发保存网络失败，警告未清除；用同目录重启服务、实际保存成功后清除。相关截图/日志/trace全部归档；没有修改dirty或保护状态来伪造测试。

### 2. OBS-01重复下载、备份内容与恢复

**24/24快速重复下载，意外超时0。** 每次RFQ B→A切回后交替0/100/350/650ms，顶部admin后立即S4，不加固定等待。可信admin→backup点击区间83.1–462.6ms。每次POST201→GET200→单一浏览器download事件，保存真实文件。O01–O20只读入口探针均dirty/busy/blocked=false；O21–O24关闭入口探针仍成功，保留被动点击/网络日志。导航/备份前后SQLite当前业务、revision和PDF不变。

[24次CSV](evidence/obs-attempts.csv)、[全部原始样本](evidence/obs-attempts.json)、[网络/点击/保护日志](evidence/obs-browser.jsonl)。没有删除失败、依靠重试或把无请求负向场景记为下载成功。

实际**28个S4 ZIP**=首次采购流程1+快速24+三尺寸保存后3。逐份ZIP CRC、manifest数据库及PDF SHA、SQLite integrity_check、workspaces与workspace_versions全部行全部列比较通过。主项目25份含两个RFQ和1PDF，初次8条历史、最新11条；三个反馈ZIP没有PDF，与该项目实际一致。311项归档/事件核验全PASS，[校验明细](evidence/archive-validation.json)。

首次ZIP和最新O24分别恢复至两个空目录，页面定标/理由/PDF和完整历史均正确；两个非空目标再次恢复均明确拒绝，当前数据/历史/PDF未覆盖。已真实停止重启主服务，再检查保存、定标及PDF保持。

### 3. 关键采购业务和视觉回归

全新虚构项目从Excel导入四行（同编码不同规格）、供应商双向追加关联、图纸单候选/多候选/未匹配预览及人工确认、报价Excel与同轮修订，一直执行到实际比价CSV/XLSX及供应商包导出。

A/B同20，单项选择A或B、键盘Enter、批量同价均不要求非最低理由；真正8/12高价空白理由拒绝、有效理由持久化。人工选3项后待决定/并列待核对为0。C新报20不使既选B20误复核；B改21后重开复核，F5保持，选C20后清零。A同轮V1=10→V2=9，草稿不替代已确认价、V1只读和原始历史不变。

A/B实际合计638/692，修订后638/717，理论最低638、人工662；无报价不当0。CSV数量×单价/RFQ行号、工作簿ROUND/SUMIF公式/理由/选择/组内历史、供应商包价格空白和不泄漏竞品/内部ERP、PDF字节均校验，37项PASS。[实际文件校验](evidence/business-file-validation.json)。未启动桌面Excel重算，相关项保持NOT TESTED。

保存/F5/跨RFQ供应商上下文/真实进程重启保持；非法和取消预览不改revision/行号/业务。三分辨率V01–V04和原禁用确认按钮回归未见退化；不冒称完成PR23全像素对照。

## 已知缺陷闭环与必测审计

|问题|历史证据|本轮最终候选证据|结论|
|---|---|---|---|
|P2-OBS01|原0cd诊断；PR31原路径通过|24个正向真实下载、20次clean入口、4次关闭探针|PASS，无当前未解决项|
|P3-S4-01|PR31在69f660cb失败；PR33在a0edd9a通过|三尺寸当前视口原因、真实成功后清除、失败/冲突/断服保持|PASS，旧失败已闭环|
|P2-B01|并列最低第二供应商误索理由|A/B20及A/C20单项/批量真实选择、保存与恢复|PASS|
|P3-U01 / V05|已人工选择仍待核对、决策层级|3项人工、待核对0；新报价重开和重确认清零|PASS|

本轮约定的修复包含、准确SHA、CI、真实UI、提示/保护、重复下载、完整性、恢复与采购回归、证据保存均已完成。**未完成必测=0，缺失必需独立证据=0。** 历史PR33的一条无效前置条件检查和两次驱动错误仍保存在历史证据中，不抹除，也不算本轮新失败；本轮所有249条检查真实通过。

非阻断限制：CI artifact配额问题仍需维护者处理，但本轮独立trace/截图完整入Git。PR30正文仍写旧的“CI尚未运行”，属于过时交接文字；实际准确HEAD的CI和本报告已给出当前状态。本轮不修改PR说明或CI，不把这些文档/设施限制包装成新的采购产品P3。

## 分组结果与NOT TESTED

|ID|目标 / Target|结果|
|---|---|---|
|R01|准确HEAD、运行字节、结束未变化 / Exact identity and unchanged HEAD|PASS|
|R02|最终CI Windows/Linux / Final Windows/Linux CI gate|PASS|
|R03|OBS与PR32修复均包含、tree一致 / Fix inclusion and identical reviewed tree|PASS|
|R04|折叠滚动未保存提示三尺寸 / Collapsed-scrolled dirty warning at3 resolutions|PASS|
|R05|真实保存成功清除并可下载 / Clear after actual successful save,then download|PASS|
|R06|保存中及受控500/网络/409保护 / Pending-save and injected-failure safety|PASS|
|R07|真实SQLite双窗口409 / Actual two-window SQLite409|PASS|
|R08|真实独立服务停止及安全恢复 / Actual owned-service outage and recovery|PASS|
|R09|原OBS快速重复24次 /24 original-path rapid repeats|PASS|
|R10|28ZIP SQLite全部历史/PDF /28ZIP full SQLite history/PDF integrity|PASS|
|R11|两次空目录恢复 / Two empty-target restores|PASS|
|R12|两次非空安全拒绝 / Two nonempty overwrite refusals|PASS|
|R13|并列最低价单项及键盘 / Single/keyboard tied-lowest choice|PASS|
|R14|批量同价与真正高价理由 / Bulk ties and genuine higher-price reasons|PASS|
|R15|人工待核对及新报价复核 / Manual/tie and new-quote review state|PASS|
|R16|报价草稿、修订及历史锁定 / Drafts,revisions and locked quote history|PASS|
|R17|保存/F5/RFQ切换/真实进程重启 / Persistence,F5,RFQ switch,actual restart|PASS|
|R18|图纸匹配/原生PDF及追加分配 / Drawing/native PDF/additive allocation|PASS|
|R19|CSV/XLSX/供应商包金额与安全 / Actual export amounts and supplier package safety|PASS|
|R20|非法/取消预览及三尺寸旧UI回归 / Invalid/canceled previews and prior UI checks|PASS|
|R21|必测证据、历史缺陷闭环及权限审计 / Mandatory evidence,defect closure,boundary audit|PASS|
|N01|Windows本机人工使用 / Native Windows manual use|NOT TESTED|
|N02|桌面Excel重算打印 / Desktop Excel recalculation/printing|NOT TESTED|
|N03|生产磁盘/断电/长期全负载并发 / Physical production failure/long full-load concurrency|NOT TESTED|
|N04|完整PR23逐像素重认证及全部业务组合 / Full PR23 pixel recertification/every business combination|NOT TESTED|

四个NOT TESTED是本次云端合并前范围外的额外验证，不以CI/历史PASS替代，也不作为已完成的生产验收。尤其Windows本机按既定交接未要求本轮执行；全像素/全部组合和生产物理故障不作穷尽性保证。RELEASE-READY只对应本报告开头的PR30→当前开发基线，不承诺main已发布。

## 证据、权限及后续

[截图索引](SCREENSHOTS.md)：109张匿名实际截图；[主trace](evidence/independent-v31-browser-trace.zip)、[提示/受控故障trace](evidence/feedback-browser-trace.zip)、[真实冲突+断服trace](evidence/conflict-recheck-trace.zip)。Playwright trace viewer可打开，视口截图单独PNG保存；完整浏览器/网络/服务日志及逐次样本均在evidence。导出和28个实际S4 ZIP在downloads。所有文件[SHA256清单](SHA256SUMS.txt)。

[测试前](evidence/protected-refs-before.txt)/[测试后](evidence/protected-refs-after.txt)已有main/开发/修复分支引用一致；PR30结束仍Draft、未合并，base未变。只新建独立证据分支，不修改产品、原有测试、CI或任何既有分支；无PR合并/关闭，无用户数据清理。证据PR是归档，不是产品代码修复。是否合并由维护者另行决定。
