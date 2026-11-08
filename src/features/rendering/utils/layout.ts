import type { Rect } from '../types/layout';
import type {
  DeviceKind,
  TemplateId,
  ElementPosition,
  Slide,
} from '../../editor/types/project';
/** AR 유지 · 영역 내 맞춤 */
export function contain(
  sourceWidth: number,
  sourceHeight: number,
  box: Rect,
): Rect {
  const scale = Math.min(box.width / sourceWidth, box.height / sourceHeight);

  return {
    x: box.x + (box.width - sourceWidth * scale) / 2,
    y: box.y + (box.height - sourceHeight * scale) / 2,
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}

/** AR 유지 · 영역 채움·중앙 크롭 */
export function cover(
  sourceWidth: number,
  sourceHeight: number,
  box: Rect,
): Rect {
  const scale = Math.max(box.width / sourceWidth, box.height / sourceHeight);

  return {
    x: box.x + (box.width - sourceWidth * scale) / 2,
    y: box.y + (box.height - sourceHeight * scale) / 2,
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}

/** 가로 배치 · 공통 텍스트 열 */
function landscapeLayout(width: number, height: number, template: TemplateId) {
  const reverse = template === 'center';
  const pad = width * 0.075;
  const textX = reverse ? width * 0.59 : pad;
  const deviceX = reverse ? pad : width * 0.51;

  return {
    title: {
      x: textX,
      y: height * 0.26,
      width: width * 0.34,
      height: height * 0.29,
    },
    subtitle: {
      x: textX,
      y: height * 0.58,
      width: width * 0.34,
      height: height * 0.17,
    },
    device: {
      x: deviceX,
      y: height * 0.1,
      width: width * 0.41,
      height: height * 0.76,
    },
    landscape: true,
  };
}

/** 세로 배치 · 가로 위치와 독립 */
function portraitLayout(
  width: number,
  height: number,
  template: TemplateId,
  device: DeviceKind,
) {
  const below = template === 'center';
  const pad = width * 0.075;

  return {
    title: {
      x: pad,
      y: below ? height * 0.76 : height * 0.075,
      width: width - pad * 2,
      height: height * 0.13,
    },
    subtitle: {
      x: pad,
      y: below ? height * 0.9 : height * 0.22,
      width: width - pad * 2,
      height: height * 0.065,
    },
    device: {
      x: pad,
      y: below ? height * 0.07 : height * 0.33,
      width: width - pad * 2,
      height: height * (below ? 0.64 : 0.61),
    },
    landscape: false,
    deviceKind: device,
  };
}

// 출력 비례 좌표 · 기기 변경 시 위치 유지
/** 상대 좌표 적용·화면 경계 제한 */
export function positionRect(
  rect: Rect,
  width: number,
  height: number,
  position?: ElementPosition,
): Rect {
  return {
    ...rect,
    x: Math.max(
      0,
      Math.min(width - rect.width, rect.x + (position?.x ?? 0) * width),
    ),
    y: Math.max(
      0,
      Math.min(height - rect.height, rect.y + (position?.y ?? 0) * height),
    ),
  };
}

/** 화면 이동량 → 저장용 상대 좌표 */
export function movePosition(
  rect: Rect,
  width: number,
  height: number,
  position: ElementPosition | undefined,
  dx: number,
  dy: number,
): ElementPosition {
  const current = positionRect(rect, width, height, position);
  const next = positionRect(current, width, height, { x: dx, y: dy });

  return { x: (next.x - rect.x) / width, y: (next.y - rect.y) / height };
}

/** 기본 배치·슬라이드 좌표 병합 */
export function layout(
  width: number,
  height: number,
  template: TemplateId,
  device: DeviceKind,
  positions?: Slide['positions'],
) {
  const landscape = width > height;
  const base = landscape
    ? landscapeLayout(width, height, template)
    : portraitLayout(width, height, template, device);

  return {
    ...base,
    title: positionRect(base.title, width, height, positions?.title),
    subtitle: positionRect(base.subtitle, width, height, positions?.subtitle),
    device: positionRect(base.device, width, height, positions?.device),
  };
}

/** 명시 개행·글자 폭 기준 줄바꿈 */
function wrapParagraph(
  paragraph: string,
  maxWidth: number,
  measure: (value: string) => number,
): string[] {
  const lines: string[] = [];
  let line = '';

  for (const char of paragraph) {
    const next = line + char;
    const shouldWrapLine = line.length > 0 && measure(next) > maxWidth;

    if (shouldWrapLine) {
      lines.push(line.trimEnd());
      line = char.trimStart();
      continue;
    }

    line = next;
  }

  lines.push(line.trimEnd());

  return lines;
}

export function wrapText(
  text: string,
  maxWidth: number,
  measure: (value: string) => number,
): string[] {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .flatMap((paragraph) => wrapParagraph(paragraph, maxWidth, measure));
}

/** 영역 내 최대 폰트 크기 탐색 */
export function fitText(
  text: string,
  box: Rect,
  maxSize: number,
  minSize: number,
  measure: (text: string, size: number) => number,
) {
  for (let size = maxSize; size >= minSize; size -= 1) {
    const lines = wrapText(text, box.width, (t) => measure(t, size));
    const doesTextFit =
      lines.length * size * 1.25 <= box.height &&
      lines.every((line) => measure(line, size) <= box.width);

    if (doesTextFit) {
      return { size, lines };
    }
  }

  throw new Error('문구가 너무 깁니다. 제목 또는 부제목을 줄여주세요.');
}
