import type { DeviceKind, Slide } from '../types/project';

export function resolveSlideImage(
  slide: Pick<Slide, 'images'>,
  device: DeviceKind,
  hasImage: (id: string | undefined) => boolean = (id) => Boolean(id),
) {
  const candidates = new Set<DeviceKind>([device, 'phone', 'tablet', 'pc']);
  for (const kind of candidates) {
    const id = slide.images[kind];
    if (id && hasImage(id))
      return { id, device: kind, reused: kind !== device };
  }
  return undefined;
}
