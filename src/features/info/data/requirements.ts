import { APPLE_SOURCE, GOOGLE_SOURCE } from '../../export/constants/presets';
import type { StoreRequirement } from '../types/content';
export const REQUIREMENTS_CHECKED_AT = '2026-11-04';
export const APPLE_UPLOAD_SOURCE =
  'https://developer.apple.com/help/app-store-connect/manage-app-information/manage-your-app-store-assets';
export const STORE_REQUIREMENTS: StoreRequirement[] = [
  {
    id: 'iphone',
    title: 'App Store · iPhone',
    format: 'JPEG 또는 PNG · 알파 채널·투명도 제외',
    sizes: [
      '필수 Dynamic Island 중형 디스플레이의 세로 크기 예: 1179 × 2556, 1206 × 2622px',
      '가로 이미지는 가로·세로를 서로 바꾼 크기. 다른 디스플레이별 허용 크기는 공식 표 확인',
    ],
    count:
      '디스플레이 크기별 1~10장. iPhone 지원 앱은 필수 디스플레이용 이미지 필요',
    notes: [
      '서비스의 iPhone 프리셋은 1206 × 2622px, Large iPhone은 별도 대형 디스플레이용 1320 × 2868px입니다.',
      '하나의 비율을 임의로 늘리는 대신 선택한 디스플레이의 정확한 픽셀 크기로 제출하세요.',
    ],
    presetIds: ['iphone', 'iphone-large'],
    source: { label: 'Apple 공식 스크린샷 규격', href: APPLE_SOURCE },
  },
  {
    id: 'ipad',
    title: 'App Store · iPad',
    format: 'JPEG 또는 PNG · 알파 채널·투명도 제외',
    sizes: [
      '13형 디스플레이: 세로 2064 × 2752 또는 2048 × 2732px',
      '가로: 2752 × 2064 또는 2732 × 2048px',
    ],
    count: '디스플레이 크기별 1~10장. iPadOS 지원 앱은 13형용 이미지 필요',
    notes: [
      '서비스는 2064 × 2752px 세로 프리셋을 제공합니다. 가로 출력 및 공식 표의 다른 크기를 모두 제공하지는 않습니다.',
      '앱이 지원하는 기기와 언어별 화면을 확인하세요.',
    ],
    presetIds: ['ipad'],
    source: { label: 'Apple 공식 스크린샷 규격', href: APPLE_SOURCE },
  },
  {
    id: 'play-phone',
    title: 'Google Play · 스마트폰',
    format: 'JPEG 또는 24-bit PNG · 알파 채널 제외',
    sizes: [
      '일반 제출: 각 변 320~3840px, 긴 변은 짧은 변의 2배 이하',
      '앱 추천 노출용 권장: 세로 9:16·1080 × 1920px 이상 또는 가로 16:9·1920 × 1080px 이상',
    ],
    count:
      '스토어 등록정보 공개에는 기기 유형 전체에 걸쳐 최소 2장. 기기 유형별 최대 8장',
    notes: [
      '일반 게시 최소 조건과 앱 추천 노출 조건은 다릅니다. 앱의 추천 노출용 안내는 최소 4장이며 게임은 별도 조건입니다.',
      '서비스의 Phone은 1080 × 1920px 세로 프리셋입니다.',
    ],
    presetIds: ['play-phone'],
    source: { label: 'Google Play 공식 미리보기 자료', href: GOOGLE_SOURCE },
  },
  {
    id: 'play-tablet',
    title: 'Google Play · 태블릿',
    format: 'JPEG 또는 24-bit PNG · 알파 채널 제외',
    sizes: [
      '공식 대형 화면 항목: 1080~7680px, 가로 16:9 또는 세로 9:16',
      '일반 스크린샷 항목에는 320~3840px·긴 변 2배 이하 조건이 별도로 기재되어 있습니다.',
    ],
    count: '공식 대형 화면 항목은 최소 4장 안내. 기기 유형별 최대 8장',
    notes: [
      '공식 문서의 일반 요건과 대형 화면 항목은 범위가 다릅니다. 제출 시 해당 기기 항목과 Play Console의 검증 결과를 함께 확인하세요.',
      '서비스의 Tablet Landscape는 1920 × 1080px입니다. 앱 경험 밖의 설명 문구를 제외하라는 대형 화면 안내에 맞춰 제목·부제목을 비우고 Frameless를 선택하세요.',
    ],
    presetIds: ['play-tablet'],
    source: { label: 'Google Play 공식 미리보기 자료', href: GOOGLE_SOURCE },
  },
];
