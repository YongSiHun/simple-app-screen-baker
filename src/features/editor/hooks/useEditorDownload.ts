import { useRef, useState } from 'react';
import type { Project, Slide, OutputPreset } from '../types/project';
import { exportZip, png, save } from '../../export/services/export';
/**
 * 현재 슬라이드를 PNG로 렌더링해 저장합니다.
 */
async function downloadPng(
  project: Project,
  slide: Slide,
  preset: OutputPreset,
) {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const bytes = await png(project, slide, preset);
  const index = project.slides.findIndex((item) => item.id === slide.id) + 1;
  const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
  save(blob, String(index) + '.png');
}

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
  /**
   * 선택한 형식으로 현재 프로젝트의 이미지를 다운로드합니다.
   */
  async function download(format: 'zip' | 'png') {
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
      const isZip = format === 'zip';

      if (isZip) {
        const skipped = await exportZip(project, preset, setProgress);
        setDone(
          'ZIP 다운로드 완료' +
            (skipped ? ' · 이미지 없는 슬라이드 ' + skipped + '개 제외' : ''),
        );

        return;
      }

      await downloadPng(project, slide, preset);
      setDone('현재 슬라이드 PNG 다운로드 완료');
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

  return { progress, error, done, exporting, download };
}
