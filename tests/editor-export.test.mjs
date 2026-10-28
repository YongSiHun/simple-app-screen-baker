import { it } from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { pngFile } from './helpers/images.mjs';
import { useProject } from '../src/features/editor/store/useProject.ts';
import {
  loadImage,
  getSlideImage,
} from '../src/features/editor/services/images.ts';
import { exportZip, png } from '../src/features/export/services/export.ts';
import { PRESETS } from '../src/features/export/constants/presets.ts';
import { verifyPng } from '../src/features/export/services/png.ts';

it('keeps the complete project and selection when switching devices', () => {
  const initial = useProject.getState();

  try {
    initial.text(initial.selectedId, {
      title: '수정한 제목',
      subtitle: '수정한 부제목',
    });
    initial.design({ background: '#DCF3EC', template: 'center', weight: 600 });
    initial.duplicate(initial.selectedId);
    initial.move(useProject.getState().selectedId, -1);
    const { project, selectedId } = useProject.getState();

    for (const preset of PRESETS) {
      useProject.getState().setPreset(preset.id);
      assert.equal(useProject.getState().project, project);
      assert.equal(useProject.getState().selectedId, selectedId);
      assert.equal(useProject.getState().presetId, preset.id);
    }
  } finally {
    useProject.setState(initial);
  }
});

it('exports only the current device with flat consecutive ZIP names and preserves edited content', async (t) => {
  const initial = useProject.getState();
  const bitmap = {
    width: 100,
    height: 200 /**
     * 테스트용 비트맵의 해제 동작을 대체합니다.
     */,
    close() {},
  };
  const originalBitmap = globalThis.createImageBitmap;
  const originalDocument = globalThis.document;
  globalThis.createImageBitmap = async () => bitmap;
  const drawnImages = [];
  const drawnText = [];
  const textCoordinates = [];
  const context = {
    measureText: (text) => ({ width: text.length * 10 }),
    drawImage: (image) => drawnImages.push(image),
    fillText: (text, x, y) => {
      drawnText.push(text);
      textCoordinates.push({ text, x, y });
    },
    getImageData: (_x, _y, width, height) => {
      const data = new Uint8ClampedArray(width * height * 4);

      for (let i = 3; i < data.length; i += 4) {
        data[i] = 255;
      }

      return { data };
    },
  };

  for (const name of [
    'scale',
    'beginPath',
    'roundRect',
    'fill',
    'fillRect',
    'save',
    'restore',
    'clip',
    'arc',
  ]) {
    context[name] = () => {};
  }

  let savedName;
  let savedBlob;
  const originalCreateUrl = URL.createObjectURL.bind(URL);
  t.mock.method(URL, 'createObjectURL', (blob) => {
    const isZipBlob = blob.type === 'application/zip';

    if (isZipBlob) {
      savedBlob = blob;
    }

    return originalCreateUrl(blob);
  });
  const originalTimeout = globalThis.setTimeout;
  t.mock.method(globalThis, 'setTimeout', (callback, delay, ...args) => {
    const timer = originalTimeout(callback, delay, ...args);
    const isDownloadCleanup = delay === 60000;

    if (isDownloadCleanup) {
      timer.unref();
    }

    return timer;
  });
  globalThis.document = {
    fonts: { load: async () => [], check: () => true },
    body: {
      /**
       * 테스트에서 다운로드 링크의 DOM 추가를 대체합니다.
       */
      append() {},
    },
    createElement: (tag) =>
      tag === 'canvas'
        ? {
            width: 0,
            height: 0 /**
             * 테스트에서 사용하는 그리기 컨텍스트를 반환합니다.
             */,
            getContext: () => context,
          }
        : {
            /**
             * 테스트에서 저장 파일 이름을 기록합니다.
             */
            click() {
              savedName = this.download;
            },
            /**
             * 테스트에서 다운로드 링크의 DOM 제거를 대체합니다.
             */
            remove() {},
          },
  };

  try {
    const id = await loadImage(await pngFile('phone.png', 100, 200));
    initial.attach([id], 'phone');
    initial.text(initial.selectedId, {
      title: '편집한 제목',
      subtitle: '편집한 부제목',
    });
    initial.position(initial.selectedId, 'title', { x: 0.02, y: 0.03 });
    initial.position(initial.selectedId, 'device', { x: 0.01, y: -0.08 });
    initial.duplicate(initial.selectedId);
    initial.add(); // Empty slides are skipped without gaps in ZIP filenames.
    initial.move(useProject.getState().selectedId, -1);
    const project = useProject.getState().project;
    const preset = PRESETS.find((p) => p.id === 'ipad');
    initial.setPreset(preset.id);
    assert.equal(getSlideImage(project.slides[0], 'tablet').id, id);
    assert.equal(await exportZip(project, preset, () => {}), 1);
    assert.equal(savedName, 'screenbaker-ipad.zip');
    const zip = await JSZip.loadAsync(await savedBlob.arrayBuffer());
    assert.deepEqual(Object.keys(zip.files), ['1.png', '2.png']);

    for (const entry of Object.values(zip.files)) {
      assert.equal(entry.dir, false);
      verifyPng(await entry.async('uint8array'), preset.width, preset.height);
    }

    const bytes = await png(project, project.slides[0], preset);
    verifyPng(bytes, preset.width, preset.height);
    assert.ok(drawnImages.every((image) => image === bitmap));
    assert.ok(drawnText.includes('편집한 제목'));
    assert.ok(drawnText.includes('편집한 부제목'));
    const title = textCoordinates.find((entry) => entry.text === '편집한 제목');
    assert.ok(Math.abs(title.x - preset.width * 0.52) < 0.001);
    assert.ok(Math.abs(title.y - preset.height * 0.105) < 0.001);
    assert.equal(useProject.getState().project, project);
  } finally {
    const hadNoBitmapDecoder = originalBitmap === undefined;

    if (hadNoBitmapDecoder) {
      delete globalThis.createImageBitmap;
    } else {
      globalThis.createImageBitmap = originalBitmap;
    }

    const hadNoDocument = originalDocument === undefined;

    if (hadNoDocument) {
      delete globalThis.document;
    } else {
      globalThis.document = originalDocument;
    }

    useProject.setState(initial);
  }
});
