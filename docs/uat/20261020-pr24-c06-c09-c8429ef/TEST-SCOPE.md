# C06–C09 ordered scope / 预审与停止边界

Task https://github.com/yudacheng666/SRM_System/pull/24#issuecomment-6288365279

Preflight: compare exact HEAD/CI, read prior toggle failure/source; prepare/freeze scripts before run. Report picker checks Details/open/visible/enabled/options; never click toggle when panel visible. Restore handler reload audited; wait HTTPresponse registered before click, then planned body and reloaded UI checks. Despite preflight, body read depends on CDP retention across reload and fails. Frozen hashes prove no repair/retry.

SETUP ONLY: official API installs synthetic RFQ/quotes/tiers/awards/PDF in new SQLite. Do not count C03–C05 as reaccepted.
C06: actual comparison/business Excel first, contents; supplier/nested ZIP/CSV content and isolation. PASS.
C07: F5/crossRFQ/actual process restart current+history+assets/PDF, limited P3smoke. PASS.
C08: exactly1S4 file/content, actual empty restore, nonempty refusal. File10checksPASS; HTTP200checked; first protocol error at response.json stops remainder. Post-stop readonly restore facts separate, no failed assertions erased.
C09: critical5pages at3sizes + limited necessary smoke. NOT TESTED.

First new unexpected error stops expansion immediately: raw screenshot/log/trace/state, no script fix/retry. C09 prepared file marked NOT-EXECUTED. No whole-product or merge acceptance; ChatGPT review required. PR40/41 unchanged.
