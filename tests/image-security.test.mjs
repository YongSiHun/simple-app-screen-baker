import { afterEach, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadImage,
  getImage,
  releaseUnused,
} from '../src/features/editor/services/images.ts';
import { readScreenshots } from '../src/features/editor/services/readScreenshots.ts';
import { imageDimensions } from '../src/features/editor/services/imageDimensions.ts';
import { pngFile, pngHeader } from './helpers/images.mjs';

const originalDecoder = globalThis.createImageBitmap;
afterEach(() => {
  releaseUnused(new Set());
  globalThis.createImageBitmap = originalDecoder;
});

it('rejects forged MIME types and oversized dimensions before decoding', async () => {
  let calls = 0;
  globalThis.createImageBitmap = async () => {
    calls++;
  };

  await assert.rejects(
    loadImage(new File(['<svg/>'], 'fake.png', { type: 'image/png' })),
    /헤더/,
  );
  await assert.rejects(loadImage(pngHeader(100000, 100000)), /4천만/);
  await assert.rejects(loadImage(pngHeader(0, 10)), /4천만/);
  assert.equal(calls, 0);
});

it('reserves the shared pixel budget across concurrent decodes', async () => {
  const decodes = [];
  const closed = [];
  globalThis.createImageBitmap = () =>
    new Promise((resolve) => decodes.push(resolve));
  const first = loadImage(pngHeader(8000, 5000));
  const second = loadImage(pngHeader(8000, 5000));
  await new Promise((resolve) => setImmediate(resolve));
  await assert.rejects(loadImage(pngHeader(8000, 5000)), /메모리/);
  assert.equal(decodes.length, 2);
  decodes.forEach((resolve, index) =>
    resolve({ width: 8000, height: 5000, close: () => closed.push(index) }),
  );
  const ids = await Promise.all([first, second]);
  assert.ok(ids.every((id) => getImage(id)));
  releaseUnused(new Set());
  assert.equal(closed.length, 2);
});

it('closes a decoded bitmap when cancellation occurs and frees its reservation', async () => {
  const controller = new AbortController();
  let closed = 0;
  globalThis.createImageBitmap = async () => {
    controller.abort();

    return { width: 10, height: 20, close: () => closed++ };
  };

  await assert.rejects(loadImage(await pngFile(), controller.signal), {
    name: 'AbortError',
  });
  assert.equal(closed, 1);
  globalThis.createImageBitmap = async () => ({
    width: 10,
    height: 20,
    close() {},
  });
  assert.ok(getImage(await loadImage(await pngFile())));
});

it('closes bitmaps if object URL registration fails', async (t) => {
  let closed = 0;
  globalThis.createImageBitmap = async () => ({
    width: 10,
    height: 20,
    close: () => closed++,
  });
  t.mock.method(URL, 'createObjectURL', () => {
    throw new Error('URL failure');
  });
  await assert.rejects(loadImage(await pngFile()), /URL failure/);
  assert.equal(closed, 1);
});

it('releases reservations after decoder failures', async () => {
  globalThis.createImageBitmap = async () => {
    throw new Error('decode');
  };

  await assert.rejects(loadImage(pngHeader(8000, 5000)), /읽을 수/);
  globalThis.createImageBitmap = async () => ({
    width: 8000,
    height: 5000,
    close() {},
  });
  const ids = await Promise.all([
    loadImage(pngHeader(8000, 5000)),
    loadImage(pngHeader(8000, 5000)),
  ]);
  assert.equal(ids.length, 2);
});

it('reads JPEG dimensions with metadata and rejects truncated segments', () => {
  const bytes = new Uint8Array([
    255, 216, 255, 225, 0, 4, 0, 0, 255, 192, 0, 8, 8, 0, 20, 0, 10, 0,
  ]);
  assert.deepEqual(imageDimensions(bytes, 'image/jpeg'), {
    width: 10,
    height: 20,
  });
  assert.throws(
    () => imageDimensions(bytes.subarray(0, 14), 'image/jpeg'),
    /헤더/,
  );
});

it('reads all three WebP dimension encodings', () => {
  for (const type of ['VP8X', 'VP8L', 'VP8 ']) {
    const bytes = new Uint8Array(30);
    const view = new DataView(bytes.buffer);
    bytes.set(new TextEncoder().encode('RIFF'));
    view.setUint32(4, 22, true);
    bytes.set(new TextEncoder().encode('WEBP' + type), 8);
    view.setUint32(16, 10, true);
    const isExtended = type === 'VP8X';
    const isLossless = type === 'VP8L';

    if (isExtended) {
      bytes[24] = 9;
      bytes[27] = 19;
    } else if (isLossless) {
      bytes[20] = 0x2f;
      view.setUint32(21, 9 | (19 << 14), true);
    } else {
      bytes.set([0x9d, 0x01, 0x2a], 23);
      view.setUint16(26, 10, true);
      view.setUint16(28, 20, true);
    }

    assert.deepEqual(imageDimensions(bytes, 'image/webp'), {
      width: 10,
      height: 20,
    });
  }
});

it('rejects truncated and arbitrary headers with a controlled error', () => {
  for (let length = 0; length < 33; length++) {
    for (const type of ['image/png', 'image/jpeg', 'image/webp']) {
      assert.throws(
        () => imageDimensions(new Uint8Array(length).fill(255), type),
        /헤더/,
      );
    }
  }
});

it('rejects oversized files before reading or decoding', async () => {
  const file = pngHeader(10, 20);
  Object.defineProperty(file, 'size', { value: 25 * 1024 * 1024 + 1 });
  file.arrayBuffer = () => {
    throw new Error('must not read');
  };

  await assert.rejects(loadImage(file), /25MB/);
});

it('limits total retained source bytes and allows new files after collection', async () => {
  globalThis.createImageBitmap = async () => ({
    width: 10,
    height: 20,
    close() {},
  });
  const source = () => {
    const file = pngHeader(10, 20);
    Object.defineProperty(file, 'size', { value: 25 * 1024 * 1024 });

    return file;
  };

  for (let index = 0; index < 4; index++) {
    await loadImage(source());
  }

  await assert.rejects(loadImage(source()), /메모리/);
  releaseUnused(new Set());
  assert.ok(getImage(await loadImage(source())));
});

it('rejects unsupported format names including inherited object keys', () => {
  for (const type of [
    'image/svg+xml',
    '__proto__',
    'constructor',
    'toString',
  ]) {
    assert.throws(() => imageDimensions(new Uint8Array(), type), /헤더/);
  }
});

it('keeps valid uploads when other files in the batch are invalid', async () => {
  globalThis.createImageBitmap = async () => ({
    width: 10,
    height: 20,
    close() {},
  });
  const files = [
    new File(['bad'], 'bad.png', { type: 'image/png' }),
    await pngFile(),
    new File(['svg'], 'bad.svg', { type: 'image/svg+xml' }),
  ];
  const result = await readScreenshots(files, new AbortController().signal);
  assert.equal(result.ids.length, 1);
  assert.equal(result.errors.length, 2);
  assert.ok(getImage(result.ids[0]));
});

it('does not decode any files in an already cancelled batch', async () => {
  let calls = 0;
  globalThis.createImageBitmap = async () => {
    calls++;
  };

  const controller = new AbortController();
  controller.abort();
  assert.deepEqual(
    await readScreenshots([await pngFile()], controller.signal),
    { ids: [], errors: [] },
  );
  assert.equal(calls, 0);
});
