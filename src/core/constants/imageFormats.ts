export const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
export const JPEG_SIGNATURE = [255, 216];
export const RIFF_SIGNATURE = [82, 73, 70, 70];
export const WEBP_SIGNATURE = [87, 69, 66, 80];
export const VP8_FRAME_SIGNATURE = [0x9d, 0x01, 0x2a];
export const JPEG_FRAME_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);
export const WEBP_CHUNKS = {
  extended: 0x56503858,
  lossless: 0x5650384c,
  lossy: 0x56503820,
};
