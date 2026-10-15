// Browser-native, lossless RGB PNG encoding. No image is sent to a server.
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
export function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const b of bytes) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array) {
  const result = new Uint8Array(data.length + 12);
  const view = new DataView(result.buffer);
  view.setUint32(0, data.length);
  result.set(
    Array.from(type, (c) => c.charCodeAt(0)),
    4,
  );
  result.set(data, 8);
  view.setUint32(result.length - 4, crc32(result.subarray(4, -4)));
  return result;
}
export async function encodeRgb(
  width: number,
  height: number,
  rgba: Uint8ClampedArray | Uint8Array,
) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    rgba.length !== width * height * 4
  )
    throw new Error('잘못된 픽셀 데이터입니다.');
  const raw = new Uint8Array((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    let j = y * (width * 3 + 1) + 1;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (rgba[i + 3] !== 255) throw new Error('출력에 투명 픽셀이 있습니다.');
      raw[j++] = rgba[i];
      raw[j++] = rgba[i + 1];
      raw[j++] = rgba[i + 2];
    }
  }
  if (typeof CompressionStream === 'undefined')
    throw new Error(
      'PNG 출력은 최신 Chrome, Edge, Firefox, Safari에서 사용할 수 있습니다.',
    );
  const stream = new Blob([raw])
    .stream()
    .pipeThrough(new CompressionStream('deflate'));
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const chunks = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', new Uint8Array()),
  ];
  const png = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const part of chunks) {
    png.set(part, offset);
    offset += part.length;
  }
  verifyPng(png, width, height);
  return png;
}
export function verifyPng(bytes: Uint8Array, width: number, height: number) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (
    bytes.length < 33 ||
    !signature.every((b, i) => bytes[i] === b) ||
    v.getUint32(8) !== 13 ||
    v.getUint32(12) !== 0x49484452 ||
    v.getUint32(16) !== width ||
    v.getUint32(20) !== height ||
    bytes[24] !== 8 ||
    bytes[25] !== 2
  )
    throw new Error('PNG 규격 검증 실패: RGB 24-bit PNG가 아닙니다.');
  let offset = 8;
  let ended = false;
  let idat = false;
  while (offset + 12 <= bytes.length) {
    const length = v.getUint32(offset);
    if (offset + length + 12 > bytes.length)
      throw new Error('PNG 청크 길이 오류');
    const type = v.getUint32(offset + 4);
    if (
      v.getUint32(offset + 8 + length) !==
      crc32(bytes.subarray(offset + 4, offset + 8 + length))
    )
      throw new Error('PNG CRC 검증 실패');
    if (type === 0x49444154) idat = true;
    if (type === 0x49454e44) {
      if (length !== 0) throw new Error('PNG IEND 오류');
      ended = true;
    }
    offset += length + 12;
  }
  if (!idat || !ended || offset !== bytes.length)
    throw new Error('불완전한 PNG 파일');
  return { width, height, bitDepth: 8, colorType: 2 };
}
