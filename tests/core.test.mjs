import { render } from '../src/features/rendering/services/render.ts';
import { resolveSlideImage } from '../src/features/editor/utils/resolveSlideImage.ts';
import { resolveFrame } from '../src/features/rendering/utils/frame.ts';
import { createExportPlan } from '../src/features/export/services/plan.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import {
  contain,
  layout,
  wrapText,
  fitText,
} from '../src/features/rendering/utils/layout.ts';
import {
  PRESETS,
  validatePreset,
} from '../src/features/export/constants/presets.ts';
import {
  encodeRgb,
  verifyPng,
  crc32,
} from '../src/features/export/services/png.ts';
describe('aspect-preserving layout', () => {
  it('contains a portrait without distortion', () => {
    assert.deepEqual(
      contain(100, 200, { x: 10, y: 20, width: 200, height: 200 }),
      { x: 60, y: 20, width: 100, height: 200 },
    );
  });
  it('contains a landscape without distortion', () => {
    assert.deepEqual(
      contain(200, 100, { x: 0, y: 0, width: 100, height: 100 }),
      { x: 0, y: 25, width: 100, height: 50 },
    );
  });
  for (const p of PRESETS)
    for (const template of ['top', 'center', 'frameless'])
      it(p.id + ' / ' + template + ' stays within bounds', () => {
        const result = layout(p.width, p.height, template, p.device);
        for (const r of [result.title, result.subtitle, result.device]) {
          assert.ok(r.x >= 0 && r.y >= 0);
          assert.ok(r.width > 0 && r.height > 0);
          assert.ok(r.x + r.width <= p.width + 0.001);
          assert.ok(r.y + r.height <= p.height + 0.001);
        }
        const a = result.title,
          b = result.device;
        assert.ok(
          a.x + a.width <= b.x ||
            b.x + b.width <= a.x ||
            a.y + a.height <= b.y ||
            b.y + b.height <= a.y,
        );
      });
  it('uses distinct portrait and landscape arrangements', () => {
    assert.equal(layout(100, 200, 'top', 'phone').landscape, false);
    assert.equal(layout(200, 100, 'top', 'phone').landscape, true);
  });
});
describe('text wrapping and fitting', () => {
  const measure = (t) => Array.from(t).length * 10;
  it('wraps Korean text', () =>
    assert.deepEqual(wrapText('가나다라마', 20, measure), [
      '가나',
      '다라',
      '마',
    ]));
  it('preserves explicit line breaks', () =>
    assert.deepEqual(wrapText('Hello\nWorld', 100, measure), [
      'Hello',
      'World',
    ]));
  it('does not split emoji surrogate pairs', () =>
    assert.deepEqual(wrapText('😀😀😀', 20, measure), ['😀😀', '😀']));
  it('handles empty lines', () =>
    assert.deepEqual(wrapText('a\n\nb', 100, measure), ['a', '', 'b']));
  it('shrinks text until all lines fit', () => {
    const r = fitText(
      'abcdefghij',
      { x: 0, y: 0, width: 50, height: 35 },
      20,
      5,
      (t, s) => t.length * s,
    );
    assert.ok(r.lines.length * r.size * 1.25 <= 35);
    assert.ok(r.size < 20);
    assert.ok(r.lines.every((t) => t.length * r.size <= 50));
  });
  it('rejects text that cannot fit', () =>
    assert.throws(
      () =>
        fitText(
          'a'.repeat(1000),
          { x: 0, y: 0, width: 10, height: 10 },
          10,
          5,
          (t, s) => t.length * s,
        ),
      /문구/,
    ));
});
describe('output preset validation', () => {
  for (const p of PRESETS)
    it('accepts ' + p.id, () => assert.equal(validatePreset(p), true));
  it('rejects unknown Apple dimensions', () =>
    assert.equal(validatePreset({ ...PRESETS[0], width: 1000 }), false));
  it('rejects non-integer sizes', () =>
    assert.equal(validatePreset({ ...PRESETS[4], width: 1080.5 }), false));
  it('rejects the wrong orientation', () =>
    assert.equal(
      validatePreset({ ...PRESETS[4], orientation: 'landscape' }),
      false,
    ));
  it('rejects excessive Google aspect ratio', () =>
    assert.equal(
      validatePreset({ ...PRESETS[4], width: 320, height: 1920 }),
      false,
    ));
  it('rejects oversize Google output', () =>
    assert.equal(
      validatePreset({ ...PRESETS[4], width: 4000, height: 6000 }),
      false,
    ));
});
describe('RGB 24-bit PNG encoder', () => {
  it('encodes exact RGB pixels and valid PNG chunks', async () => {
    const rgba = new Uint8Array([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255,
    ]);
    const png = await encodeRgb(2, 2, rgba);
    assert.deepEqual(verifyPng(png, 2, 2), {
      width: 2,
      height: 2,
      bitDepth: 8,
      colorType: 2,
    });
    const view = new DataView(png.buffer);
    let compressed;
    for (let o = 8; o < png.length;) {
      const length = view.getUint32(o);
      if (view.getUint32(o + 4) === 0x49444154)
        compressed = png.subarray(o + 8, o + 8 + length);
      o += length + 12;
    }
    assert.ok(compressed);
    assert.deepEqual(
      [...inflateSync(compressed)],
      [0, 255, 0, 0, 0, 255, 0, 0, 0, 0, 255, 255, 255, 255],
    );
  });
  it('encodes and verifies a real preset at full resolution', async () => {
    const p = PRESETS[0];
    const rgba = new Uint8Array(p.width * p.height * 4);
    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = 37;
      rgba[i + 1] = 99;
      rgba[i + 2] = 235;
      rgba[i + 3] = 255;
    }
    const png = await encodeRgb(p.width, p.height, rgba);
    assert.equal(verifyPng(png, p.width, p.height).colorType, 2);
  });
  it('rejects transparency', async () =>
    assert.rejects(encodeRgb(1, 1, new Uint8Array([1, 2, 3, 0])), /투명/));
  it('rejects invalid pixel lengths', async () =>
    assert.rejects(encodeRgb(2, 2, new Uint8Array(4)), /잘못된/));
  it('rejects negative dimensions', async () =>
    assert.rejects(encodeRgb(-1, 1, new Uint8Array()), /잘못된/));
  it('rejects incorrect output size', async () => {
    const png = await encodeRgb(1, 1, new Uint8Array([1, 2, 3, 255]));
    assert.throws(() => verifyPng(png, 2, 1), /규격/);
  });
  it('rejects corrupt chunks', async () => {
    const png = await encodeRgb(1, 1, new Uint8Array([1, 2, 3, 255]));
    png[40] ^= 1;
    assert.throws(() => verifyPng(png, 1, 1), /CRC/);
  });
  it('rejects a truncated PNG', async () => {
    const png = await encodeRgb(1, 1, new Uint8Array([1, 2, 3, 255]));
    assert.throws(() => verifyPng(png.subarray(0, -12), 1, 1), /불완전/);
  });
  it('implements the standard CRC-32 check vector', () =>
    assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926));
});

