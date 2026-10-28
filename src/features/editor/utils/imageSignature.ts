import type { ImageSignature } from '../../../core/types/images';

export function matchesSignature(
  bytes: Uint8Array,
  offset: number,
  signature: ImageSignature,
) {
  return signature.every((value, index) => bytes[offset + index] === value);
}
