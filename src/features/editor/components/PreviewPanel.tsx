import { useEffect, useRef, useState } from 'react';
import type { OutputPreset, ProjectDesign, Slide } from '../types/project';
import { render } from '../../rendering/services/render';
export function PreviewPanel({
  preset,
  design,
  slide,
}: {
  preset: OutputPreset;
  design: ProjectDesign;
  slide: Slide;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const buffer = document.createElement('canvas');
    render(buffer, preset, design, slide, true)
      .then(() => {
        if (!active || !ref.current) return;
        const canvas = ref.current;
        canvas.width = buffer.width;
        canvas.height = buffer.height;
        canvas.getContext('2d')?.drawImage(buffer, 0, 0);
        setError('');
      })
      .catch((e: unknown) => {
        if (active)
          setError(e instanceof Error ? e.message : '미리보기 생성 오류');
      });
    return () => {
      active = false;
    };
  }, [preset, design, slide]);
  return (
    <section className="preview-panel" aria-label="스크린샷 미리보기">
      <div className="preview-toolbar">
        <span>
          <i /> 실시간 미리보기
        </span>
        <span>
          {preset.width} × {preset.height} px
        </span>
      </div>
      <div
        className={
          'canvas-stage ' + (preset.orientation === 'landscape' ? 'wide' : '')
        }
      >
        <canvas
          ref={ref}
          aria-label={slide.title + ' 미리보기'}
          style={{ aspectRatio: preset.width + '/' + preset.height }}
        />
        {error && (
          <p className="preview-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="preview-caption">
        <span>
          {preset.platform === 'google-play'
            ? 'Google Play'
            : preset.platform === 'mac-app-store'
              ? 'Mac App Store'
              : 'App Store'}{' '}
          · {preset.label}
        </span>
        <span>비율 유지 · RGB PNG</span>
      </div>
    </section>
  );
}