describe('device frames for batch export', () => {
  for (const preset of PRESETS) {
    it(
      'uses the output device frame for ' + preset.id + ' in auto mode',
      () => {
        assert.equal(resolveFrame('auto', preset.device), preset.device);
      },
    );
  }
  it('preserves a manually selected phone frame on a tablet output', () => {
    assert.equal(resolveFrame('phone', 'tablet'), 'phone');
  });
  it('preserves a manually selected tablet frame on a phone output', () => {
    assert.equal(resolveFrame('tablet', 'phone'), 'tablet');
  });
  it('preserves a manually selected PC frame independently of output size', () => {
    assert.equal(resolveFrame('pc', 'phone'), 'pc');
  });
});

describe('ZIP export planning', () => {
  const slide = (id, images) => ({ id, images, title: id, subtitle: '' });
  it('exports all seven presets from one phone image', () => {
    const plan = createExportPlan(
      [slide('one', { phone: 'phone-image' })],
      PRESETS,
    );
    assert.deepEqual(
      plan.jobs.map((j) => j.preset.id),
      PRESETS.map((p) => p.id),
    );
    assert.equal(plan.missing, 0);
    assert.equal(
      plan.availability.reduce((sum, p) => sum + p.reused, 0),
      4,
    );
    assert.ok(plan.availability.every((p) => p.available === 1));
  });
  it('prefers dedicated images for all device types', () => {
    const plan = createExportPlan(
      [
        slide('one', { phone: 'p1', tablet: 't1', pc: 'c1' }),
        slide('two', { phone: 'p2', tablet: 't2', pc: 'c2' }),
      ],
      PRESETS,
    );
    assert.equal(plan.jobs.length, 14);
    assert.equal(plan.missing, 0);
    assert.ok(
      plan.availability.every((p) => p.available === 2 && p.reused === 0),
    );
  });
  it('exports all seven presets from one tablet image', () => {
    const plan = createExportPlan(
      [slide('one', { tablet: 'tablet-image' })],
      PRESETS,
    );
    assert.equal(plan.jobs.length, 7);
    assert.equal(plan.missing, 0);
    assert.equal(
      plan.availability.reduce((sum, p) => sum + p.reused, 0),
      5,
    );
  });
  it('exports all seven presets from one PC image', () => {
    const plan = createExportPlan([slide('one', { pc: 'pc-image' })], PRESETS);
    assert.equal(plan.jobs.length, 7);
    assert.equal(plan.missing, 0);
  });
  it('keeps dedicated sources while reusing a source for the remaining device', () => {
    const plan = createExportPlan(
      [slide('one', { phone: 'phone', tablet: 'tablet' })],
      PRESETS,
    );
    assert.equal(plan.jobs.length, 7);
    for (const entry of plan.availability)
      assert.equal(entry.reused, entry.preset.device === 'pc' ? 1 : 0);
  });
  it('preserves original slide numbering when an empty slide is skipped', () => {
    const plan = createExportPlan(
      [slide('one', {}), slide('two', { phone: 'p' })],
      [PRESETS[0]],
    );
    assert.equal(plan.jobs[0].index, 1);
    assert.equal(plan.jobs[0].slide.id, 'two');
    assert.equal(plan.missing, 1);
  });
  it('skips a slide when none of its image resources exist', () => {
    const plan = createExportPlan(
      [slide('one', { phone: 'stale' })],
      PRESETS,
      (id) => id === 'loaded',
    );
    assert.equal(plan.jobs.length, 0);
    assert.equal(plan.missing, 7);
  });
  it('falls back to a loaded resource when the dedicated image is stale', () => {
    const plan = createExportPlan(
      [slide('one', { phone: 'stale', tablet: 'loaded' })],
      PRESETS,
      (id) => id === 'loaded',
    );
    assert.equal(plan.jobs.length, 7);
    assert.equal(plan.missing, 0);
  });
  it('does not create jobs for unchecked presets', () => {
    const plan = createExportPlan([slide('one', { phone: 'p' })], [PRESETS[2]]);
    assert.deepEqual(
      plan.jobs.map((j) => j.preset.id),
      ['ipad'],
    );
    assert.equal(plan.missing, 0);
  });
  it('exports every nonempty slide into every selected preset', () => {
    const plan = createExportPlan(
      [
        slide('one', { phone: 'p' }),
        slide('empty', {}),
        slide('two', { pc: 'c' }),
      ],
      PRESETS,
    );
    assert.equal(plan.jobs.length, 14);
    assert.equal(plan.missing, 7);
    assert.ok(
      plan.availability.every((p) => p.available === 2 && p.missing === 1),
    );
  });
});

