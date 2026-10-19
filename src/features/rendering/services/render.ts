import type {
  OutputPreset,
  ProjectDesign,
  Slide,
} from '../../editor/types/project';
import { drawDevice } from './drawDevice.ts';
import { fitText, type Rect } from '../utils/layout.ts';
let fontPromise: Promise<void> | undefined;
/**
 * 렌더링에 필요한 글꼴을 한 번만 읽고 준비 상태를 확인합니다.
 */
export function ensureFont() {
  fontPromise ??= (async () => {
    await Promise.all([
      document.fonts.load('600 32px Pretendard', '앱 스크린샷'),
      document.fonts.load('800 32px Pretendard', '앱 스크린샷'),
    ]);
    const isFontUnavailable = !document.fonts.check('800 32px Pretendard');

    if (isFontUnavailable) {
      throw new Error(
        'Pretendard 폰트를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.',
      );
    }
  })();

  return fontPromise;
}

/**
 * 문구를 영역에 맞게 줄바꿈하고 크기를 조절해 그립니다.
 */
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

/**
 * 배경·기기·문구를 미리보기 또는 다운로드 해상도로 그립니다.
 */
export async function render(
  canvas: HTMLCanvasElement,
  preset: OutputPreset,
  design: ProjectDesign,
  slide: Slide,
  preview = false,
  previewZoom = 1,
) {
  await ensureFont();
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
