import type {
  OutputPreset,
  ProjectDesign,
  Slide,
} from '../../editor/types/project';
import { drawDevice } from './drawDevice.ts';
import { fitText } from '../utils/layout.ts';
import type { Rect } from '../types/layout';
import { ensureFont } from '../data/fonts.ts';
export { ensureFont } from '../data/fonts.ts';
/** 문구 줄바꿈·크기 맞춤 렌더 */
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: Rect,
  max: number,
  weight: number,
  color: string,
  center: boolean,
) {
  const isEmptyText = !text.trim();

  if (isEmptyText) {
    return;
  }

  const fitted = fitText(text, box, max, max * 0.3, (t, s) => {
    ctx.font = weight + ' ' + s + 'px Pretendard';

    return ctx.measureText(t).width;
  });
  ctx.font = weight + ' ' + fitted.size + 'px Pretendard';
  ctx.fillStyle = color;
  ctx.textAlign = center ? 'center' : 'left';
  ctx.textBaseline = 'top';
  fitted.lines.forEach((line, i) =>
    ctx.fillText(
      line,
      center ? box.x + box.width / 2 : box.x,
      box.y + i * fitted.size * 1.25,
    ),
  );
}

/** 배경·기기·문구 → 프리뷰/DL 렌더 */
export async function render(
  canvas: HTMLCanvasElement,
  preset: OutputPreset,
  design: ProjectDesign,
  slide: Slide,
  preview = false,
  previewZoom = 1,
  signal?: AbortSignal,
) {
  signal?.throwIfAborted();
  await ensureFont();
  signal?.throwIfAborted();
  const scale = preview
    ? Math.min(1, (1000 * previewZoom) / Math.max(preset.width, preset.height))
    : 1;
  canvas.width = Math.round(preset.width * scale);
  canvas.height = Math.round(preset.height * scale);
  const ctx = canvas.getContext('2d', { alpha: false });
  const hasNoContext = !ctx;

  if (hasNoContext) {
    throw new Error('Canvas를 사용할 수 없는 브라우저입니다.');
  }

  ctx.scale(scale, scale);
  const w = preset.width,
    h = preset.height;
  ctx.fillStyle = design.background;
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const l = drawDevice(ctx, preset, design, slide);
  drawText(
    ctx,
    slide.title,
    l.title,
    w * (l.landscape ? 0.041 : 0.075),
    design.weight,
    design.textColor,
    !l.landscape,
  );
  drawText(
    ctx,
    slide.subtitle,
    l.subtitle,
    w * (l.landscape ? 0.018 : 0.033),
    600,
    design.textColor,
    !l.landscape,
  );

  return canvas;
}