describe('shared screenshot selection', () => {
  it('reuses a single image across all device types', () => {
    const slide = { images: { phone: 'original' } };
    for (const device of ['phone', 'tablet', 'pc'])
      assert.deepEqual(resolveSlideImage(slide, device), {
        id: 'original',
        device: 'phone',
        reused: device !== 'phone',
      });
  });
  it('uses a dedicated tablet screenshot before the shared phone screenshot', () => {
    assert.deepEqual(
      resolveSlideImage({ images: { phone: 'p', tablet: 't' } }, 'tablet'),
      { id: 't', device: 'tablet', reused: false },
    );
  });
  it('reuses a tablet image when no phone image exists', () => {
    assert.equal(
      resolveSlideImage({ images: { tablet: 't' } }, 'phone').id,
      't',
    );
  });
  it('reuses a PC image when it is the only image', () => {
    assert.equal(resolveSlideImage({ images: { pc: 'c' } }, 'tablet').id, 'c');
  });
  it('falls back deterministically when several reusable sources exist', () => {
    assert.equal(
      resolveSlideImage({ images: { phone: 'p', tablet: 't' } }, 'pc').id,
      'p',
    );
  });
  it('ignores missing resources and tries another source', () => {
    assert.equal(
      resolveSlideImage(
        { images: { phone: 'stale', tablet: 'loaded' } },
        'phone',
        (id) => id === 'loaded',
      ).id,
      'loaded',
    );
  });
  it('returns no source for an empty slide', () => {
    assert.equal(resolveSlideImage({ images: {} }, 'pc'), undefined);
  });
  it('reuses references without copying or changing slide images', () => {
    const images = Object.freeze({ phone: 'p' });
    resolveSlideImage({ images }, 'pc');
    assert.deepEqual(images, { phone: 'p' });
  });
});

