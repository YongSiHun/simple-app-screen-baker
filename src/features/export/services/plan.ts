import type { OutputPreset, Slide } from '../../editor/types/project';
import { resolveSlideImage } from '../../editor/utils/resolveSlideImage.ts';

export function createExportPlan(
  slides: Slide[],
  presets: OutputPreset[],
  hasImage: (id: string | undefined) => boolean = (id) => Boolean(id),
) {
  const jobs: { preset: OutputPreset; slide: Slide; index: number }[] = [];
  const availability = presets.map((preset) => {
    let available = 0;
    let reused = 0;
    slides.forEach((slide, index) => {
      const source = resolveSlideImage(slide, preset.device, hasImage);
      if (source) {
        jobs.push({ preset, slide, index });
        available++;
        if (source.reused) reused++;
      }
    });
    return { preset, available, reused, missing: slides.length - available };
  });
  return {
    jobs,
    availability,
    missing: availability.reduce((count, entry) => count + entry.missing, 0),
  };
}
