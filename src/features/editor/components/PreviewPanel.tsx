import { useState } from 'react';
import type { OutputPreset, ProjectDesign, Slide } from '../types/project';
import { useProject } from '../store/useProject';
import { ResetPositionsDialog } from './ResetPositionsDialog';
import { PreviewToolbar, elements, labels } from './PreviewToolbar';
import { usePreviewSize } from '../hooks/usePreviewSize';
import { usePreviewCanvas } from '../hooks/usePreviewCanvas';
import { useSlideInteraction } from '../hooks/useSlideInteraction';
import { resolveFrame } from '../../rendering/utils/frame';
import { layout } from '../../rendering/utils/layout';
/**
 * 캔버스와 선택 영역을 연결해 슬라이드를 직접 편집합니다.
 */
export function PreviewPanel({
  preset,
  design,
  slide,
  disabled = false,
}: {
  preset: OutputPreset;
  design: ProjectDesign;
  slide: Slide;
  disabled?: boolean;
}) {
  const { resetPositions, undo, redo, past, future } = useProject();
  const [resetOpen, setResetOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const { stage, size } = usePreviewSize(preset);
  const { ref, error, loading, ready } = usePreviewCanvas(
    preset,
    design,
    slide,
    zoom,
  );
  const {
    surface,
    selected,
    setSelection,
    startMove,
    move,
    endMove,
    keyMove,
    finishDrag,
  } = useSlideInteraction(preset, design, slide, disabled);
  const hasPositions = Object.values(slide.positions ?? {}).some(
    (value) => value && (value.x !== 0 || value.y !== 0),
  );
  const frame = resolveFrame(design.frame, preset.device);
  const frameName = { phone: '스마트폰', tablet: '태블릿', pc: 'PC' }[frame];
  const boxes = layout(
    preset.width,
    preset.height,
    design.template,
    frame,
    slide.positions,
  );

  return (
    <section
      className="preview-panel"
      aria-label="스크린샷 미리보기"
      aria-busy={loading}
    >
      <PreviewToolbar
        disabled={disabled}
        selected={selected}
        onSelect={(element) => setSelection({ slideId: slide.id, element })}
        keyMove={keyMove}
        zoom={zoom}
        setZoom={setZoom}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        hasPositions={hasPositions}
        undo={undo}
        redo={redo}
        onReset={() => setResetOpen(true)}
      />
      {resetOpen && (
        <ResetPositionsDialog
          onClose={() => setResetOpen(false)}
          onConfirm={() => {
            resetPositions(slide.id);
            setResetOpen(false);
          }}
        />
      )}
      <p className="sr-only" id="preview-move-help">
        텍스트·기기 화면을 클릭하고 드래그하세요. 선택 후 방향키로 미세 이동 ·
        Shift + 방향키로 빠르게 이동
      </p>
      <div
        ref={stage}
        className={
          'canvas-stage ' + (preset.orientation === 'landscape' ? 'wide' : '')
        }
        onPointerDown={(e) => {
          const isBackgroundClick = e.target === e.currentTarget;

          if (isBackgroundClick) {
            setSelection(null);
          }
        }}
      >
        <div
          className="preview-scroll-area"
          style={{
            width: Math.max(size.viewportWidth, size.width * zoom),
            height: Math.max(size.viewportHeight, size.height * zoom),
          }}
          onPointerDown={(e) => {
            const isBackgroundClick = e.target === e.currentTarget;

            if (isBackgroundClick) {
              setSelection(null);
            }
          }}
        >
          <div
            ref={surface}
            className="preview-surface"
            style={{ width: size.width * zoom, height: size.height * zoom }}
            onPointerDown={(e) => {
              const isCanvasBackground =
                e.target === e.currentTarget || e.target === ref.current;

              if (isCanvasBackground) {
                setSelection(null);
              }
            }}
          >
            <canvas
              ref={ref}
              aria-label={slide.title + ' · ' + frameName + ' 미리보기'}
              style={{ visibility: !ready || error ? 'hidden' : 'visible' }}
            />
            {ready &&
              !error &&
              elements.map((element) => {
                const box = boxes[element];

                return (
                  <button
                    key={element}
                    type="button"
                    className={
                      'preview-element element-' +
                      element +
                      (selected === element ? ' selected' : '')
                    }
                    aria-label={labels[element] + ' 이동'}
                    aria-pressed={selected === element}
                    aria-describedby="preview-move-help"
                    disabled={disabled}
                    style={{
                      left: (box.x / preset.width) * 100 + '%',
                      top: (box.y / preset.height) * 100 + '%',
                      width: (box.width / preset.width) * 100 + '%',
                      height: (box.height / preset.height) * 100 + '%',
                    }}
                    onClick={() => setSelection({ slideId: slide.id, element })}
                    onFocus={() => setSelection({ slideId: slide.id, element })}
                    onPointerDown={(e) => startMove(e, element)}
                    onPointerMove={move}
                    onPointerUp={(e) => endMove(e)}
                    onPointerCancel={(e) => endMove(e, true)}
                    onLostPointerCapture={finishDrag}
                    onKeyDown={(e) => keyMove(e, element)}
                  >
                    <span aria-hidden="true">{labels[element]}</span>
                  </button>
                );
              })}
          </div>
        </div>
        {loading && !ready && (
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
    </section>
  );
}
