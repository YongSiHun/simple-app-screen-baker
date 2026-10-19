const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const PNG_CHUNK = { header: 0x49484452, image: 0x49444154, end: 0x49454e44 };

const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  let checksum = value;

  for (let bit = 0; bit < 8; bit++) {
    checksum = checksum & 1 ? 0xedb88320 ^ (checksum >>> 1) : checksum >>> 1;
  }

  return checksum >>> 0;
});

/**
 * PNG 청크 검증에 사용하는 CRC-32 체크섬을 계산합니다.
 */
export function crc32(bytes: Uint8Array) {
  let checksum = 0xffffffff;

  for (const byte of bytes) {
    checksum = crcTable[(checksum ^ byte) & 255] ^ (checksum >>> 8);
  }

  return (checksum ^ 0xffffffff) >>> 0;
}

/**
 * 타입·길이·체크섬을 포함하는 PNG 청크를 만듭니다.
 */
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

/**
 * 불투명 RGBA 픽셀을 PNG용 RGB 스캔라인으로 변환합니다.
 */
function createRgbScanlines(
  width: number,
  height: number,
  rgba: Uint8ClampedArray | Uint8Array,
) {
  const hasInvalidPixels =
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    rgba.length !== width * height * 4;

  if (hasInvalidPixels) {
    throw new Error('잘못된 픽셀 데이터입니다.');
  }

  const rowLength = width * 3 + 1;
  const raw = new Uint8Array(rowLength * height);

  for (let y = 0; y < height; y++) {
    let targetIndex = y * rowLength + 1;

    for (let x = 0; x < width; x++) {
      const sourceIndex = (y * width + x) * 4;
      const hasTransparency = rgba[sourceIndex + 3] !== 255;

      if (hasTransparency) {
        throw new Error('출력에 투명 픽셀이 있습니다.');
      }

      raw[targetIndex++] = rgba[sourceIndex];
      raw[targetIndex++] = rgba[sourceIndex + 1];
      raw[targetIndex++] = rgba[sourceIndex + 2];
    }
  }

  return raw;
}

/**
 * 브라우저의 무손실 압축으로 PNG 이미지 데이터를 만듭니다.
 */
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

/**
 * 이미지 크기와 RGB 형식을 담은 PNG 헤더를 만듭니다.
 */
function createHeader(width: number, height: number) {
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  header[8] = 8;
  header[9] = 2;

  return header;
}

/**
 * PNG 시그니처와 청크를 하나의 바이트 배열로 합칩니다.
 */
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

/**
 * RGB 픽셀을 검증된 24비트 PNG로 인코딩합니다.
 */
export async function encodeRgb(
  width: number,
  height: number,
  rgba: Uint8ClampedArray | Uint8Array,
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

/**
 * PNG 시그니처·출력 크기·색상 형식을 검사합니다.
 */
function validateHeader(
  bytes: Uint8Array,
  view: DataView,
  width: number,
  height: number,
) {
  const hasInvalidHeader =
    bytes.length < 33 ||
    !PNG_SIGNATURE.every((byte, index) => bytes[index] === byte) ||
    view.getUint32(8) !== 13 ||
    view.getUint32(12) !== PNG_CHUNK.header ||
    view.getUint32(16) !== width ||
    view.getUint32(20) !== height ||
    bytes[24] !== 8 ||
    bytes[25] !== 2;

  if (hasInvalidHeader) {
    throw new Error('PNG 규격 검증 실패: RGB 24-bit PNG가 아닙니다.');
  }
}

/**
 * 청크의 길이와 체크섬을 검증하고 다음 위치를 반환합니다.
 */
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

/**
 * 이미지 데이터와 종료 청크가 완전하게 존재하는지 검사합니다.
 */
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

/**
 * PNG 헤더와 전체 청크 구조를 검증합니다.
 */
export function verifyPng(bytes: Uint8Array, width: number, height: number) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  validateHeader(bytes, view, width, height);
  validateChunks(bytes, view);

  return { width, height, bitDepth: 8, colorType: 2 };
}
