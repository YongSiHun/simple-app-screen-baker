import type { OutputPreset } from '../../editor/types/project';
import { PRESETS } from '../constants/presets.ts';

/** 플랫폼별 출력 크기·방향 검증 */
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
    return validateGoogleSize(p.width, p.height);
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

function validateGoogleSize(width: number, height: number) {
  const min = Math.min(width, height);
  const max = Math.max(width, height);

  return min >= 320 && max <= 3840 && max <= 2 * min;
}
