import { useEffect, useRef, useState } from 'react';
import type { DeviceKind } from '../types/project';
import { useProject } from '../store/useProject';
import { readScreenshots } from '../services/readScreenshots.ts';
import { MAX_UPLOAD_FILES } from '../constants/images.ts';
/** 업로드 입력·드래그·진행·오류 상태 */
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
  /** 슬라이드 이미지 연결·리소스 해제 */
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
      const result = await readScreenshots(
        Array.from(files),
        controller.signal,
      );
      const isCancelled = controller.signal.aborted;

      if (isCancelled) {
        return;
      }

      attach(result.ids, kind);
      setError(result.errors.join(' '));
    } finally {
      useProject.getState().collectImages();
      uploadController.current = null;
      resetUpload(controller.signal);
    }
  }

  function resetUpload(signal: AbortSignal) {
    const inputElement = input.current;
    const hasInput = inputElement !== null;

    if (hasInput) {
      inputElement.value = '';
    }

    const isCancelled = signal.aborted;

    if (isCancelled) {
      return;
    }

    setBusy(false);
    onUploading(false);
  }

  return { input, drag, setDrag, busy, error, upload };
}
