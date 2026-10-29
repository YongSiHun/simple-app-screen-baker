import { it } from 'node:test';
import assert from 'node:assert/strict';
import {
  deviceGeometry,
  recommendedImageSize,
  imageAspectRatio,
} from '../src/features/rendering/utils/deviceGeometry.ts';
import { PRESETS } from '../src/features/export/constants/presets.ts';
import { cover } from '../src/features/rendering/utils/layout.ts';
const design = {
  template: 'top',
  frame: 'auto',
  background: '#EAF0FF',
  textColor: '#0F172A',
  font: 'Pretendard',
  weight: 800,
  frameColor: '#111827',
};
it('recommends enough source pixels to fill each device screen', () => {
  for (const preset of PRESETS) {
    for (const template of ['top', 'center', 'frameless']) {
      const { screen, aspect } = deviceGeometry(
        preset.width,
        preset.height,
        { ...design, template },
        preset.device,
      );
      const suggested = recommendedImageSize(screen, aspect);
      assert.ok(suggested.width >= screen.width);
      assert.ok(suggested.height >= screen.height);
      const actual = cover(aspect.width, aspect.height, {
        x: 0,
        y: 0,
        ...screen,
      });
      assert.equal(suggested.width, Math.ceil(actual.width));
      assert.equal(suggested.height, Math.ceil(actual.height));
    }
  }
});
it('uses the attached image aspect ratio and detects insufficient source resolution', () => {
  const screen = { width: 900, height: 1600 };
  assert.deepEqual(recommendedImageSize(screen, { width: 1600, height: 900 }), {
    width: 2845,
    height: 1600,
    sufficient: false,
  });
  assert.equal(
    recommendedImageSize(screen, { width: 400, height: 225 }).sufficient,
    false,
  );
  assert.equal(
    recommendedImageSize(screen, { width: 900, height: 1600 }).sufficient,
    true,
  );
});
it('shows useful aspect ratios for phones, tablets, PCs and other image sizes', () => {
  assert.equal(imageAspectRatio(1200, 1600), '3:4');
  assert.equal(imageAspectRatio(2880, 1800), '16:10');
  assert.equal(imageAspectRatio(1080, 1920), '9:16');
  assert.equal(imageAspectRatio(9, 19.5), '9:19.5');
  assert.equal(imageAspectRatio(1206, 2622), '약 9:19.5');
  assert.equal(imageAspectRatio(1000, 700), '10:7');
});
it('updates the recommended image geometry when the selected frame changes', () => {
  const preset = PRESETS.find((preset) => preset.id === 'mac');
  const phone = deviceGeometry(
    preset.width,
    preset.height,
    { ...design, frame: 'phone' },
    preset.device,
  );
  assert.equal(phone.frame, 'phone');
  assert.equal(
    imageAspectRatio(phone.aspect.width, phone.aspect.height),
    '9:19.5',
  );
  const pc = deviceGeometry(preset.width, preset.height, design, preset.device);
  assert.equal(imageAspectRatio(pc.aspect.width, pc.aspect.height), '16:10');
  assert.notDeepEqual(phone.screen, pc.screen);
});
