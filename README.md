# Simple App Screen Baker

앱 스크린샷을 가장 간단하게. Create app store screenshots, simply.

브라우저에서 앱 화면과 문구를 합성하는 React + TypeScript MVP 소스입니다. 계정, 서버 업로드, API 키 없이 사용하도록 구현했습니다.

> **검증 상태 (2026-10-15):** 핵심 테스트 51개 통과, 핵심 엔진 strict 타입 검사 통과, 전체 TypeScript 구문 검사 통과, 로컬 대체 도구로 25개 소스 파일 ESLint 오류·경고 0개, Prettier 포맷 적용. 이 작업 환경에서 npm 레지스트리 요청이 EACCES로 차단되어 의존성 설치와 전체 앱 타입 검사·Vite 빌드·브라우저 동작 검증은 완료하지 못했습니다. 따라서 프로덕션 출시 검증 완료로 간주하면 안 됩니다. 아래 명령으로 의존성 설치 후 전체 검증을 실행해주세요. package-lock.json도 최초 정상 설치 시 생성하여 커밋해야 합니다.

## 실행

Node.js **22.12 이상**과 npm을 사용합니다. 현재 확인한 실행 환경은 Node.js 22.23.2입니다.

```sh
npm install
npm run dev
```

http://localhost:5173 에서 열립니다. dev/build 전처리 스크립트가 설치된 Pretendard 패키지에서 Regular·SemiBold·ExtraBold WOFF2와 원본 OFL 라이선스를 public/fonts로 복사합니다. 폰트는 동일 출처에서 제공하며 UI와 Canvas 모두 같은 Pretendard 폰트를 사용합니다. 외부 CDN 요청은 없습니다.

```sh
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
npm run preview
```

테스트는 별도 프레임워크가 필요하지 않은 순수 함수와 PNG 인코더를 대상으로 하므로 Node.js 내장 테스트 러너를 사용했습니다. npm test는 의존성을 설치하기 전에도 Node.js 22에서 실행할 수 있습니다. Node.js의 TypeScript type stripping은 실행만 담당하며 타입 검사를 대체하지 않습니다.

## 구현 기능

- 랜딩, 에디터, 가이드, 개인정보처리방침, 이용약관 및 404 페이지
- 한국어 중심 브랜드 UI, 자체 SVG 심볼·파비콘, 데스크톱 우선 반응형 레이아웃
- PNG/JPEG/WebP 파일 선택, 드래그 앤 드롭, 다중 업로드, 읽기 오류 안내
- 슬라이드 추가·선택·삭제·복제·앞뒤 이동, 슬라이드별 제목·부제목
- 슬라이드마다 스마트폰·태블릿·PC 원본을 별도 참조
- 프로젝트 공통 템플릿 3종, 배경·글자색, 폰트 굵기, 프레임 종류·색상
- 제조사 에셋 없이 Canvas 도형으로 그리는 범용 프레임
- 원본 비율을 유지하는 contain 합성, 가로·세로 개별 배치, 문구 자동 줄바꿈·축소·넘침 오류
- 미리보기와 동일한 엔진을 사용하는 실제 해상도 출력
- RGB 24-bit PNG: 알파를 제거한 RGB scanline, native deflate, PNG 청크 및 CRC-32 생성
- PNG 크기·8-bit depth·color type 2 및 청크 CRC 검증
- 현재 슬라이드 PNG 또는 여러 규격·전체 슬라이드 ZIP, 순차 렌더링·진행률·중복 실행 차단
- ZIP에서 기기용 원본 없는 출력을 제외하고 개수 안내
- 폰트 로딩 대기, 삭제·교체 시 참조 없는 ImageBitmap.close 및 Object URL 해제

## 사용 흐름

