import {
  RIFF_SIGNATURE,
  WEBP_SIGNATURE,
  VP8_FRAME_SIGNATURE,
  WEBP_CHUNKS,
} from '../../../core/constants/imageFormats.ts';
import type { ImageHeader, WebpChunk } from '../types/images';
import type { ImageSize } from '../../../core/types/images';
import { matchesSignature } from './imageSignature.ts';

function readChunk(
  { bytes, view }: ImageHeader,
  offset: number,
): WebpChunk | undefined {
  const type = view.getUint32(offset);
  const length = view.getUint32(offset + 4, true);
  const dataOffset = offset + 8;
  const isInvalidLength = dataOffset + length > bytes.length;

  if (isInvalidLength) {
    return;
  }

  return {
    type,
    length,
    dataOffset,
    nextOffset: dataOffset + length + (length % 2),
  };
}

function chunkDimensions(
  { bytes, view }: ImageHeader,
  chunk: WebpChunk,
): ImageSize | undefined {
  const { type, length, dataOffset: data } = chunk;
  const isExtended = type === WEBP_CHUNKS.extended && length >= 10;

  if (isExtended) {
    return {
      width:
        1 + bytes[data + 4] + (bytes[data + 5] << 8) + (bytes[data + 6] << 16),
      height:
        1 + bytes[data + 7] + (bytes[data + 8] << 8) + (bytes[data + 9] << 16),
    };
  }

  const isLossless =
    type === WEBP_CHUNKS.lossless && length >= 5 && bytes[data] === 0x2f;

  if (isLossless) {
    const bits = view.getUint32(data + 1, true);

    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }

  const isLossy =
    type === WEBP_CHUNKS.lossy &&
    length >= 10 &&
    matchesSignature(bytes, data + 3, VP8_FRAME_SIGNATURE);

  if (isLossy) {
    return {
      width: view.getUint16(data + 6, true) & 0x3fff,
      height: view.getUint16(data + 8, true) & 0x3fff,
    };
  }
}

export function webpDimensions(header: ImageHeader): ImageSize | undefined {
  const { bytes, view } = header;
  const isValidWebp =
    bytes.length >= 20 &&
    matchesSignature(bytes, 0, RIFF_SIGNATURE) &&
    matchesSignature(bytes, 8, WEBP_SIGNATURE) &&
    view.getUint32(4, true) + 8 === bytes.length;
  const isInvalidWebp = !isValidWebp;

  if (isInvalidWebp) {
    return;
  }

  let offset = 12;

  while (offset + 8 <= bytes.length) {
    const chunk = readChunk(header, offset);
    const hasNoChunk = chunk === undefined;

    if (hasNoChunk) {
      return;
    }

    const dimensions = chunkDimensions(header, chunk);
    const hasDimensions = dimensions !== undefined;

    if (hasDimensions) {
      return dimensions;
    }

    offset = chunk.nextOffset;
  }
}
