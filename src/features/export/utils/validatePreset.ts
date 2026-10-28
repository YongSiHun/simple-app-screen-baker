import type { OutputPreset } from '../../editor/types/project';
import { PRESETS } from '../constants/presets.ts';

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
