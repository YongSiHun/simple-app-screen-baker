import { useLayoutEffect, useRef, useState } from 'react';
import type { OutputPreset } from '../types/project';
/**
 * 화면 맞춤 배율에 필요한 미리보기 영역 크기를 계산합니다.
 */
export function usePreviewSize(preset: OutputPreset) {
  const stage = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
    viewportWidth: 0,
    viewportHeight: 0,
  });
  useLayoutEffect(() => {
    const container = stage.current;
    const hasNoContainer = !container;

    if (hasNoContainer) {
      return;
    }

    /**
     * 컨테이너 크기에 맞춰 캔버스 표시 크기를 갱신합니다.
     */
    const resize = () => {
      const style = getComputedStyle(container);
      // Leave a pixel for fractional layout rounding so fit mode does not overflow.
      const width = Math.max(
        0,
        Math.floor(
          container.clientWidth -
            parseFloat(style.paddingLeft) -
            parseFloat(style.paddingRight),
        ) - 1,
      );
      const height = Math.max(
        0,
        Math.floor(
          container.clientHeight -
            parseFloat(style.paddingTop) -
            parseFloat(style.paddingBottom),
        ) - 1,
      );
      const maxWidth =
        preset.orientation === 'landscape' ? Math.min(850, width * 0.9) : width;
      const scale = Math.min(maxWidth / preset.width, height / preset.height);
      setSize({
        width: preset.width * scale,
        height: preset.height * scale,
        viewportWidth: width,
        viewportHeight: height,
      });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [preset]);

  return { stage, size };
}
