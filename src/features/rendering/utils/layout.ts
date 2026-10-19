import type {
  DeviceKind,
  TemplateId,
  ElementPosition,
  Slide,
} from '../../editor/types/project';
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
/**
 * 원본 비율을 유지하며 지정한 사각형 안에 맞춥니다.
 */
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

/**
 * 템플릿과 출력 방향에 맞는 기본 배치를 계산합니다.
 */
function baseLayout(
  width: number,
  height: number,
  template: TemplateId,
  device: DeviceKind,
) {
  const landscape = width > height;
  const pad = width * 0.075;

  if (landscape) {
    const reverse = template === 'center';

    return {
      title: {
        x: reverse ? width * 0.59 : pad,
        y: height * 0.26,
        width: width * 0.34,
        height: height * 0.29,
      },
      subtitle: {
        x: reverse ? width * 0.59 : pad,
        y: height * 0.58,
        width: width * 0.34,
        height: height * 0.17,
      },
      device: {
        x: reverse ? pad : width * 0.51,
        y: height * 0.1,
        width: width * 0.41,
        height: height * 0.76,
      },
      landscape,
    };
  }

  const below = template === 'center';

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
    landscape,
    deviceKind: device,
  };
}

// Positions are proportions of the output size so edits survive device changes.
/**
 * 상대 이동값을 적용하고 요소가 화면 밖으로 나가지 않게 제한합니다.
 */
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

/**
 * 화면 이동량을 저장 가능한 상대 좌표로 변환합니다.
 */
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

/**
 * 기본 배치에 슬라이드별 컴포넌트 위치를 반영합니다.
 */
export function layout(
  width: number,
  height: number,
  template: TemplateId,
  device: DeviceKind,
  positions?: Slide['positions'],
) {
  const base = baseLayout(width, height, template, device);

  return {
    ...base,
    title: positionRect(base.title, width, height, positions?.title),
    subtitle: positionRect(base.subtitle, width, height, positions?.subtitle),
    device: positionRect(base.device, width, height, positions?.device),
  };
}

/**
 * 명시적 줄바꿈과 글자 폭을 고려해 문구를 나눕니다.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  measure: (value: string) => number,
): string[] {
  const lines: string[] = [];

  for (const paragraph of text.replace(/\r/g, '').split('\n')) {
    let line = '';

    for (const char of Array.from(paragraph)) {
      const next = line + char;
      const shouldWrapLine = line.length > 0 && measure(next) > maxWidth;

      if (shouldWrapLine) {
        lines.push(line.trimEnd());
        line = char.trimStart();
      } else {
        line = next;
      }
    }

    lines.push(line.trimEnd());
  }

  return lines;
}

/**
 * 모든 문구가 영역에 들어가는 가장 큰 글자 크기를 찾습니다.
 */
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
