import { useRef, useState } from 'react';
import type { DeviceKind } from '../types/project';
import { useProject } from '../store/useProject';
import { loadImage } from '../services/images';
/**
 * 선택한 파일을 차례로 읽고 성공한 이미지와 오류를 모읍니다.
 */
async function readScreenshots(files: File[]) {
  const ids: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      ids.push(await loadImage(file));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : '업로드 오류');
    }
  }

  return { ids, errors };
}

/**
 * 업로드 입력과 드래그·진행·오류 상태를 관리합니다.
 */
export function useScreenshotUpload(
  kind: DeviceKind,
  onUploading: (busy: boolean) => void,
) {
  const attach = useProject((state) => state.attach);
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  /**
   * 이미지를 슬라이드에 연결하고 업로드 리소스를 정리합니다.
   */
  async function upload(files: FileList | null) {
    const shouldSkipUpload = files === null || busy;

    if (shouldSkipUpload) {
      return;
    }

    setBusy(true);
    onUploading(true);
    setError('');

    try {
      const { ids, errors } = await readScreenshots(Array.from(files));
      const hasUploadedImages = ids.length > 0;
      const hasUploadErrors = errors.length > 0;

      if (hasUploadedImages) {
        attach(ids, kind);
      }

      if (hasUploadErrors) {
        setError(errors.join(' '));
      }
    } finally {
      useProject.getState().collectImages();
      setBusy(false);
      onUploading(false);
      const inputElement = input.current;
      const hasInput = inputElement !== null;

      if (hasInput) {
        inputElement.value = '';
      }
    }
  }

  return { input, drag, setDrag, busy, error, upload };
}
