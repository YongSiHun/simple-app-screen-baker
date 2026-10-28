import type { DeviceKind, Slide } from '../types/project';
import { resolveSlideImage } from '../utils/resolveSlideImage.ts';
import { imageDimensions } from './imageDimensions.ts';
import type { ImageResource } from '../types/images';
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_PIXELS,
  TOTAL_IMAGE_PIXELS,
  TOTAL_IMAGE_BYTES,
} from '../constants/images.ts';

const resources = new Map<string, ImageResource>();
let pendingPixels = 0;
let pendingBytes = 0;

function validateDimensions(width: number, height: number) {
  const isInvalid =
    width <= 0 || height <= 0 || width * height > MAX_IMAGE_PIXELS;

  if (isInvalid) {
    throw new Error('이미지가 너무 큽니다. 4천만 픽셀 이하로 준비해주세요.');
  }
}

function checkBudget(pixels: number, bytes: number) {
  let totalPixels = pendingPixels + pixels;
  let totalBytes = pendingBytes + bytes;

  for (const resource of resources.values()) {
    totalPixels += resource.bitmap.width * resource.bitmap.height;
    totalBytes += resource.bytes;
  }

  const exceedsBudget =
    totalPixels > TOTAL_IMAGE_PIXELS || totalBytes > TOTAL_IMAGE_BYTES;

  if (exceedsBudget) {
    throw new Error(
      '이미지 메모리 한도에 도달했습니다. 작업을 다운로드한 뒤 새로고침해주세요.',
    );
  }
}

/**
 * 이미지 식별자에 연결된 브라우저 리소스를 조회합니다.
 */
export function getImage(id: string | undefined) {
  return id ? resources.get(id) : undefined;
}

/**
 * 기기 전용 이미지 또는 재사용 가능한 원본을 조회합니다.
 */
export function getSlideImage(slide: Slide, device: DeviceKind) {
  const source = resolveSlideImage(slide, device, (id) =>
    Boolean(getImage(id)),
  );
  const image = getImage(source?.id);

  return source && image ? { ...source, ...image } : undefined;
}

/**
 * 파일 형식과 크기를 검사한 뒤 브라우저 이미지 리소스로 등록합니다.
 */
export async function loadImage(
  file: File,
  signal?: AbortSignal,
): Promise<string> {
  const hasUnsupportedType = !IMAGE_TYPES.includes(file.type);

  if (hasUnsupportedType) {
    throw new Error('PNG, JPEG, WebP 이미지만 사용할 수 있습니다.');
  }

  const exceedsFileLimit = file.size > MAX_IMAGE_BYTES;

  if (exceedsFileLimit) {
    throw new Error('이미지는 파일당 25MB 이하로 준비해주세요.');
  }

  signal?.throwIfAborted();
  const { width, height } = imageDimensions(
    new Uint8Array(await file.arrayBuffer()),
    file.type,
  );
  validateDimensions(width, height);
  signal?.throwIfAborted();
  const pixels = width * height;
  checkBudget(pixels, file.size);
  pendingPixels += pixels;
  pendingBytes += file.size;
  let bitmap: ImageBitmap | undefined;

  try {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new Error(
        file.name + ': 이미지를 읽을 수 없습니다. 다른 파일을 선택해주세요.',
      );
    }

    signal?.throwIfAborted();
    validateDimensions(bitmap.width, bitmap.height);
    checkBudget(bitmap.width * bitmap.height - pixels, 0);
    const id = crypto.randomUUID();
    resources.set(id, {
      bitmap,
      url: URL.createObjectURL(file),
      bytes: file.size,
    });
    bitmap = undefined;

    return id;
  } finally {
    bitmap?.close();
    pendingPixels -= pixels;
    pendingBytes -= file.size;
  }
}

/**
 * 참조가 끝난 이미지 비트맵과 임시 URL을 해제합니다.
 */
export function releaseUnused(used: Set<string>) {
  for (const [id, resource] of resources) {
    const isUsedImage = used.has(id);

    if (isUsedImage) {
      continue;
    }

    resource.bitmap.close();
    URL.revokeObjectURL(resource.url);
    resources.delete(id);
  }
}
