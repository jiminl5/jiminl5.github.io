# 이지민 포트폴리오 사이트

- 사이트 주소: https://jiminl5.github.io
- 원본 저장소: https://github.com/jiminl5/jiminl5.github.io
- 이 폴더 위치: Google Drive › 내 드라이브 › Online Portfolio

2020년에 Wix로 만든 사이트(minjee2.wixsite.com/skybird1)를 같은 디자인으로 옮겨 온 것이다.
Wix 계정이 없어도 이 폴더만 있으면 사이트를 고치고 올릴 수 있다.

## 내용 고치기 (보통은 이것만 하면 됨)

1. **`편집기 열기.command`를 더블클릭**하면 브라우저에 편집기가 열린다.
   - 처음 한 번 "확인되지 않은 개발자" 경고가 뜨면: 파일을 우클릭 → 열기.
2. 왼쪽에서 글·이미지·이력을 고치고 **저장(⌘S)** → 오른쪽 미리보기에 바로 반영된다.
   - 이미지는 "내 컴퓨터에서 새 이미지 올리기"로 추가하면 `site/images/`에 복사된다.
   - 프로젝트·이력은 ↑↓로 순서 변경, "+ 맨 위에 추가"로 새 항목 추가.
3. 다 고쳤으면 **사이트에 올리기** → 1~2분 뒤 실제 사이트에 반영된다.
4. 끝나면 열려 있는 터미널 창을 닫는다.

편집기 없이 `site/content.json`을 텍스트 편집기로 직접 고쳐도 된다.

## 폴더 구조

```
site/                 실제로 배포되는 사이트 (이 폴더만 인터넷에 올라감)
  index.html          뼈대 (거의 안 고침)
  content.json        ★ 모든 내용 (글, 이력, 프로젝트, 연락처)
  images/             사진
  assets/style.css    디자인 (색: --blue, 폰트 등은 맨 위 :root)
  assets/app.js       content.json을 읽어서 화면을 그리는 코드
tools/
  server.py           편집기용 로컬 서버 (Python 기본 기능만 사용)
  editor.html         편집기 화면 (항목 추가는 위쪽 SCHEMA만 고치면 됨)
편집기 열기.command    더블클릭 실행용
archive/wix-2020/     예전 Wix 사이트 백업 (원본 HTML, 전체 스크린샷, 아이콘)
.github/workflows/    push하면 site/를 GitHub Pages에 자동 배포
```

## 배포 구조

`사이트에 올리기` = `git add` → `git commit` → `git push`.
GitHub에 push되면 GitHub Actions가 `site/` 폴더를 GitHub Pages에 올린다.
결과는 저장소의 Actions 탭에서 볼 수 있다.

## 몇 년 뒤 다시 손볼 때

- **GitHub 로그인이 안 되면**: 이 폴더는 그대로 남아 있으니 새 GitHub 계정(또는 Cloudflare Pages, Netlify 등)에
  `site/` 폴더만 올리면 사이트가 그대로 다시 뜬다. 특별한 빌드 과정이 없다.
- **올리기가 실패하면**: 터미널에서 `gh auth login`으로 GitHub에 다시 로그인한다.
  (`gh`가 없으면 `brew install gh`)
- **내 도메인을 붙이고 싶으면**: 도메인을 산 뒤 GitHub 저장소 Settings › Pages › Custom domain에 입력하고,
  도메인 업체 DNS에 GitHub Pages 주소를 연결한다.
- **편집기 없이 로컬에서 미리보기만**: 이 폴더에서 `python3 tools/server.py`
  → http://127.0.0.1:8765/site/
