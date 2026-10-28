import { encodeRgb } from '../../src/features/export/services/png.ts';

/** Create a real PNG while browser bitmap decoding is mocked in Node tests. */
export async function pngFile(name = 'image.png', width = 10, height = 20) {
  const rgba = new Uint8Array(width * height * 4).fill(255);
  const bytes = await encodeRgb(width, height, rgba);

  return new File([bytes], name, { type: 'image/png' });
}

/** Header-only fixture for rejecting huge dimensions before decoding. */
export function pngHeader(width, height) {
  const bytes = new Uint8Array(33);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(bytes.buffer);
  view.setUint32(8, 13);
  view.setUint32(12, 0x49484452);
  view.setUint32(16, width);
  view.setUint32(20, height);

  return new File([bytes], 'large.png', { type: 'image/png' });
}
