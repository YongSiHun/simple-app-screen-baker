import type { DeviceKind, Slide } from '../types/project';
import { resolveSlideImage } from '../utils/resolveSlideImage.ts';
import { imageDimensions } from './imageDimensions.ts';
import { imageRepository } from '../data/imageRepository.ts';
import type { ImageRepository } from '../data/imageRepository.ts';
import { decodeImage } from '../data/decodeImage.ts';
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_PIXELS,
} from '../constants/images.ts';

function validateDimensions(width: number, height: number) {
  const isInvalid =
    width <= 0 || height <= 0 || width * height > MAX_IMAGE_PIXELS;

  if (isInvalid) {
    throw new Error('이미지가 너무 큽니다. 4천만 픽셀 이하로 준비해주세요.');
  }
}

function validateFile(file: File) {
  const hasUnsupportedType = !IMAGE_TYPES.includes(file.type);

  if (hasUnsupportedType) {
    throw new Error('PNG, JPEG, WebP 이미지만 사용할 수 있습니다.');
  }

  const exceedsFileLimit = file.size > MAX_IMAGE_BYTES;

  if (exceedsFileLimit) {
    throw new Error('이미지는 파일당 25MB 이하로 준비해주세요.');
  }
}

/** 이미지 서비스 · 저장소/디코더 포트 주입 */
export function createImageService(
  repository: ImageRepository,
  decode = decodeImage,
) {
  function getImage(id: string | undefined) {
    return repository.get(id);
  }

  function getSlideImage(slide: Pick<Slide, 'images'>, device: DeviceKind) {
    const source = resolveSlideImage(slide, device, (id) =>
      Boolean(getImage(id)),
    );
    const image = getImage(source?.id);

    return source && image ? { ...source, ...image } : undefined;
  }

  async function loadImage(file: File, signal?: AbortSignal): Promise<string> {
    validateFile(file);
    signal?.throwIfAborted();
    const { width, height } = imageDimensions(
      new Uint8Array(await file.arrayBuffer()),
      file.type,
    );
    validateDimensions(width, height);
    signal?.throwIfAborted();
    const releaseReservation = repository.reserve(width * height, file.size);
    let bitmap: ImageBitmap | undefined;

    try {
      bitmap = await decode(file);
      signal?.throwIfAborted();
      validateDimensions(bitmap.width, bitmap.height);
      const id = repository.register(bitmap, file, width * height);
      bitmap = undefined;

      return id;
    } finally {
      bitmap?.close();
      releaseReservation();
    }
  }

  return {
    getImage,
    getSlideImage,
    loadImage,
    releaseUnused: repository.releaseUnused,
  };
}

export const { getImage, getSlideImage, loadImage, releaseUnused } =
  createImageService(imageRepository);
