import type {
  DeviceKind,
  ProjectDesign,
  Slide,
} from '../../editor/types/project';
import { resolveFrame } from './frame.ts';
import { contain, layout } from './layout.ts';

const COMMON_ASPECT_RATIOS = [
  [1, 1],
  [3, 4],
  [4, 3],
  [9, 16],
  [16, 9],
  [16, 10],
  [10, 16],
  [9, 19.5],
  [19.5, 9],
  [9, 20],
  [20, 9],
  [2, 3],
  [3, 2],
  [9, 21],
  [21, 9],
];

/**
 * 스마트폰·태블릿·PC에 맞는 원본 화면 비율을 선택합니다.
 */
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

/**
 * 기기 프레임과 실제 이미지 영역의 크기·위치를 계산합니다.
 */
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
  const bezel =
    design.template === 'frameless'
      ? 0
      : outer.width * (frame === 'phone' ? 0.032 : 0.022);
  const radius =
    design.template === 'frameless'
      ? outer.width * 0.012
      : outer.width * (frame === 'phone' ? 0.115 : 0.045);
  const screen = {
    x: outer.x + bezel,
    y: outer.y + bezel,
    width: outer.width - 2 * bezel,
    height: outer.height - 2 * bezel,
  };

  return { frame, arrangement, outer, bezel, radius, screen, aspect };
}

/**
 * 확대 없이 표시하는 데 필요한 원본 이미지 크기를 계산합니다.
 */
export function recommendedImageSize(
  screen: { width: number; height: number },
  source?: { width: number; height: number },
) {
  const fitted = source
    ? contain(source.width, source.height, { x: 0, y: 0, ...screen })
    : screen;

  return {
    width: Math.ceil(fitted.width),
    height: Math.ceil(fitted.height),
    sufficient: source
      ? source.width >= fitted.width && source.height >= fitted.height
      : undefined,
  };
}

/**
 * 원본 크기를 읽기 쉬운 화면 비율로 표시합니다.
 */
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

/**
 * 임의의 원본 크기를 약분하는 데 사용할 최대공약수를 구합니다.
 */
function greatestCommonDivisor(first: number, second: number): number {
  let remainder = second;
  let divisor = first;

  while (remainder) {
    [divisor, remainder] = [remainder, divisor % remainder];
  }

  return divisor;
}
