"""中文：用真实启动流程及备份线程运行隔离服务器。
English: Run the real startup and backup thread in an isolated server.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'backend'))
import server
original = server.create_server
server.create_server = lambda: original(port=int(sys.argv[1]))
# 中文：浏览器由 Playwright 管理；应用逻辑与 main 保持一致。
# English: Playwright owns the browser; application main remains unchanged.
server.webbrowser.open = lambda *_: False
server.main()
