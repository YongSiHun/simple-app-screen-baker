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

## 코드 구조

- 프레젠테이션: `components`, `screens`, `hooks`, `store`
- 업무 서비스: `features/*/services`, `app/services`
- 데이터 어댑터: `features/*/data`, `core/data`
- 공유 계약·순수 계산: `types`, `constants`, `utils` · 정적 안내 콘텐츠: `info/content`

의존 방향은 프레젠테이션 → 업무 서비스 → 데이터 어댑터이며 ESLint로 검사합니다. 이미지 저장소·디코더는 서비스에 주입하고, 다운로드 형식·WebP 헤더·구조화 데이터는 유형별 처리기를 등록해 확장합니다.

`src`·`scripts`·루트 설정의 함수별 인지복잡도 상한은 5입니다. 자체 규칙은 조건문·반복문·catch·switch·삼항식에 1점과 중첩 깊이를, 논리 연산식마다 1점을 더합니다. 내부 함수는 독립적으로 계산하고 테스트는 상한 검사에서 제외합니다. 중첩 if·반복문도 금지하며, 이 수치를 외부 Sonar 분석과 동일하게 취급하지 않습니다.
