#!/bin/bash
# 더블클릭하면 편집기가 브라우저에 열린다. 다 쓰면 이 터미널 창을 닫으면 된다.
cd "$(dirname "$0")"
python3 tools/server.py
