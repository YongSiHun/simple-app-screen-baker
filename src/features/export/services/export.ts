import type { OutputPreset, Project, Slide } from '../../editor/types/project';
import { getImage, getSlideImage } from '../../editor/services/images.ts';
import { render } from '../../rendering/services/render.ts';
import { validatePreset } from '../utils/validatePreset.ts';
import { encodeRgb } from '../data/png.ts';
import { createExportPlan } from './plan.ts';
import { save } from '../data/browserDownload.ts';
export { save } from '../data/browserDownload.ts';
/** 디자인·슬라이드 → 원본 크기 RGB PNG */
export async function png(
  project: Project,
  slide: Slide,
  preset: OutputPreset,
) {
  const hasInvalidPreset = !validatePreset(preset);

  if (hasInvalidPreset) {
    throw new Error('지원하지 않는 출력 규격입니다.');
  }

  const hasNoScreenshot = !getSlideImage(slide, preset.device);

  if (hasNoScreenshot) {
    throw new Error('이 슬라이드에 스크린샷을 업로드해주세요.');
  }

  const canvas = document.createElement('canvas');

  try {
    await render(canvas, preset, project.design, slide);
    const ctx = canvas.getContext('2d');
    const hasNoContext = !ctx;

    if (hasNoContext) {
      throw new Error('Canvas 오류');
    }

    return await encodeRgb(
      canvas.width,
      canvas.height,
      ctx.getImageData(0, 0, canvas.width, canvas.height).data,
    );
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

/** 현재 기기 슬라이드 → 순차 ZIP · 폴더 제외 */
export async function exportZip(
  project: Project,
  preset: OutputPreset,
  progress: (value: string) => void,
) {
  const { jobs, missing } = createExportPlan(project.slides, [preset], (id) =>
    Boolean(getImage(id)),
  );
  const hasNoExportJobs = jobs.length === 0;

  if (hasNoExportJobs) {
    throw new Error('현재 기기에 사용할 스크린샷을 업로드해주세요.');
  }

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  for (let i = 0; i < jobs.length; i++) {
    const { preset, slide } = jobs[i];
    progress('이미지 생성 ' + (i + 1) + ' / ' + jobs.length);
    await new Promise<void>((r) => setTimeout(r, 0));
    const bytes = await png(project, slide, preset);
    zip.file(String(i + 1) + '.png', bytes);
  }

  progress('ZIP 파일 묶는 중');
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'STORE' },
    (m) => progress('ZIP ' + Math.round(m.percent) + '%'),
  );
  save(blob, 'screenbaker-' + preset.folder + '.zip');

  return missing;
}