describe('manual frame to automatic rendering', () => {
  function recordingCanvas() {
    let calls = [];
    let width = 300;
    let height = 150;
    const ctx = { measureText: (text) => ({ width: text.length * 10 }) };
    for (const name of [
      'scale',
      'beginPath',
      'roundRect',
      'fill',
      'fillRect',
      'save',
      'restore',
      'clip',
      'drawImage',
      'fillText',
      'arc',
    ]) {
      ctx[name] = (...args) => calls.push([name, ...args]);
    }
    const canvas = {
      get width() {
        return width;
      },
      set width(value) {
        width = value;
        calls = [];
      },
      get height() {
        return height;
      },
      set height(value) {
        height = value;
        calls = [];
      },
      getContext() {
        return ctx;
      },
    };
    return { canvas, snapshot: () => structuredClone(calls) };
  }
  const slide = { id: 'round-trip', title: '', subtitle: '', images: {} };
  for (const preset of PRESETS)
    for (const template of ['top', 'center', 'frameless']) {
      it(
        preset.id +
          ' / ' +
          template +
          ' restores the automatic frame after every manual frame',
        async () => {
          const originalDocument = globalThis.document;
          globalThis.document = {
            fonts: { load: async () => [], check: () => true },
          };
          try {
            const design = {
              template,
              background: '#EAF0FF',
              textColor: '#0F172A',
              font: 'Pretendard',
              weight: 800,
              frame: 'auto',
              frameColor: '#111827',
            };
            const { canvas, snapshot } = recordingCanvas();
            await render(canvas, preset, design, slide, true);
            const initial = snapshot();
            for (const frame of ['phone', 'tablet', 'pc']) {
              await render(canvas, preset, { ...design, frame }, slide, true);
              if (template !== 'frameless' && frame !== preset.device)
                assert.notDeepEqual(snapshot(), initial);
              await render(canvas, preset, design, slide, true);
              assert.deepEqual(snapshot(), initial);
            }
          } finally {
            if (originalDocument === undefined) delete globalThis.document;
            else globalThis.document = originalDocument;
          }
        },
      );
    }
});
