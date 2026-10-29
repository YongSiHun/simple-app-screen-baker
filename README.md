# Simple App Screen Baker

## 개요

앱 SS → App Store·Google Play용 PNG/ZIP 생성. 브라우저 내 편집·처리.

## 화면 지원

데스크톱 전용 · 최소 작업 해상도 1280 × 800px. 작은 화면에서는 레이아웃을 유지하고 가로·세로 스크롤을 제공합니다.
스크린샷은 선택한 기기 화면에 맞춰 원본 비율을 유지하며 채우고, 넘치는 부분은 중앙 기준으로 자릅니다. 미리보기와 PNG/ZIP에 동일하게 적용됩니다.

## 스택

React 19 · TS 5.9 · Vite 7 · Zustand 5 · TW CSS 4 · JSZip · CF Workers

Node.js ≥22.12 · Yarn 1.22.22

## 명령어

```sh
yarn install --frozen-lockfile # 설치
yarn start                     # 개발
yarn typecheck                 # 타입 검사
yarn lint                      # 린트
yarn lint:fix                  # 린트 수정
yarn format                    # 포맷
yarn format:check              # 포맷 검사
yarn test                      # 테스트
yarn build                     # 빌드
yarn preview                   # 빌드 후 로컬 미리보기
yarn deploy                    # 배포
```
