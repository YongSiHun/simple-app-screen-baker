import { useEffect, useState } from 'react';
import { DEVICE_LABELS } from '../constants/devices';
import type { PreviewPanelProps } from '../types/components';
import { useProject } from '../store/useProject';
import { ResetPositionsDialog } from './ResetPositionsDialog';
import { PreviewToolbar } from './PreviewToolbar';
import { PreviewTextEditor } from './PreviewTextEditor';
import type { SlideSelection } from '../types/interaction';
import {
  SLIDE_ELEMENTS,
  ELEMENT_LABELS,
  PREVIEW_DEFAULT_ZOOM,
} from '../constants/preview';
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
}: PreviewPanelProps) {
  const { resetPositions, undo, redo, past, future } = useProject();
  const [resetOpen, setResetOpen] = useState(false);
  const [editing, setEditing] = useState<SlideSelection | null>(null);
  const editingElement = editing?.slideId === slide.id ? editing.element : null;

  useEffect(() => {
    setEditing(null);
  }, [slide.id]);
  const [zoom, setZoom] = useState(PREVIEW_DEFAULT_ZOOM);
  const { stage, size } = usePreviewSize(preset);
  const { ref, error, loading, ready } = usePreviewCanvas(
    preset,
    design,
    slide,
    zoom,
  );
  const {
    surface,
    dragged,
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
  const frameName = DEVICE_LABELS[frame];
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
        텍스트를 클릭하면 문구를 수정할 수 있습니다. 텍스트·기기 화면을
        드래그하거나 선택 후 방향키로 이동하세요. Shift + 방향키로 빠르게 이동
      </p>
      <p className="sr-only" id="preview-text-help">
        Enter로 줄바꿈 · Ctrl 또는 Command + Enter로 완료 · Escape로 취소.
        바깥을 클릭해도 수정 내용이 저장됩니다.
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
              SLIDE_ELEMENTS.map((element) => {
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
                    aria-label={
                      ELEMENT_LABELS[element] +
                      (element === 'device' ? ' 이동' : ' 편집 및 이동')
                    }
                    aria-pressed={selected === element}
                    aria-describedby="preview-move-help"
                    disabled={disabled}
                    style={{
                      visibility:
                        editingElement === element ? 'hidden' : undefined,
                      left: (box.x / preset.width) * 100 + '%',
                      top: (box.y / preset.height) * 100 + '%',
                      width: (box.width / preset.width) * 100 + '%',
                      height: (box.height / preset.height) * 100 + '%',
                    }}
                    onClick={(event) => {
                      setSelection({ slideId: slide.id, element });
                      const shouldEdit =
                        element !== 'device' &&
                        (event.detail === 0 || !dragged.current);

                      if (shouldEdit) {
                        setEditing({ slideId: slide.id, element });
                      }
                    }}
                    onFocus={() => setSelection({ slideId: slide.id, element })}
                    onPointerDown={(e) => startMove(e, element)}
                    onPointerMove={move}
                    onPointerUp={(e) => endMove(e)}
                    onPointerCancel={(e) => endMove(e, true)}
                    onLostPointerCapture={finishDrag}
                    onKeyDown={(e) => keyMove(e, element)}
                  >
                    <span aria-hidden="true">{ELEMENT_LABELS[element]}</span>
                  </button>
                );
              })}
            {!disabled &&
              (editingElement === 'title' || editingElement === 'subtitle') && (
                <PreviewTextEditor
                  key={slide.id + ':' + editingElement}
                  slide={slide}
                  element={editingElement}
                  design={design}
                  onClose={() => setEditing(null)}
                  style={{
                    left: (boxes[editingElement].x / preset.width) * 100 + '%',
                    top: (boxes[editingElement].y / preset.height) * 100 + '%',
                    width:
                      (boxes[editingElement].width / preset.width) * 100 + '%',
                    height:
                      (boxes[editingElement].height / preset.height) * 100 +
                      '%',
                    fontSize:
                      size.width *
                      zoom *
                      (editingElement === 'title'
                        ? boxes.landscape
                          ? 0.041
                          : 0.075
                        : boxes.landscape
                          ? 0.018
                          : 0.033),
                    textAlign: boxes.landscape ? 'left' : 'center',
                  }}
                />
              )}
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