1. /editor에서 출력 규격을 선택합니다. 출력 기기 종류에 맞는 원본을 등록합니다.
2. 여러 파일 업로드 시 첫 파일은 선택 슬라이드의 해당 기기 원본을 교체하고, 나머지는 새 슬라이드가 됩니다.
3. 다른 기기용 원본은 같은 슬라이드를 선택한 상태에서 해당 출력 규격으로 전환한 뒤 등록합니다.
4. 템플릿·배경·글자색·프레임은 모든 슬라이드에 적용됩니다. 제목과 부제목은 현재 슬라이드만 수정합니다.
5. 다운로드에서 현재 이미지를 PNG로 받거나, 원하는 여러 프리셋을 체크하고 ZIP을 받습니다.

출력 규격(OutputPreset)은 플랫폼·해상도·방향·원본 종류를 결정합니다. 프레임(ProjectDesign.frame)은 합성할 외형만 결정합니다. 두 설정은 자동으로 서로를 변경하지 않습니다.

## 구조

```text
src/
  app/                         앱 진입·라우터·페이지 제목
  core/components/             브랜드·공통 레이아웃·자체 아이콘
  features/
    landing/screens/           랜딩 페이지 및 직접 제작한 UI 목업
    editor/
      screens/                 에디터 조립
      components/              설정·미리보기·슬라이드 목록
      services/images.ts       원본 파일·ImageBitmap·Object URL 저장소
      store/useProject.ts      Zustand 프로젝트·선택 상태
      types/project.ts         Project·Slide·Design·OutputPreset 모델
    templates/definitions/     고정형 템플릿 정의
    rendering/
      utils/layout.ts          좌표·contain·줄바꿈·텍스트 크기 계산
      services/render.ts       공통 Canvas 렌더링 및 폰트 준비
    export/
      constants/presets.ts     프리셋·공식 문서 URL·출력 규격 검증
      services/png.ts          RGB PNG 인코딩·CRC·헤더 검사
      services/export.ts       PNG·ZIP 생성 및 다운로드
      components/              다운로드 다이얼로그
    info/screens/              가이드·개인정보·약관
public/                        로고·파비콘·Pages 라우팅·보안 헤더
scripts/prepare-fonts.mjs       폰트와 OFL 고지 자동 복사
tests/core.test.mjs             핵심 엔진 자동 테스트
```

원본 바이너리는 Zustand 상태에 포함하지 않습니다. 슬라이드는 리소스 ID만 참조하므로 추후 IndexedDB 또는 Supabase를 별도 저장소 어댑터로 연결할 수 있습니다. MVP에는 저장소 연동이 없습니다.

## 라이브러리 선정

| 도구                                      | 사용 이유                                              |
| ----------------------------------------- | ------------------------------------------------------ |
| React 19, TypeScript 5.9                  | 함수형 UI·Hooks 및 strict 모델링                       |
| Vite 7                                    | 정적 SPA 개발 및 빌드, Node 22 호환                    |
| Tailwind CSS 4, @tailwindcss/vite         | Vite 통합과 브랜드 토큰; 상세 레이아웃은 일반 CSS 병행 |
| React Router 7                            | 5개 페이지와 SPA 경로 관리                             |
| Zustand 5                                 | 작은 상태 API로 프로젝트 편집과 바이너리 분리          |
| JSZip 3                                   | 여러 플랫폼별 PNG를 폴더 구조로 묶기                   |
| Pretendard 1.3.9                          | UI·Canvas에서 공통 사용 가능한 한국어·영문 폰트        |
| ESLint 9, typescript-eslint 8, Prettier 3 | 타입 기반 소스 규칙·Hooks 검사·포맷                    |

PNG는 추가 인코딩 라이브러리 대신 브라우저 내장 CompressionStream과 독립적인 PNG 서비스를 사용합니다. 파일 형식과 복원 픽셀은 자동 테스트합니다. 최신 Chrome·Edge·Firefox·Safari를 대상으로 합니다. 버전 범위는 호환되는 안정 메이저를 유지하며, 실제 해석되는 버전은 정상 설치 후 lockfile로 고정하세요.

## 스토어 규격 확인

2026-10-15에 공식 문서를 확인했습니다.

