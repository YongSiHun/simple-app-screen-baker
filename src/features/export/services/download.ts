import type { Project, Slide, OutputPreset } from '../../editor/types/project';
import type { ExportFormat } from '../types/plan';
import { exportZip, png } from './export.ts';
import { save } from '../data/browserDownload.ts';

type DownloadContext = {
  project: Project;
  slide: Slide;
  preset: OutputPreset;
  progress: (value: string) => void;
};
type DownloadHandler = (context: DownloadContext) => Promise<string>;

async function downloadPng({ project, slide, preset }: DownloadContext) {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const bytes = await png(project, slide, preset);
  const index = project.slides.findIndex((item) => item.id === slide.id) + 1;
  save(
    new Blob([new Uint8Array(bytes)], { type: 'image/png' }),
    String(index) + '.png',
  );

  return '현재 슬라이드 PNG 다운로드 완료';
}

async function downloadZip({ project, preset, progress }: DownloadContext) {
  const skipped = await exportZip(project, preset, progress);
  const notice = skipped
    ? ' · 이미지 없는 슬라이드 ' + skipped + '개 제외'
    : '';

  return 'ZIP 다운로드 완료' + notice;
}

/** 형식별 핸들러 등록 · UI 분기 제외 */
const downloadHandlers: Record<ExportFormat, DownloadHandler> = {
  png: downloadPng,
  zip: downloadZip,
};

export function downloadProject(
  format: ExportFormat,
  context: DownloadContext,
) {
  return downloadHandlers[format](context);
}
