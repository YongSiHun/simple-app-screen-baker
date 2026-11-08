import {
  JPEG_SIGNATURE,
  JPEG_FRAME_MARKERS,
} from '../../../core/constants/imageFormats.ts';
import type { ImageHeader, JpegSegment } from '../types/images';
import type { ImageSize } from '../../../core/types/images';
import { matchesSignature } from './imageSignature.ts';

/** Read a bounded JPEG segment without touching compressed image data. */
function readSegment(
  { bytes, view }: ImageHeader,
  offset: number,
): JpegSegment | undefined {
  const isInvalidMarker = bytes[offset] !== 255;

  if (isInvalidMarker) {
    return;
  }

  while (bytes[offset] === 255) {
    offset++;
  }

  const marker = bytes[offset++];
  const isTerminal = marker === 0xda || marker === 0xd9;

  if (isTerminal) {
    return;
  }

  const isStandalone = isStandaloneMarker(marker);

  if (isStandalone) {
    return { marker, length: 0, dataOffset: offset, nextOffset: offset };
  }

  return readSizedSegment({ bytes, view }, marker, offset);
}

function readSizedSegment(
  { bytes, view }: ImageHeader,
  marker: number,
  offset: number,
): JpegSegment | undefined {
  const isMissingLength = offset + 2 > bytes.length;

  if (isMissingLength) {
    return;
  }

  const length = view.getUint16(offset);
  const isInvalidLength = length < 2 || offset + length > bytes.length;

  if (isInvalidLength) {
    return;
  }

  return { marker, length, dataOffset: offset, nextOffset: offset + length };
}

export function jpegDimensions(header: ImageHeader): ImageSize | undefined {
  const isInvalidJpeg = !matchesSignature(header.bytes, 0, JPEG_SIGNATURE);

  if (isInvalidJpeg) {
    return;
  }

  return readFrames(header);
}

function frameDimensions(
  header: ImageHeader,
  segment: JpegSegment,
): ImageSize | undefined {
  const isFrame = JPEG_FRAME_MARKERS.has(segment.marker) && segment.length >= 8;

  if (isFrame) {
    return {
      width: header.view.getUint16(segment.dataOffset + 5),
      height: header.view.getUint16(segment.dataOffset + 3),
    };
  }
}

function readFrames(header: ImageHeader): ImageSize | undefined {
  let offset = 2;

  while (offset + 4 <= header.bytes.length) {
    const segment = readSegment(header, offset);
    const hasNoSegment = segment === undefined;

    if (hasNoSegment) {
      return;
    }

    const dimensions = frameDimensions(header, segment);
    const hasDimensions = dimensions !== undefined;

    if (hasDimensions) {
      return dimensions;
    }

    offset = segment.nextOffset;
  }
}

function isStandaloneMarker(marker: number) {
  return marker === 1 || (marker >= 0xd0 && marker <= 0xd7);
}
