import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useProject } from '../src/features/editor/store/useProject.ts';
import {
  getImage,
  getSlideImage,
  loadImage,
} from '../src/features/editor/services/images.ts';
import { historyShortcut } from '../src/features/editor/utils/historyShortcut.ts';
const initial = useProject.getState();
afterEach(() => {
  useProject.setState(initial);
  useProject.getState().collectImages();
});
/**
 * 테스트에서 최신 프로젝트 상태를 조회합니다.
 */
const state = () => useProject.getState();
/**
 * 테스트용 슬라이드 데이터를 준비합니다.
 */
const slide = () =>
  state().project.slides.find((slide) => slide.id === state().selectedId);

describe('undo and redo', () => {
  it('undoes a complete drag in one step and redoes its final position', () => {
    const project = state().project;
    state().beginEdit();

    for (let i = 1; i <= 20; i++) {
      state().position(state().selectedId, 'title', {
        x: i / 1000,
        y: i / 1000,
      });
    }

    assert.equal(state().past.length, 0);
    state().endEdit();
    assert.equal(state().past.length, 1);
    state().undo();
    assert.equal(state().project, project);
    state().redo();
    assert.deepEqual(slide().positions.title, { x: 0.02, y: 0.02 });
  });
  it('cancels a drag without adding history or consuming earlier edits', () => {
    state().design({ background: '#123456' });
    const project = state().project;
    state().beginEdit();
    state().position(state().selectedId, 'device', { x: 0.01, y: 0.02 });
    state().cancelEdit();
    assert.equal(state().project, project);
    assert.equal(state().past.length, 1);
    state().undo();
    assert.equal(
      state().project.design.background,
      initial.project.design.background,
    );
  });
  it('does not record clicks or drags returned to the starting position', () => {
    state().beginEdit();
    state().position(state().selectedId, 'title', { x: 0, y: 0 });
    state().endEdit();
    assert.equal(state().past.length, 0);
    state().beginEdit();
    state().position(state().selectedId, 'title', { x: 0.01, y: 0.02 });
    state().position(state().selectedId, 'title', { x: 0, y: 0 });
    state().endEdit();
    assert.equal(state().past.length, 0);
  });
  it('resets all current-slide components in one undoable action', () => {
    const id = state().selectedId;

    for (const element of ['title', 'subtitle', 'device']) {
      state().position(id, element, { x: 0.01, y: 0.02 });
    }

    state().duplicate(id);
    const duplicate = state().selectedId;
    const before = state().project;
    const past = state().past.length;
    state().resetPositions(duplicate);
    assert.equal(slide().positions, undefined);
    assert.deepEqual(
      state().project.slides.find((s) => s.id === id).positions,
      before.slides[0].positions,
    );
    assert.equal(state().past.length, past + 1);
    state().undo();
    assert.equal(state().project, before);
    state().redo();
    assert.equal(slide().positions, undefined);
  });
  it('supports text, styling, adding, ordering, duplication and deletion', () => {
    const before = state().project;
    state().text(state().selectedId, { title: 'edited' });
    state().design({ template: 'center' });
    state().add();
    state().duplicate(state().selectedId);
    state().move(state().selectedId, -1);
    state().remove(state().selectedId);
    const after = state().project;

    for (let i = 0; i < 6; i++) {
      state().undo();
    }

    assert.equal(state().project, before);
    assert.equal(state().selectedId, initial.selectedId);

    for (let i = 0; i < 6; i++) {
      state().redo();
    }

    assert.equal(state().project, after);
  });
  it('preserves the current device and discards redo after a new edit', () => {
    state().position(state().selectedId, 'title', { x: 0.01, y: 0.02 });
    state().setPreset('ipad');
    state().undo();
    assert.equal(state().presetId, 'ipad');
    assert.equal(state().future.length, 1);
    state().design({ background: '#123456' });
    assert.equal(state().future.length, 0);
  });
  it('bounds history and ignores edits with no visible changes', () => {
    state().design({ background: state().project.design.background });
    state().text(state().selectedId, { title: slide().title });
    state().resetPositions(state().selectedId);
    assert.equal(state().past.length, 0);

    for (let i = 0; i < 60; i++) {
      state().text(state().selectedId, { title: String(i) });
    }

    assert.equal(state().past.length, 50);
  });
  it('retains replaced images for undo, then releases an abandoned redo resource', async () => {
    const originalBitmap = globalThis.createImageBitmap;
    const closed = [];
    let index = 0;
    globalThis.createImageBitmap = async () => {
      const id = index++;

      return {
        width: 100,
        height: 200 /**
         * 테스트용 비트맵의 해제 동작을 대체합니다.
         */,
        close: () => closed.push(id),
      };
    };

    try {
      const a = await loadImage(
        new File(['a'], 'a.png', { type: 'image/png' }),
      );
      state().attach([a], 'phone');
      const b = await loadImage(
        new File(['b'], 'b.png', { type: 'image/png' }),
      );
      state().attach([b], 'phone');
      state().collectImages();
      assert.ok(getImage(a));
      state().undo();
      assert.equal(getSlideImage(slide(), 'phone').id, a);
      state().redo();
      assert.equal(getSlideImage(slide(), 'phone').id, b);
      state().remove(state().selectedId);
      state().undo();
      assert.equal(getSlideImage(slide(), 'phone').id, b);
      state().undo();
      state().design({ background: '#123456' });
      assert.equal(getImage(b), undefined);
      assert.ok(closed.includes(1));
      assert.ok(getImage(a));
    } finally {
      const hadNoBitmapDecoder = originalBitmap === undefined;

      if (hadNoBitmapDecoder) {
        delete globalThis.createImageBitmap;
      } else {
        globalThis.createImageBitmap = originalBitmap;
      }
    }
  });
});

describe('history shortcuts', () => {
  const event = {
    key: 'z',
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    altKey: false,
  };
  it('supports Ctrl+Z, Command+Z, Ctrl+Shift+Z and Ctrl+Y', () => {
    assert.equal(historyShortcut(event, false), 'undo');
    assert.equal(
      historyShortcut({ ...event, ctrlKey: false, metaKey: true }, false),
      'undo',
    );
    assert.equal(historyShortcut({ ...event, shiftKey: true }, false), 'redo');
    assert.equal(historyShortcut({ ...event, key: 'y' }, false), 'redo');
  });
  it('preserves native text undo and ignores unmodified keys', () => {
    assert.equal(historyShortcut(event, true), null);
    assert.equal(historyShortcut({ ...event, ctrlKey: false }, false), null);
    assert.equal(historyShortcut({ ...event, altKey: true }, false), null);
  });
});
