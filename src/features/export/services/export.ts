import JSZip from 'jszip';
import type { OutputPreset, Project, Slide } from '../../editor/types/project';
import { getImage } from '../../editor/services/images';
import { render } from '../../rendering/services/render';
import { validatePreset } from '../constants/presets';
import { encodeRgb } from './png';
export async function png(
  project: Project,
  slide: Slide,
  preset: OutputPreset,
) {
  if (!validatePreset(preset))
    throw new Error('지원하지 않는 출력 규격입니다.');
  if (!getImage(slide.images[preset.device]))
    throw new Error(preset.label + '용 원본 이미지를 업로드해주세요.');
  const canvas = document.createElement('canvas');
  try {
    await render(canvas, preset, project.design, slide);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 오류');
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
export function save(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export async function exportZip(
  project: Project,
  presets: OutputPreset[],
  progress: (value: string) => void,
) {
  const jobs = presets
    .flatMap((preset) =>
      project.slides.map((slide, index) => ({ preset, slide, index })),
    )
    .filter((j) => getImage(j.slide.images[j.preset.device]));
  if (!jobs.length)
    throw new Error('선택한 규격에 사용할 원본 이미지가 없습니다.');
  const zip = new JSZip();
  for (let i = 0; i < jobs.length; i++) {
    const { preset, slide, index } = jobs[i];
    progress('이미지 생성 ' + (i + 1) + ' / ' + jobs.length);
    await new Promise<void>((r) => setTimeout(r, 0));
    const bytes = await png(project, slide, preset);
    zip.file(
      preset.platform +
        '/' +
        preset.folder +
        '/screenshot-' +
        String(index + 1).padStart(2, '0') +
        '.png',
      bytes,
    );
  }
  progress('ZIP 파일 묶는 중');
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'STORE' },
    (m: { percent: number }) => progress('ZIP ' + Math.round(m.percent) + '%'),
  );
  save(blob, 'screenbaker-screenshots.zip');
  return presets.length * project.slides.length - jobs.length;
}
