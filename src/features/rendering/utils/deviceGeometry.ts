import type {
  DeviceKind,
  ProjectDesign,
  Slide,
} from '../../editor/types/project';
import { resolveFrame } from './frame.ts';
import { contain, cover, layout } from './layout.ts';

import { COMMON_ASPECT_RATIOS } from '../constants/devices.ts';
import type { ImageSize } from '../../../core/types/images';

/** 폰·태블릿·PC 원본 AR 선택 */
function frameAspect(frame: DeviceKind, landscape: boolean) {
  const isPhone = frame === 'phone';

  if (isPhone) {
    return { width: 9, height: 19.5 };
  }

  const isPortraitTablet = frame === 'tablet' && !landscape;

  if (isPortraitTablet) {
    return { width: 3, height: 4 };
  }

  return { width: 16, height: 10 };
}

/** 프레임·화면 크기/위치 산출 */
export function deviceGeometry(
  width: number,
  height: number,
  design: ProjectDesign,
  device: DeviceKind,
  positions?: Slide['positions'],
) {
  const frame = resolveFrame(design.frame, device);
  const arrangement = layout(width, height, design.template, frame, positions);
  const aspect = frameAspect(frame, arrangement.landscape);
  const ratio = aspect.width / aspect.height;
  const outer = contain(ratio, 1, arrangement.device);
  const { bezel, radius } = frameInsets(
    design.template === 'frameless',
    frame,
    outer.width,
  );
  const screen = {
    x: outer.x + bezel,
    y: outer.y + bezel,
    width: outer.width - 2 * bezel,
    height: outer.height - 2 * bezel,
  };

  return { frame, arrangement, outer, bezel, radius, screen, aspect };
}

/** 확대 없는 원본 권장 크기 */
export function recommendedImageSize(screen: ImageSize, source?: ImageSize) {
  const fitted = source
    ? cover(source.width, source.height, { x: 0, y: 0, ...screen })
    : screen;

  return {
    width: Math.ceil(fitted.width),
    height: Math.ceil(fitted.height),
    sufficient: source
      ? source.width >= fitted.width && source.height >= fitted.height
      : undefined,
  };
}

/** 원본 AR 표시 */
export function imageAspectRatio(width: number, height: number) {
  const ratio = width / height;
  const match = COMMON_ASPECT_RATIOS.find(
    ([width, height]) => Math.abs(ratio / (width / height) - 1) < 0.005,
  );
  const hasCommonRatio = match !== undefined;

  if (hasCommonRatio) {
    return (
      (Math.abs(ratio - match[0] / match[1]) > 1e-8 ? '약 ' : '') +
      match.join(':')
    );
  }

  const scaledWidth = Math.round(width * 10);
  const scaledHeight = Math.round(height * 10);
  const divisor = greatestCommonDivisor(scaledWidth, scaledHeight);

  return String(scaledWidth / divisor) + ':' + String(scaledHeight / divisor);
}

/** AR 약분용 GCD */
function greatestCommonDivisor(first: number, second: number): number {
  let remainder = second;
  let divisor = first;

  while (remainder) {
    [divisor, remainder] = [remainder, divisor % remainder];
  }

  return divisor;
}

function frameInsets(frameless: boolean, frame: DeviceKind, width: number) {
  if (frameless) {
    return { bezel: 0, radius: width * 0.012 };
  }

  const isPhone = frame === 'phone';

  return {
    bezel: width * (isPhone ? 0.032 : 0.022),
    radius: width * (isPhone ? 0.115 : 0.045),
  };
}
