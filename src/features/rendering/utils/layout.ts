import type { DeviceKind, TemplateId } from '../../editor/types/project';
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export function contain(sw: number, sh: number, box: Rect): Rect {
  const scale = Math.min(box.width / sw, box.height / sh);
  return {
    x: box.x + (box.width - sw * scale) / 2,
    y: box.y + (box.height - sh * scale) / 2,
    width: sw * scale,
    height: sh * scale,
  };
}
export function layout(
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
      if (line && measure(next) > maxWidth) {
        lines.push(line.trimEnd());
        line = char.trimStart();
      } else line = next;
    }
    lines.push(line.trimEnd());
  }
  return lines;
}
export function fitText(
  text: string,
  box: Rect,
  maxSize: number,
  minSize: number,
  measure: (text: string, size: number) => number,
) {
  for (let size = maxSize; size >= minSize; size -= 1) {
    const lines = wrapText(text, box.width, (t) => measure(t, size));
    if (
      lines.length * size * 1.25 <= box.height &&
      lines.every((line) => measure(line, size) <= box.width)
    )
      return { size, lines };
  }
  throw new Error('문구가 너무 깁니다. 제목 또는 부제목을 줄여주세요.');
}
