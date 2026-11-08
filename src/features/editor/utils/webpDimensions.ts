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

type ChunkReader = (
  header: ImageHeader,
  chunk: WebpChunk,
) => ImageSize | undefined;

const readExtended: ChunkReader = ({ bytes }, { length, dataOffset: data }) => {
  const isTruncated = length < 10;

  if (isTruncated) {
    return;
  }

  return {
    width:
      1 + bytes[data + 4] + (bytes[data + 5] << 8) + (bytes[data + 6] << 16),
    height:
      1 + bytes[data + 7] + (bytes[data + 8] << 8) + (bytes[data + 9] << 16),
  };
};

const readLossless: ChunkReader = (
  { bytes, view },
  { length, dataOffset: data },
) => {
  const isInvalid = length < 5 || bytes[data] !== 0x2f;

  if (isInvalid) {
    return;
  }

  const bits = view.getUint32(data + 1, true);

  return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
};

const readLossy: ChunkReader = (
  { bytes, view },
  { length, dataOffset: data },
) => {
  const isInvalid =
    length < 10 || !matchesSignature(bytes, data + 3, VP8_FRAME_SIGNATURE);

  if (isInvalid) {
    return;
  }

  return {
    width: view.getUint16(data + 6, true) & 0x3fff,
    height: view.getUint16(data + 8, true) & 0x3fff,
  };
};

const chunkReaders = new Map<number, ChunkReader>([
  [WEBP_CHUNKS.extended, readExtended],
  [WEBP_CHUNKS.lossless, readLossless],
  [WEBP_CHUNKS.lossy, readLossy],
]);

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

  return readChunks(header);
}

function readChunks(header: ImageHeader): ImageSize | undefined {
  const { bytes } = header;
  let offset = 12;

  while (offset + 8 <= bytes.length) {
    const chunk = readChunk(header, offset);
    const hasNoChunk = chunk === undefined;

    if (hasNoChunk) {
      return;
    }

    const dimensions = chunkReaders.get(chunk.type)?.(header, chunk);
    const hasDimensions = dimensions !== undefined;

    if (hasDimensions) {
      return dimensions;
    }

    offset = chunk.nextOffset;
  }
}
