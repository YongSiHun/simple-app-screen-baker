# 검증 기록

검증일: 2026-10-15. Node.js 22.23.2 / Windows.

## 완료된 검사

| 검사                   | 결과                      | 범위                                                    |
| ---------------------- | ------------------------- | ------------------------------------------------------- |
| Node 내장 자동 테스트  | 51개 통과 / 실패 0        | 실제 소스의 레이아웃·텍스트·출력 프리셋·PNG             |
| 핵심 strict TypeScript | 오류 0                    | layout.ts·presets.ts·png.ts 및 모델                     |
| 전체 TypeScript 구문   | 21개 파일 오류 0          | transpileModule, 의미적 타입 검사와 구별                |
| 로컬 ESLint 검사       | 25개 파일 오류 0 / 경고 0 | JS recommended, TS recommended, React Hooks recommended |
| Prettier               | 전체 소스 포맷 적용       | CSS·TS·TSX·JS·설정·문서                                 |

기본 터미널 도구가 helper_unknown_error: setup refresh had errors로 시작되지 않아 Node 실행 도구의 child_process를 사용했습니다. npm 레지스트리 접속은 EACCES, 오프라인 설치는 ENOTCACHED로 실패했습니다. 이미 설치되어 있던 로컬 TypeScript 5.9.3, ESLint 및 Prettier를 읽기 전용으로 호출해 가능한 검사를 수행했으며 다른 프로젝트 파일은 수정하지 않았습니다. 로컬 ESLint 검사는 프로젝트 설정과 동일한 권장 규칙을 구성한 별도 검증 실행기로 진행했습니다. 저장소의 npm run lint 자체 실행 성공을 의미하지는 않습니다.

## 테스트 내용

- 7개 프리셋 × 3개 템플릿: 텍스트·기기 박스가 출력 경계 내에 있고 서로 겹치지 않음
- 가로·세로 배치와 원본 비율 보존
- 한글, 명시적 줄바꿈, 빈 줄, 이모지, 긴 문구 축소와 초과 오류
- Apple 치수, Google 최소·최대·비율, 방향 및 정수 크기 검증
- 직접 생성한 RGBA 픽셀을 RGB PNG로 인코딩하고 zlib 복원 후 원본 RGB와 비교
- 실제 iPhone 1206×2622 해상도 PNG 인코딩 및 헤더 검사
- 알파·잘못된 입력·잘못된 해상도·CRC 손상·불완전 PNG 검출

## 아직 검증하지 못한 항목

- npm install 완료 및 package-lock.json 확정
- 전체 React 앱의 npm run typecheck
- 설치된 프로젝트 설정으로 npm run lint
- Pretendard 패키지에서 폰트와 원본 OFL 복사
- npm run build 및 Vite 개발 서버 실행
- 실제 브라우저에서 Canvas·폰트 로딩·다운로드·ZIP 파일 확인
- 데스크톱·모바일 시각 QA 및 키보드 접근성 실제 조작

위 항목을 성공으로 보고하지 않습니다. 전체 앱 타입 검사는 vite/client 타입 미설치로 시작 단계에서 중단되었습니다.

## 설치 후 수동 확인 순서

1. npm install, npm run typecheck, npm run lint, npm test, npm run format:check, npm run build.
2. npm run dev 후 5개 페이지와 존재하지 않는 경로 확인.
3. PNG/JPEG/WebP 업로드, 다중 선택, 드래그 앤 드롭, 손상 파일·지원하지 않는 형식 오류 확인.
4. 제목·부제목, 템플릿 3종, 색상, 굵기, 프레임 3종·2색 변경 후 미리보기 확인.
5. 슬라이드 추가·복제·삭제·앞뒤 이동, 마지막 슬라이드 삭제 시 빈 슬라이드 생성 확인.
6. 한 슬라이드에 phone/tablet/pc 원본을 각각 등록하고 출력 규격 전환 시 해당 원본 사용 확인.
7. PNG를 내려받아 선택한 크기 및 color type 2 확인. 화면 확대/왜곡/글자 잘림 확인.
8. 여러 프리셋으로 ZIP 생성, 폴더명·순서·누락 원본 제외 개수·진행률·중복 방지 확인.
9. 매우 긴 텍스트·저해상도 원본·큰 파일·긴/넓은 화면에서 오류 및 비율 확인.
10. 모바일 390px, 태블릿 768px, 데스크톱 1440px에서 레이아웃·키보드 Tab·다이얼로그 Escape 확인.
11. npm run preview에서 /editor 등 직접 접근과 새로고침 확인. 배포 후 Cloudflare에서도 반복.
12. 네트워크 패널에서 원본 이미지가 전송되지 않고 폰트가 같은 출처에서 로딩되는지 확인.

추가로 로컬 React·Zustand의 실제 타입을 참조해 UI의 의미 검사를 시도했습니다. 미설치된 react-router·react-dom·JSZip 모듈 때문에 전체 통과로 보고하지 않습니다. npm run typecheck와 npm run lint는 프로젝트 실행 파일 미설치로 실패했고, npm run build는 Pretendard 파일 미설치로 전처리에서 실패했습니다. npm test 자체 명령은 51개 모두 통과했습니다.