- [Apple 스크린샷 사양](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications): iPhone 1206×2622 / Large iPhone 1320×2868 / iPad 2064×2752 / Mac 2880×1800.
- [Google Play 미리보기 자료](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en): Phone 1080×1920, Tablet Landscape와 Chromebook 1920×1080은 허용 크기와 비율을 바탕으로 선택한 프리셋입니다.
- Google Play 태블릿·Chromebook은 최소 4장의 앱 경험, 16:9 또는 9:16 대형 화면, 앱 외 설명 문구 제외 안내를 확인하세요. 제목·부제목을 비우고 Frameless를 사용하는 방법을 에디터와 가이드에 표시합니다.
- 스토어별 제출 수, 필수 디스플레이, 이미지 내용·권리는 사용자가 최종 확인해야 합니다. 규격 검증이 스토어 승인 보장은 아닙니다.

프리셋은 src/features/export/constants/presets.ts에서 수정합니다. 실제 제출 전에 공식 사양을 다시 확인하세요.

## Cloudflare Pages 배포

외부 계정 연결이나 배포는 이 작업에서 수행하지 않았습니다.

1. 정상적인 npm install 후 package-lock.json을 생성하고 검증 명령을 실행합니다.
2. 이 프로젝트를 GitHub의 simple-app-screen-baker 저장소에 커밋·푸시합니다. 참고 PNG는 실행이나 배포에 필요하지 않으며, 로고·파비콘은 public의 SVG 파일을 사용합니다.
3. Cloudflare 대시보드에서 Workers & Pages → Create → Pages → Connect to Git으로 GitHub 저장소를 연결합니다.
4. Production branch를 main 등 실제 기본 브랜치로 설정합니다.
5. Build command: **npm run build** / Build output directory: **dist** / Root directory: 저장소 루트.
6. 빌드 Node 버전은 .node-version(22)을 사용합니다. Cloudflare 설정에서 별도 버전을 지정하면 22.12 이상으로 맞춥니다. 앱 자체 환경변수는 없습니다.
7. 최초 배포 후 /editor, /guide, /privacy, /terms에 직접 접속하고 새로고침해 확인합니다. public/_redirects가 dist/_redirects로 복사되어 SPA를 지원합니다.
8. 이후 기본 브랜치 push로 자동 배포됩니다. screenbaker.pages.dev는 희망 주소이며 실제 사용 가능 여부는 Cloudflare에서 확인해야 합니다.

운영자 정보·문의 창구와 호스팅 데이터 처리를 공개 운영 전에 검토해주세요. AdSense, 게시자 ID, ads.txt, 가짜 광고 영역은 추가하지 않았습니다.

## 검증과 제한

실행한 결과와 미실행 항목은 [docs/VERIFICATION.md](docs/VERIFICATION.md)에 기록했습니다.

- 프로젝트와 원본은 현재 탭 메모리에만 있습니다. 새로고침·탭 종료 시 소실됩니다.
- 파일당 25MB·이미지당 4천만 픽셀 제한이 있습니다. ZIP은 순차 생성하지만 생성된 압축 데이터를 모아야 하므로 이미지가 많으면 메모리 사용량이 증가합니다.
- Web Worker, IndexedDB, Supabase, 실행 취소, 자유 배치, 다국어 프로젝트는 MVP에 없습니다.
- 저해상도 원본 확대 시 선명도 복원은 하지 않습니다. 프레임 비율 차이는 여백으로 처리합니다.
- 이 환경에서는 UI 시각 QA 및 실제 파일 선택 → 편집 → 브라우저 다운로드 시나리오가 아직 검증되지 않았습니다.

## 다음 단계

1. 네트워크가 허용되는 환경에서 의존성 설치·전체 타입 검사·빌드·브라우저 QA 및 lockfile 확정.
2. 데스크톱/모바일에서 실제 앱 원본으로 내보내기와 미리보기 비교.
3. 사용자 피드백 후 IndexedDB 프로젝트 복원과 Web Worker 출력 최적화 검토.
