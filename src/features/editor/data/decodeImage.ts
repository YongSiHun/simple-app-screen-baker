/** 브라우저 디코더 · 형식/손상 오류 정규화 */
export async function decodeImage(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error(
      file.name + ': 이미지를 읽을 수 없습니다. 다른 파일을 선택해주세요.',
    );
  }
}
