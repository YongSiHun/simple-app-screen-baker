import { createId } from '../../../core/utils/createId.ts';
import { TOTAL_IMAGE_PIXELS, TOTAL_IMAGE_BYTES } from '../constants/images.ts';
import type { ImageResource } from '../types/images';

export interface ImageRepository {
  get(id: string | undefined): ImageResource | undefined;
  reserve(pixels: number, bytes: number): () => void;
  register(bitmap: ImageBitmap, file: File, reservedPixels: number): string;
  releaseUnused(used: Set<string>): void;
}

/** 비트맵·URL 수명 관리 · 보관/예약 메모리 O(1) 집계 */
export function createImageRepository(): ImageRepository {
  const resources = new Map<string, ImageResource>();
  let pixels = 0;
  let bytes = 0;

  function checkBudget(extraPixels: number, extraBytes: number) {
    const exceedsBudget =
      pixels + extraPixels > TOTAL_IMAGE_PIXELS ||
      bytes + extraBytes > TOTAL_IMAGE_BYTES;

    if (exceedsBudget) {
      throw new Error(
        '이미지 메모리 한도에 도달했습니다. 작업을 다운로드한 뒤 새로고침해주세요.',
      );
    }
  }

  function reserve(extraPixels: number, extraBytes: number) {
    checkBudget(extraPixels, extraBytes);
    pixels += extraPixels;
    bytes += extraBytes;

    return () => {
      pixels -= extraPixels;
      bytes -= extraBytes;
    };
  }

  function register(bitmap: ImageBitmap, file: File, reservedPixels: number) {
    const retainedPixels = bitmap.width * bitmap.height;
    checkBudget(retainedPixels - reservedPixels, 0);
    const id = createId();
    const url = URL.createObjectURL(file);
    resources.set(id, { bitmap, url, bytes: file.size });
    pixels += retainedPixels;
    bytes += file.size;

    return id;
  }

  function releaseUnused(used: Set<string>) {
    for (const [id, resource] of resources) {
      const isUsed = used.has(id);

      if (isUsed) {
        continue;
      }

      pixels -= resource.bitmap.width * resource.bitmap.height;
      bytes -= resource.bytes;
      resource.bitmap.close();
      URL.revokeObjectURL(resource.url);
      resources.delete(id);
    }
  }

  return {
    get: (id) => resources.get(id ?? ''),
    reserve,
    register,
    releaseUnused,
  };
}

export const imageRepository = createImageRepository();
