import { useEffect, useRef, useState } from 'react';
import type { DeviceKind } from '../types/project';
import { useProject } from '../store/useProject';
import { readScreenshots } from '../services/readScreenshots.ts';
import { MAX_UPLOAD_FILES } from '../constants/images.ts';
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
  const uploadController = useRef<AbortController | null>(null);
  useEffect(() => () => uploadController.current?.abort(), []);
  /**
   * 이미지를 슬라이드에 연결하고 업로드 리소스를 정리합니다.
   */
  async function upload(files: FileList | null) {
    const shouldSkipUpload =
      files === null || uploadController.current !== null;

    if (shouldSkipUpload) {
      return;
    }

    const exceedsBatchLimit = files.length > MAX_UPLOAD_FILES;

    if (exceedsBatchLimit) {
      setError('한 번에 최대 20장까지 업로드할 수 있습니다.');

      return;
    }

    const controller = new AbortController();
    uploadController.current = controller;
    setBusy(true);
    onUploading(true);
    setError('');

    try {
      const { ids, errors } = await readScreenshots(
        Array.from(files),
        controller.signal,
      );
      const isCancelled = controller.signal.aborted;

      if (isCancelled) {
        return;
      }

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
      uploadController.current = null;
      const isActive = !controller.signal.aborted;

      if (isActive) {
        setBusy(false);
        onUploading(false);
      }

      const inputElement = input.current;
      const hasInput = inputElement !== null;

      if (hasInput) {
        inputElement.value = '';
      }
    }
  }

  return { input, drag, setDrag, busy, error, upload };
}
