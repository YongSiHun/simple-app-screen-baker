import { IMAGE_DIMENSION_READERS } from '../constants/imageReaders.ts';
import type { ImageSize } from '../../../core/types/images';

/** 디코딩 전 래스터 헤더 검증 */
export function imageDimensions(bytes: Uint8Array, type: string): ImageSize {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const readDimensions = IMAGE_DIMENSION_READERS.get(type);
  const dimensions = readDimensions?.({ bytes, view });
  const hasInvalidHeader = dimensions === undefined;

  if (hasInvalidHeader) {
    throw new Error('이미지 형식 또는 헤더가 올바르지 않습니다.');
  }

  return dimensions;
}
