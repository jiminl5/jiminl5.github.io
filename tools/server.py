#!/usr/bin/env python3
"""포트폴리오 편집기 로컬 서버.

  python3 tools/server.py        → http://127.0.0.1:8765/tools/editor.html

- 사이트(site/)와 편집기(tools/)를 내 컴퓨터에서만 보여준다 (외부 접속 불가).
- 편집기에서 저장하면 site/content.json, 이미지는 site/images/ 에 쓴다.
- '사이트에 올리기'는 git commit + push → GitHub Actions가 자동 배포한다.
파이썬 기본 라이브러리만 쓴다 (설치할 것 없음).
"""
import json
import os
import re
import subprocess
import sys
import webbrowser
from datetime import datetime
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
CONTENT = os.path.join(SITE, "content.json")
IMAGES = os.path.join(SITE, "images")
PORT = int(os.environ.get("PORT", "8765"))
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def git(*args):
    r = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def safe_name(name):
    base, ext = os.path.splitext(os.path.basename(name))
    ext = ext.lower()
    if ext not in IMAGE_EXT:
        raise ValueError("이미지 파일(jpg, png, gif, webp)만 올릴 수 있어요.")
    base = re.sub(r"[^0-9A-Za-z가-힣_-]+", "-", base).strip("-") or "image"
    name, n = base + ext, 2
    while os.path.exists(os.path.join(IMAGES, name)):
        name, n = f"{base}-{n}{ext}", n + 1
    return name


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        if self.command != "GET":
            super().log_message(fmt, *args)

    def reply(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self.send_response(302)
            self.send_header("Location", "/tools/editor.html")
            self.end_headers()
            return
        if self.path == "/api/status":
            code, out = git("status", "--short")
            return self.reply(200, {"git": code == 0, "changes": out})
        if self.path == "/api/images":
            files = sorted(f for f in os.listdir(IMAGES) if os.path.splitext(f)[1].lower() in IMAGE_EXT)
            return self.reply(200, {"images": ["images/" + f for f in files]})
        super().do_GET()

    def do_POST(self):
        # 다른 사이트에서 이 서버로 요청을 보내지 못하게 막는다
        origin = self.headers.get("Origin", "")
        if origin and not re.match(rf"^http://(127\.0\.0\.1|localhost):{PORT}$", origin):
            return self.reply(403, {"error": "forbidden"})
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            if self.path == "/api/save":
                data = json.loads(body.decode("utf-8"))
                tmp = CONTENT + ".tmp"
                with open(tmp, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                    f.write("\n")
                os.replace(tmp, CONTENT)
                return self.reply(200, {"ok": True})

            if self.path == "/api/upload":
                name = safe_name(unquote(self.headers.get("X-Filename", "image.png")))
                with open(os.path.join(IMAGES, name), "wb") as f:
                    f.write(body)
                return self.reply(200, {"ok": True, "path": "images/" + name})

            if self.path == "/api/publish":
                msg = json.loads(body.decode("utf-8") or "{}").get("message") or \
                    "내용 업데이트 " + datetime.now().strftime("%Y-%m-%d %H:%M")
                log = []
                for args in (("add", "-A"), ("commit", "-m", msg), ("push",)):
                    code, out = git(*args)
                    log.append("$ git " + " ".join(args) + "\n" + out)
                    if code != 0 and not (args[0] == "commit" and "nothing to commit" in out):
                        return self.reply(500, {"ok": False, "log": "\n\n".join(log)})
                return self.reply(200, {"ok": True, "log": "\n\n".join(log)})
        except Exception as e:  # 편집기 화면에 그대로 보여준다
            return self.reply(400, {"error": str(e)})
        self.reply(404, {"error": "not found"})


def main():
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), partial(Handler, directory=ROOT))
    url = f"http://127.0.0.1:{PORT}/tools/editor.html"
    print(f"편집기: {url}\n사이트 미리보기: http://127.0.0.1:{PORT}/site/\n끝내려면 이 창을 닫거나 Ctrl+C")
    if "--no-browser" not in sys.argv:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
