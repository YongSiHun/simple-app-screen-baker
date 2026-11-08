import { PNG_SIGNATURE } from '../../../core/constants/imageFormats.ts';
import { PNG_CHUNK, CRC_TABLE } from '../constants/png.ts';
import type { RgbaPixels } from '../types/png';

/** CRC-32 산출 */
export function crc32(bytes: Uint8Array) {
  let checksum = 0xffffffff;

  for (const byte of bytes) {
    checksum = CRC_TABLE[(checksum ^ byte) & 255] ^ (checksum >>> 8);
  }

  return (checksum ^ 0xffffffff) >>> 0;
}

/** 타입·길이·CRC 포함 PNG 청크 생성 */
function chunk(type: string, data: Uint8Array) {
  const result = new Uint8Array(data.length + 12);
  const view = new DataView(result.buffer);
  view.setUint32(0, data.length);
  result.set(
    Array.from(type, (character) => character.charCodeAt(0)),
    4,
  );
  result.set(data, 8);
  view.setUint32(result.length - 4, crc32(result.subarray(4, -4)));

  return result;
}

/** 불투명 RGBA 픽셀 검증 */
function validatePixels(width: number, height: number, rgba: RgbaPixels) {
  const dimensions = [width, height];
  const validSize = dimensions.every(
    (size) => Number.isInteger(size) && size > 0,
  );
  const hasInvalidPixels = !validSize || rgba.length !== width * height * 4;

  if (hasInvalidPixels) {
    throw new Error('잘못된 픽셀 데이터입니다.');
  }
}

function createRgbScanlines(width: number, height: number, rgba: RgbaPixels) {
  validatePixels(width, height, rgba);
  const raw = new Uint8Array((width * 3 + 1) * height);
  let target = 1;
  let rowEnd = width * 4;

  for (let source = 0; source < rgba.length; source += 4) {
    const hasTransparency = rgba[source + 3] !== 255;

    if (hasTransparency) {
      throw new Error('출력에 투명 픽셀이 있습니다.');
    }

    raw[target++] = rgba[source];
    raw[target++] = rgba[source + 1];
    raw[target++] = rgba[source + 2];
    const isRowEnd = source + 4 === rowEnd;

    if (isRowEnd) {
      target++;
      rowEnd += width * 4;
    }
  }

  return raw;
}

/** 무손실 Deflate 압축 */
async function compressScanlines(raw: Uint8Array<ArrayBuffer>) {
  const isCompressionUnavailable = typeof CompressionStream === 'undefined';

  if (isCompressionUnavailable) {
    throw new Error(
      'PNG 출력은 최신 Chrome, Edge, Firefox, Safari에서 사용할 수 있습니다.',
    );
  }

  const stream = new Blob([raw])
    .stream()
    .pipeThrough(new CompressionStream('deflate'));

  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** 크기·RGB 형식 헤더 생성 */
function createHeader(width: number, height: number) {
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  header[8] = 8;
  header[9] = 2;

  return header;
}

/** 시그니처·청크 병합 */
function combineChunks(chunks: Uint8Array[]) {
  const length = chunks.reduce((total, part) => total + part.length, 0);
  const bytes = new Uint8Array(length);
  let offset = 0;

  for (const part of chunks) {
    bytes.set(part, offset);
    offset += part.length;
  }

  return bytes;
}

/** 검증된 RGB 24-bit PNG 인코딩 */
export async function encodeRgb(
  width: number,
  height: number,
  rgba: RgbaPixels,
) {
  const raw = createRgbScanlines(width, height, rgba);
  const compressed = await compressScanlines(raw);
  const bytes = combineChunks([
    PNG_SIGNATURE,
    chunk('IHDR', createHeader(width, height)),
    chunk('IDAT', compressed),
    chunk('IEND', new Uint8Array()),
  ]);
  verifyPng(bytes, width, height);

  return bytes;
}

/** PNG 시그니처·크기·RGB 검증 */
function validateHeader(
  bytes: Uint8Array,
  view: DataView,
  width: number,
  height: number,
) {
  const hasSignature = PNG_SIGNATURE.every(
    (byte, index) => bytes[index] === byte,
  );
  const hasInvalidLength = bytes.length < 33;

  if (hasInvalidLength) {
    throw new Error('PNG 규격 검증 실패: RGB 24-bit PNG가 아닙니다.');
  }

  const expectedFields = [
    [8, 13],
    [12, PNG_CHUNK.header],
    [16, width],
    [20, height],
  ];
  const fieldsMatch = expectedFields.every(
    ([offset, value]) => view.getUint32(offset) === value,
  );
  const hasInvalidHeader =
    !hasSignature || !fieldsMatch || bytes[24] !== 8 || bytes[25] !== 2;

  if (hasInvalidHeader) {
    throw new Error('PNG 규격 검증 실패: RGB 24-bit PNG가 아닙니다.');
  }
}

/** 청크 길이·CRC 검증·다음 위치 반환 */
function readChunk(bytes: Uint8Array, view: DataView, offset: number) {
  const length = view.getUint32(offset);
  const nextOffset = offset + length + 12;
  const exceedsFileLength = nextOffset > bytes.length;

  if (exceedsFileLength) {
    throw new Error('PNG 청크 길이 오류');
  }

  const type = view.getUint32(offset + 4);
  const expectedChecksum = crc32(
    bytes.subarray(offset + 4, offset + 8 + length),
  );
  const hasInvalidChecksum =
    view.getUint32(offset + 8 + length) !== expectedChecksum;

  if (hasInvalidChecksum) {
    throw new Error('PNG CRC 검증 실패');
  }

  const hasInvalidEnd = type === PNG_CHUNK.end && length !== 0;

  if (hasInvalidEnd) {
    throw new Error('PNG IEND 오류');
  }

  return { type, nextOffset };
}

/** IDAT·IEND·파일 완결성 검증 */
function validateChunks(bytes: Uint8Array, view: DataView) {
  let offset = 8;
  let hasImage = false;
  let hasEnd = false;

  while (offset + 12 <= bytes.length) {
    const current = readChunk(bytes, view, offset);
    hasImage ||= current.type === PNG_CHUNK.image;
    hasEnd ||= current.type === PNG_CHUNK.end;
    offset = current.nextOffset;
  }

  const isIncomplete = !hasImage || !hasEnd || offset !== bytes.length;

  if (isIncomplete) {
    throw new Error('불완전한 PNG 파일');
  }
}

/** PNG 헤더·청크 전체 검증 */
export function verifyPng(bytes: Uint8Array, width: number, height: number) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  validateHeader(bytes, view, width, height);
  validateChunks(bytes, view);

  return { width, height, bitDepth: 8, colorType: 2 };
}
