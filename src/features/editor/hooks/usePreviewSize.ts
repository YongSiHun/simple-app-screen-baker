import { useLayoutEffect, useRef, useState } from 'react';
import type { OutputPreset } from '../types/project';
/** 화면 맞춤 프리뷰 크기 산출 */
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

    /** 컨테이너 기준 캔버스 크기 갱신 */
    const resize = () => {
      const style = getComputedStyle(container);
      // 소수점 반올림 오버플로 방지 · 1px 여유
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
      const next = {
        width: preset.width * scale,
        height: preset.height * scale,
        viewportWidth: width,
        viewportHeight: height,
      };
      setSize((current) => {
        const isUnchanged =
          current.width === next.width &&
          current.height === next.height &&
          current.viewportWidth === next.viewportWidth &&
          current.viewportHeight === next.viewportHeight;

        return isUnchanged ? current : next;
      });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [preset]);

  return { stage, size };
}
