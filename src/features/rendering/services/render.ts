import type {
  OutputPreset,
  ProjectDesign,
  Slide,
} from '../../editor/types/project';
import { getImage } from '../../editor/services/images';
import { contain, fitText, layout, type Rect } from '../utils/layout';
let fontPromise: Promise<void> | undefined;
export function ensureFont() {
  fontPromise ??= (async () => {
    await Promise.all([
      document.fonts.load('600 32px Pretendard', '앱 스크린샷'),
      document.fonts.load('800 32px Pretendard', '앱 스크린샷'),
    ]);
    if (!document.fonts.check('800 32px Pretendard'))
      throw new Error(
        'Pretendard 폰트를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.',
      );
  })();
  return fontPromise;
}
function rounded(
  ctx: CanvasRenderingContext2D,
  r: Rect,
  radius: number,
  fill: string,
) {
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.width, r.height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: Rect,
  max: number,
  weight: number,
  color: string,
  center: boolean,
) {
  if (!text.trim()) return;
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
export async function render(
  canvas: HTMLCanvasElement,
  preset: OutputPreset,
  design: ProjectDesign,
  slide: Slide,
  preview = false,
) {
  await ensureFont();
  const scale = preview
    ? Math.min(1, 1000 / Math.max(preset.width, preset.height))
    : 1;
  canvas.width = Math.round(preset.width * scale);
  canvas.height = Math.round(preset.height * scale);
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas를 사용할 수 없는 브라우저입니다.');
  ctx.scale(scale, scale);
  const w = preset.width,
    h = preset.height;
  ctx.fillStyle = design.background;
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const l = layout(w, h, design.template, design.frame);
  const image = getImage(slide.images[preset.device])?.bitmap;
  const ratio =
    design.frame === 'phone'
      ? 9 / 19.5
      : design.frame === 'tablet'
        ? l.landscape
          ? 16 / 10
          : 3 / 4
        : 16 / 10;
  const outer = contain(ratio, 1, l.device);
  const bezel =
    design.template === 'frameless'
      ? 0
      : outer.width * (design.frame === 'phone' ? 0.032 : 0.022);
  const radius =
    design.template === 'frameless'
      ? outer.width * 0.012
      : outer.width * (design.frame === 'phone' ? 0.115 : 0.045);
  if (bezel) {
    ctx.save();
    ctx.shadowColor = '#0F172A25';
    ctx.shadowBlur = w * 0.025;
    ctx.shadowOffsetY = w * 0.012;
    rounded(ctx, outer, radius, design.frameColor);
    ctx.restore();
  }
  const screen = {
    x: outer.x + bezel,
    y: outer.y + bezel,
    width: outer.width - 2 * bezel,
    height: outer.height - 2 * bezel,
  };
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(
    screen.x,
    screen.y,
    screen.width,
    screen.height,
    Math.max(0, radius - bezel),
  );
  ctx.clip();
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(screen.x, screen.y, screen.width, screen.height);
  if (image) {
    const r = contain(image.width, image.height, screen);
    ctx.drawImage(image, r.x, r.y, r.width, r.height);
  } else {
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(screen.x, screen.y, screen.width, screen.height);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 ' + outer.width * 0.052 + 'px Pretendard';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      '스크린샷을 업로드하세요',
      screen.x + screen.width / 2,
      screen.y + screen.height / 2,
    );
  }
  ctx.restore();
  if (bezel) {
    if (design.frame === 'phone') {
      rounded(
        ctx,
        {
          x: outer.x + outer.width * 0.35,
          y: outer.y + bezel * 1.4,
          width: outer.width * 0.3,
          height: bezel * 1.3,
        },
        bezel,
        '#111827',
      );
    } else {
      ctx.beginPath();
      ctx.arc(
        outer.x + outer.width / 2,
        outer.y + bezel / 2,
        bezel * 0.15,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = '#64748B';
      ctx.fill();
    }
    if (design.frame === 'pc') {
      rounded(
        ctx,
        {
          x: outer.x + outer.width * 0.42,
          y: outer.y + outer.height,
          width: outer.width * 0.16,
          height: l.device.height * 0.055,
        },
        0,
        design.frameColor,
      );
      rounded(
        ctx,
        {
          x: outer.x + outer.width * 0.29,
          y: outer.y + outer.height + l.device.height * 0.05,
          width: outer.width * 0.42,
          height: l.device.height * 0.015,
        },
        4,
        design.frameColor,
      );
    }
  }
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
