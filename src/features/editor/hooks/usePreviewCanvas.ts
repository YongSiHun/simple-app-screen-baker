import { useLayoutEffect, useRef, useState } from 'react';
import type { OutputPreset, ProjectDesign, Slide } from '../types/project';
import { render } from '../../rendering/services/render';
/**
 * 현재 슬라이드를 캔버스에 그리고 오래된 렌더링 결과는 무시합니다.
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
  useLayoutEffect(() => {
    const canvas = ref.current;
    const hasNoCanvas = !canvas;

    if (hasNoCanvas) {
      return;
    }

    setLoading(true);
    setError('');
    let active = true;
    const buffer = document.createElement('canvas');
    render(buffer, preset, design, slide, true, zoom)
      .then(() => {
        const isStaleRender = !active || ref.current !== canvas;

        if (isStaleRender) {
          return;
        }

        canvas.width = buffer.width;
        canvas.height = buffer.height;
        canvas.getContext('2d')?.drawImage(buffer, 0, 0);
        setLoading(false);
        setReady(true);
      })
      .catch((e: unknown) => {
        const isStaleRender = !active || ref.current !== canvas;

        if (isStaleRender) {
          return;
        }

        setError(e instanceof Error ? e.message : '미리보기 생성 오류');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [preset, design, slide, zoom]);

  return { ref, error, loading, ready };
}
