interface ImageResource {
  bitmap: ImageBitmap;
  url: string;
  file: File;
}
const resources = new Map<string, ImageResource>();
export function getImage(id: string | undefined) {
  return id ? resources.get(id) : undefined;
}
export async function loadImage(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    throw new Error('PNG, JPEG, WebP 이미지만 사용할 수 있습니다.');
  if (file.size > 25 * 1024 * 1024)
    throw new Error('이미지는 파일당 25MB 이하로 준비해주세요.');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      file.name + ': 이미지를 읽을 수 없습니다. 다른 파일을 선택해주세요.',
    );
  }
  if (bitmap.width * bitmap.height > 40000000) {
    bitmap.close();
    throw new Error('이미지가 너무 큽니다. 4천만 픽셀 이하로 준비해주세요.');
  }
  const id = crypto.randomUUID();
  resources.set(id, { bitmap, url: URL.createObjectURL(file), file });
  return id;
}
export function releaseUnused(used: Set<string>) {
  for (const [id, r] of resources)
    if (!used.has(id)) {
      r.bitmap.close();
      URL.revokeObjectURL(r.url);
      resources.delete(id);
    }
}
