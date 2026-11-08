import type { DeviceKind, Slide } from '../types/project';

/** 기기 전용 우선 · 가용 원본 폴백 */
export function resolveSlideImage(
  slide: Pick<Slide, 'images'>,
  device: DeviceKind,
  hasImage: (id: string | undefined) => boolean = (id) => Boolean(id),
) {
  const candidates = new Set<DeviceKind>([device, 'phone', 'tablet', 'pc']);

  for (const kind of candidates) {
    const id = slide.images[kind];
    const hasUsableImage = id !== undefined && hasImage(id);

    if (hasUsableImage) {
      return { id, device: kind, reused: kind !== device };
    }
  }

  return undefined;
}
