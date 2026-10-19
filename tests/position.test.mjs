import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  layout,
  movePosition,
} from '../src/features/rendering/utils/layout.ts';
import { PRESETS } from '../src/features/export/constants/presets.ts';
import { useProject } from '../src/features/editor/store/useProject.ts';

describe('component positioning', () => {
  for (const preset of PRESETS) {
    for (const template of ['top', 'center', 'frameless']) {
      it(
        preset.id + ' / ' + template + ' keeps dragged boxes within the output',
        () => {
          const base = layout(
            preset.width,
            preset.height,
            template,
            preset.device,
          );

          for (const element of ['title', 'subtitle', 'device']) {
            for (const [dx, dy] of [
              [-5, -5],
              [5, 5],
              [0.01, -0.02],
            ]) {
              const position = movePosition(
                base[element],
                preset.width,
                preset.height,
                undefined,
                dx,
                dy,
              );
              const box = layout(
                preset.width,
                preset.height,
                template,
                preset.device,
                { [element]: position },
              )[element];
              assert.ok(box.x >= 0 && box.y >= 0);
              assert.ok(box.x + box.width <= preset.width + 0.001);
              assert.ok(box.y + box.height <= preset.height + 0.001);
            }
          }
        },
      );
    }
  }

  it('uses the same relative movement for different output resolutions', () => {
    for (const preset of PRESETS) {
      const original = layout(
        preset.width,
        preset.height,
        'top',
        preset.device,
      );
      const moved = layout(preset.width, preset.height, 'top', preset.device, {
        title: { x: 0.01, y: 0.02 },
      });
      assert.ok(
        Math.abs((moved.title.x - original.title.x) / preset.width - 0.01) <
          1e-10,
      );
      assert.ok(
        Math.abs((moved.title.y - original.title.y) / preset.height - 0.02) <
          1e-10,
      );
      assert.deepEqual(moved.subtitle, original.subtitle);
      assert.deepEqual(moved.device, original.device);
    }
  });
  it('stores independent slide positions, preserves them on device changes, and resets one element', () => {
    const initial = useProject.getState();

    try {
      initial.position(initial.selectedId, 'title', { x: 0.01, y: 0.02 });
      initial.position(initial.selectedId, 'device', { x: 0, y: -0.02 });
      initial.duplicate(initial.selectedId);
      const duplicate = useProject.getState().selectedId;
      initial.position(duplicate, 'title', { x: 0.02, y: 0.03 });
      const original = useProject
        .getState()
        .project.slides.find((slide) => slide.id === initial.selectedId);
      assert.deepEqual(original.positions.title, { x: 0.01, y: 0.02 });
      initial.setPreset('ipad');
      assert.deepEqual(
        useProject
          .getState()
          .project.slides.find((slide) => slide.id === duplicate).positions
          .title,
        { x: 0.02, y: 0.03 },
      );
      initial.position(duplicate, 'title');
      const reset = useProject
        .getState()
        .project.slides.find((slide) => slide.id === duplicate);
      assert.equal(reset.positions.title, undefined);
      assert.deepEqual(reset.positions.device, { x: 0, y: -0.02 });
    } finally {
      useProject.setState(initial);
    }
  });
});
