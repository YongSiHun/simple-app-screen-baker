import { useEffect, useRef, useState } from 'react';
import type { ExportFormat } from '../../export/types/plan';
import type { Project, Slide, OutputPreset } from '../types/project';
import { downloadProject } from '../../export/services/download';
/**
 * 중복 다운로드를 막고 진행·완료·오류 상태를 관리합니다.
 */
export function useEditorDownload(
  project: Project,
  slide: Slide,
  preset: OutputPreset,
  uploading: boolean,
) {
  const downloadLock = useRef(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    const hasCompletion = Boolean(done);

    if (hasCompletion) {
      const timer = window.setTimeout(() => setDone(''), 5000);

      return () => window.clearTimeout(timer);
    }
  }, [done]);
  /**
   * 선택한 형식으로 현재 프로젝트의 이미지를 다운로드합니다.
   */
  async function download(format: ExportFormat) {
    const isBusy = downloadLock.current || uploading;

    if (isBusy) {
      return;
    }

    downloadLock.current = true;
    setExporting(true);
    setProgress('이미지 준비 중');
    setError('');
    setDone('');

    try {
      setDone(
        await downloadProject(format, {
          project,
          slide,
          preset,
          progress: setProgress,
        }),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : '다운로드에 실패했습니다.',
      );
    } finally {
      setProgress('');
      downloadLock.current = false;
      setExporting(false);
    }
  }

  return {
    progress,
    error,
    done,
    exporting,
    download,
    dismissDone: () => setDone(''),
  };
}
