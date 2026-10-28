import type { OutputPreset, Slide } from '../../editor/types/project';
import type { ExportJob, ExportPlan } from '../types/plan';
import { resolveSlideImage } from '../../editor/utils/resolveSlideImage.ts';

/**
 * 기기별로 생성 가능한 이미지와 제외되는 슬라이드를 계산합니다.
 */
export function createExportPlan(
  slides: Slide[],
  presets: OutputPreset[],
  hasImage: (id: string | undefined) => boolean = (id) => Boolean(id),
): ExportPlan {
  const jobs: ExportJob[] = [];
  const availability = presets.map((preset) => {
    let available = 0;
    let reused = 0;
    slides.forEach((slide, index) => {
      const source = resolveSlideImage(slide, preset.device, hasImage);
      const hasNoImageSource = source === undefined;

      if (hasNoImageSource) {
        return;
      }

      jobs.push({ preset, slide, index });
      available++;
      const isReusedImage = source.reused;

      if (isReusedImage) {
        reused++;
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
