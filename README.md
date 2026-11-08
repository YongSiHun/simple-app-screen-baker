# Simple App Screen Baker

## 개요

- 앱 SS → App Store·Google Play용 PNG/ZIP
- Web UI 편집 · 로컬 처리

## 기술스택

- FE: React 19 · TS 5.9 · Zustand 5 · TW CSS 4
- Build: Vite 7 · Export: JSZip
- Infra: CF Workers
- Runtime: Node.js ≥22.12 · Yarn 1.22.22

## 명령어

```sh
yarn install --frozen-lockfile # Deps 설치
yarn start                     # Dev
yarn typecheck                 # TS 검사
yarn lint                      # Lint
yarn lint:fix                  # Lint 수정
yarn format                    # Fmt
yarn format:check              # Fmt 검사
yarn test                      # Test
yarn build                     # Prod 빌드
yarn preview                   # 로컬 HTTPS
yarn deploy                    # CF 배포
```
