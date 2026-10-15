# Simple App Screen Baker

앱 스크린샷을 가장 간단하게.

앱 화면과 소개 문구로 App Store·Google Play용 이미지를 만드는 무료 웹 도구.
템플릿 편집, PNG·ZIP 다운로드 지원. 이미지 처리는 브라우저 안에서 진행하며, 작업 내용은 현재 탭에만 유지.

## 실행

Node.js 22.12 이상, Yarn 1.22.22 필요.

```sh
yarn install
yarn start
```

접속: http://localhost:5173

## 빌드

```sh
yarn build
```

출력: `dist/`

Workers 로컬 미리보기: 빌드 후 `yarn preview` → http://localhost:8787
