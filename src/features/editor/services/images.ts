import type { DeviceKind, Slide } from '../types/project';
import { resolveSlideImage } from '../utils/resolveSlideImage.ts';

interface ImageResource {
  bitmap: ImageBitmap;
  url: string;
  file: File;
}
const resources = new Map<string, ImageResource>();
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
export async function loadImage(file: File): Promise<string> {
  const hasUnsupportedType = ![
    'image/png',
    'image/jpeg',
    'image/webp',
  ].includes(file.type);

  if (hasUnsupportedType) {
    throw new Error('PNG, JPEG, WebP 이미지만 사용할 수 있습니다.');
  }

  const exceedsFileLimit = file.size > 25 * 1024 * 1024;

  if (exceedsFileLimit) {
    throw new Error('이미지는 파일당 25MB 이하로 준비해주세요.');
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      file.name + ': 이미지를 읽을 수 없습니다. 다른 파일을 선택해주세요.',
    );
  }

  const exceedsPixelLimit = bitmap.width * bitmap.height > 40000000;

  if (exceedsPixelLimit) {
    bitmap.close();
    throw new Error('이미지가 너무 큽니다. 4천만 픽셀 이하로 준비해주세요.');
  }

  const id = crypto.randomUUID();
  resources.set(id, { bitmap, url: URL.createObjectURL(file), file });

  return id;
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
