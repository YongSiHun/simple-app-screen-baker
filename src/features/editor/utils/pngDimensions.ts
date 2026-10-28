import { PNG_SIGNATURE } from '../../../core/constants/imageFormats.ts';
import type { ImageHeader } from '../types/images';
import type { ImageSize } from '../../../core/types/images';
import { matchesSignature } from './imageSignature.ts';

export function pngDimensions({
  bytes,
  view,
}: ImageHeader): ImageSize | undefined {
  const isPng =
    bytes.length >= 33 &&
    matchesSignature(bytes, 0, PNG_SIGNATURE) &&
    view.getUint32(8) === 13 &&
    view.getUint32(12) === 0x49484452;
  const isInvalidPng = !isPng;

  if (isInvalidPng) {
    return;
  }

  return { width: view.getUint32(16), height: view.getUint32(20) };
}
