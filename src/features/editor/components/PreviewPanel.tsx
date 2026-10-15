import { useLayoutEffect, useRef, useState } from 'react';
import type { OutputPreset, ProjectDesign, Slide } from '../types/project';
import { render } from '../../rendering/services/render';
import { resolveFrame } from '../../rendering/utils/frame';
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
  const [loading, setLoading] = useState(true);
  const frame = resolveFrame(design.frame, preset.device);
  const frameName = { phone: '스마트폰', tablet: '태블릿', pc: 'PC' }[frame];
  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    setLoading(true);
    setError('');
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    let active = true;
    const buffer = document.createElement('canvas');
    render(buffer, preset, design, slide, true)
      .then(() => {
        if (!active || ref.current !== canvas) return;
        canvas.width = buffer.width;
        canvas.height = buffer.height;
        canvas.getContext('2d')?.drawImage(buffer, 0, 0);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (active && ref.current === canvas) {
          setError(e instanceof Error ? e.message : '미리보기 생성 오류');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [preset, design, slide]);
  return (
    <section
      className="preview-panel"
      aria-label="스크린샷 미리보기"
      aria-busy={loading}
    >
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
          aria-label={slide.title + ' · ' + frameName + ' 미리보기'}
          style={{
            aspectRatio: preset.width + '/' + preset.height,
            visibility: loading || error ? 'hidden' : 'visible',
          }}
        />
        {loading && (
          <span className="preview-loading" role="status">
            미리보기 갱신 중…
          </span>
        )}
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
        <span>
          {design.frame === 'auto' ? '자동' : '수동'} 프레임 · {frameName}
        </span>
      </div>
    </section>
  );
}
