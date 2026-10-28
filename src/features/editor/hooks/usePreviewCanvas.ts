import { useEffect, useRef, useState } from 'react';
import type { OutputPreset, ProjectDesign, Slide } from '../types/project';
import { render } from '../../rendering/services/render';
/**
 * Coalesce rapid edits into one frame and discard cancelled canvas work.
 */
export function usePreviewCanvas(
  preset: OutputPreset,
  design: ProjectDesign,
  slide: Slide,
  zoom: number,
) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    const hasNoCanvas = !canvas;

    if (hasNoCanvas) {
      return;
    }

    const controller = new AbortController();
    const frame = requestAnimationFrame(() => {
      setLoading(true);
      setError('');
      const buffer = document.createElement('canvas');
      render(buffer, preset, design, slide, true, zoom, controller.signal)
        .then(() => {
          const isStaleRender =
            controller.signal.aborted || ref.current !== canvas;

          if (isStaleRender) {
            return;
          }

          canvas.width = buffer.width;
          canvas.height = buffer.height;
          canvas.getContext('2d')?.drawImage(buffer, 0, 0);
          setLoading(false);
          setReady(true);
        })
        .catch((error: unknown) => {
          const isStaleRender =
            controller.signal.aborted || ref.current !== canvas;

          if (isStaleRender) {
            return;
          }

          setError(
            error instanceof Error ? error.message : '미리보기 생성 오류',
          );
          setLoading(false);
        })
        .finally(() => {
          buffer.width = 1;
          buffer.height = 1;
        });
    });

    return () => {
      controller.abort();
      cancelAnimationFrame(frame);
    };
  }, [preset, design, slide, zoom]);

  return { ref, error, loading, ready };
}
