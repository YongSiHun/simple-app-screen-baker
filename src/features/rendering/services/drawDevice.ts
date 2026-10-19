import type {
  OutputPreset,
  ProjectDesign,
  Slide,
} from '../../editor/types/project';
import { getSlideImage } from '../../editor/services/images.ts';
import { deviceGeometry } from '../utils/deviceGeometry.ts';
import { contain, type Rect } from '../utils/layout.ts';
type DeviceGeometry = ReturnType<typeof deviceGeometry>;
/**
 * 지정한 색상으로 둥근 사각형을 그립니다.
 */
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

/**
 * 기기 프레임의 외곽과 그림자를 그립니다.
 */
function drawOutline(
  ctx: CanvasRenderingContext2D,
  geometry: DeviceGeometry,
  design: ProjectDesign,
  width: number,
) {
  const hasNoBezel = geometry.bezel === 0;

  if (hasNoBezel) {
    return;
  }

  ctx.save();
  ctx.shadowColor = '#0F172A25';
  ctx.shadowBlur = width * 0.025;
  ctx.shadowOffsetY = width * 0.012;
  rounded(ctx, geometry.outer, geometry.radius, design.frameColor);
  ctx.restore();
}

/**
 * 기기 화면에 원본 이미지 또는 업로드 안내를 그립니다.
 */
function drawScreenContent(
  ctx: CanvasRenderingContext2D,
  geometry: DeviceGeometry,
  image?: ImageBitmap,
) {
  const { screen, outer } = geometry;
  const hasImage = image !== undefined;

  if (hasImage) {
    const box = contain(image.width, image.height, screen);
    ctx.drawImage(image, box.x, box.y, box.width, box.height);

    return;
  }

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

/**
 * 기기 화면 내부에 맞춰 이미지 영역을 잘라 그립니다.
 */
function drawScreen(
  ctx: CanvasRenderingContext2D,
  geometry: DeviceGeometry,
  image?: ImageBitmap,
) {
  const { screen, radius, bezel } = geometry;
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
  drawScreenContent(ctx, geometry, image);
  ctx.restore();
}

/**
 * 스마트폰 노치 또는 기기의 카메라를 그립니다.
 */
function drawCamera(ctx: CanvasRenderingContext2D, geometry: DeviceGeometry) {
  const { frame, outer, bezel } = geometry;
  const isPhone = frame === 'phone';

  if (isPhone) {
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

    return;
  }

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

/**
 * PC 프레임의 받침대를 그립니다.
 */
function drawStand(
  ctx: CanvasRenderingContext2D,
  geometry: DeviceGeometry,
  color: string,
) {
  const { frame, outer, arrangement } = geometry;
  const isNotPc = frame !== 'pc';

  if (isNotPc) {
    return;
  }

  rounded(
    ctx,
    {
      x: outer.x + outer.width * 0.42,
      y: outer.y + outer.height,
      width: outer.width * 0.16,
      height: arrangement.device.height * 0.055,
    },
    0,
    color,
  );
  rounded(
    ctx,
    {
      x: outer.x + outer.width * 0.29,
      y: outer.y + outer.height + arrangement.device.height * 0.05,
      width: outer.width * 0.42,
      height: arrangement.device.height * 0.015,
    },
    4,
    color,
  );
}

/**
 * 기기 외곽·화면·장식을 순서대로 그립니다.
 */
export function drawDevice(
  ctx: CanvasRenderingContext2D,
  preset: OutputPreset,
  design: ProjectDesign,
  slide: Slide,
) {
  const geometry = deviceGeometry(
    preset.width,
    preset.height,
    design,
    preset.device,
    slide.positions,
  );
  const image = getSlideImage(slide, preset.device)?.bitmap;
  drawOutline(ctx, geometry, design, preset.width);
  drawScreen(ctx, geometry, image);
  const hasNoBezel = geometry.bezel === 0;

  if (hasNoBezel) {
    return geometry.arrangement;
  }

  drawCamera(ctx, geometry);
  drawStand(ctx, geometry, design.frameColor);

  return geometry.arrangement;
}
