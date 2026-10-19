import type { OutputPreset } from '../../editor/types/project';
export const APPLE_SOURCE =
  'https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications';
export const GOOGLE_SOURCE =
  'https://support.google.com/googleplay/android-developer/answer/9866151?hl=en';
export const PRESETS: OutputPreset[] = [
  {
    id: 'iphone',
    platform: 'app-store',
    device: 'phone',
    label: 'iPhone',
    width: 1206,
    height: 2622,
    orientation: 'portrait',
    folder: 'iphone',
  },
  {
    id: 'iphone-large',
    platform: 'app-store',
    device: 'phone',
    label: 'Large iPhone',
    width: 1320,
    height: 2868,
    orientation: 'portrait',
    folder: 'large-iphone',
  },
  {
    id: 'ipad',
    platform: 'app-store',
    device: 'tablet',
    label: 'iPad',
    width: 2064,
    height: 2752,
    orientation: 'portrait',
    folder: 'ipad',
  },
  {
    id: 'mac',
    platform: 'mac-app-store',
    device: 'pc',
    label: 'Mac',
    width: 2880,
    height: 1800,
    orientation: 'landscape',
    folder: 'mac',
  },
  {
    id: 'play-phone',
    platform: 'google-play',
    device: 'phone',
    label: 'Phone',
    width: 1080,
    height: 1920,
    orientation: 'portrait',
    folder: 'phone',
  },
  {
    id: 'play-tablet',
    platform: 'google-play',
    device: 'tablet',
    label: 'Tablet Landscape',
    width: 1920,
    height: 1080,
    orientation: 'landscape',
    folder: 'tablet',
  },
  {
    id: 'chromebook',
    platform: 'google-play',
    device: 'pc',
    label: 'Chromebook',
    width: 1920,
    height: 1080,
    orientation: 'landscape',
    folder: 'chromebook',
  },
];
/**
 * 플랫폼별 출력 크기와 방향이 지원 범위인지 검사합니다.
 */
export function validatePreset(p: OutputPreset): boolean {
  const hasInvalidDimensions =
    !Number.isInteger(p.width) || !Number.isInteger(p.height);

  if (hasInvalidDimensions) {
    return false;
  }

  const hasWrongOrientation =
    p.orientation !== (p.width > p.height ? 'landscape' : 'portrait');

  if (hasWrongOrientation) {
    return false;
  }

  const isGooglePlay = p.platform === 'google-play';

  if (isGooglePlay) {
    return (
      Math.min(p.width, p.height) >= 320 &&
      Math.max(p.width, p.height) <= 3840 &&
      Math.max(p.width, p.height) <= 2 * Math.min(p.width, p.height)
    );
  }

  return PRESETS.some(
    (v) =>
      v.id === p.id &&
      v.platform === p.platform &&
      v.device === p.device &&
      v.width === p.width &&
      v.height === p.height,
  );
}
