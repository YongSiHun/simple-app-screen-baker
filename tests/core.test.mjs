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
