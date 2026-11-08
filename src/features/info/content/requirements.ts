import { APPLE_SOURCE, GOOGLE_SOURCE } from '../../export/constants/presets';
import type { StoreRequirement } from '../types/content';
export const REQUIREMENTS_CHECKED_AT = '2026-11-05';
export const APPLE_UPLOAD_SOURCE =
  'https://developer.apple.com/help/app-store-connect/manage-app-information/manage-your-app-store-assets';
export const STORE_REQUIREMENTS: StoreRequirement[] = [
  {
    id: 'iphone',
    title: 'App Store · iPhone',
    format: 'JPEG 또는 PNG. 투명한 부분이 없는 이미지',
    sizes: [
      '세로 이미지 예: 가로 1179 × 세로 2556픽셀, 가로 1206 × 세로 2622픽셀',
      '큰 화면용 이미지 예: 가로 1320 × 세로 2868픽셀. 등록할 화면 크기에 따라 필요한 규격이 다릅니다.',
    ],
    count:
      '화면 크기별 1~10장. iPhone 앱은 필수 화면 크기의 이미지를 준비해야 합니다.',
    notes: [
      '이 도구의 iPhone은 1206 × 2622픽셀, Large iPhone은 1320 × 2868픽셀로 저장됩니다.',
      '필수 제출 항목은 App Store Connect에서 확인하세요. 여기에는 대표적인 크기만 안내하며 전체 허용 크기는 공식 안내에서 확인할 수 있습니다.',
    ],
    presetIds: ['iphone', 'iphone-large'],
    source: { label: 'Apple 공식 규격 확인하기', href: APPLE_SOURCE },
  },
  {
    id: 'ipad',
    title: 'App Store · iPad',
    format: 'JPEG 또는 PNG. 투명한 부분이 없는 이미지',
    sizes: [
      '13형 세로 이미지: 2064 × 2752픽셀 또는 2048 × 2732픽셀',
      '13형 가로 이미지: 2752 × 2064픽셀 또는 2732 × 2048픽셀',
    ],
    count:
      '화면 크기별 1~10장. iPad를 지원하는 앱은 13형 이미지를 준비해야 합니다.',
    notes: [
      '이 도구에서는 2064 × 2752픽셀의 세로 이미지를 만들 수 있습니다. iPad 가로 이미지는 지원하지 않습니다.',
      '휴대폰 화면을 늘리기보다 실제 iPad에서 사용하는 화면을 준비해주세요.',
    ],
    presetIds: ['ipad'],
    source: { label: 'Apple 공식 규격 확인하기', href: APPLE_SOURCE },
  },
  {
    id: 'play-phone',
    title: 'Google Play · 휴대폰',
    format: 'JPEG 또는 투명한 부분이 없는 PNG',
    sizes: [
      '가로와 세로 각각 320~3840픽셀. 긴 쪽이 짧은 쪽의 2배를 넘지 않아야 합니다.',
      '추천 노출을 위한 앱 이미지: 세로 1080 × 1920픽셀 이상(9:16) 또는 가로 1920 × 1080픽셀 이상(16:9)',
    ],
    count:
      '등록에 필요한 이미지는 전체 기기 유형을 합해 최소 2장. 기기 유형별 최대 8장까지 등록할 수 있습니다.',
    notes: [
      '이 도구의 Phone은 1080 × 1920픽셀 세로 이미지입니다.',
      '스토어 등록의 최소 조건과 추천 노출을 위한 조건은 다릅니다. 추천 노출용 앱 이미지는 최소 4장을 안내하며, 게임은 별도 기준을 확인해주세요.',
    ],
    presetIds: ['play-phone'],
    source: { label: 'Google Play 공식 규격 확인하기', href: GOOGLE_SOURCE },
  },
  {
    id: 'play-tablet',
    title: 'Google Play · 태블릿',
    format: 'JPEG 또는 투명한 부분이 없는 PNG',
    sizes: [
      '태블릿 등 큰 화면 안내: 가로·세로 각각 1080~7680픽셀',
      '가로 이미지는 16:9, 세로 이미지는 9:16 비율',
    ],
    count:
      '큰 화면의 사용 모습을 보여주는 이미지는 4장 이상을 안내합니다. 기기 유형별 최대 8장까지 등록할 수 있습니다.',
    notes: [
      '이 도구의 Tablet Landscape는 1920 × 1080픽셀 가로 이미지입니다.',
      'Google은 앱 화면 밖의 별도 설명 문구를 제외하도록 안내합니다. 제목과 부제목을 비우고 테두리 없는 배치(Frameless)를 사용해보세요.',
      '휴대폰용 일반 규격과 큰 화면 안내가 다르므로 Play Console의 태블릿 등록 항목도 확인해주세요.',
    ],
    presetIds: ['play-tablet'],
    source: { label: 'Google Play 공식 규격 확인하기', href: GOOGLE_SOURCE },
  },
];
