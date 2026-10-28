import { it } from 'node:test';
import assert from 'node:assert/strict';
import { render } from '../src/features/rendering/services/render.ts';
import { PRESETS } from '../src/features/export/constants/presets.ts';

it('does not load fonts or allocate a canvas when already cancelled', async () => {
  const controller = new AbortController();
  controller.abort();
  const canvas = {};
  await assert.rejects(
    render(canvas, PRESETS[0], {}, {}, true, 1, controller.signal),
    { name: 'AbortError' },
  );
  assert.deepEqual(canvas, {});
});

it('does not draw stale previews after fonts finish loading', async () => {
  const originalDocument = globalThis.document;
  let release;
  const fonts = new Promise((resolve) => {
    release = resolve;
  });
  globalThis.document = { fonts: { load: () => fonts, check: () => true } };
  const controller = new AbortController();
  const canvas = {};

  try {
    const result = render(
      canvas,
      PRESETS[0],
      {},
      {},
      true,
      1,
      controller.signal,
    );
    controller.abort();
    release([]);
    await assert.rejects(result, { name: 'AbortError' });
    assert.deepEqual(canvas, {});
  } finally {
    globalThis.document = originalDocument;
  }
});
