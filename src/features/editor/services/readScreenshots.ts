import { loadImage } from './images.ts';
import type { ScreenshotReadResult, ScreenshotBatch } from '../types/images';

/** Decode one file and report a recoverable input error. */
async function readScreenshot(
  file: File,
  signal: AbortSignal,
): Promise<ScreenshotReadResult> {
  try {
    return { success: true, id: await loadImage(file, signal) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '업로드 오류',
    };
  }
}

/** Read sequentially so a batch cannot allocate all decoded images at once. */
export async function readScreenshots(
  files: File[],
  signal: AbortSignal,
): Promise<ScreenshotBatch> {
  const batch: ScreenshotBatch = { ids: [], errors: [] };

  for (const file of files) {
    const isCancelled = signal.aborted;

    if (isCancelled) {
      return batch;
    }

    const result = await readScreenshot(file, signal);
    const hasImage = result.success;

    if (hasImage) {
      batch.ids.push(result.id);
      continue;
    }

    batch.errors.push(result.error);
  }

  return batch;
}
