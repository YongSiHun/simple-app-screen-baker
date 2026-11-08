import { useShallow } from 'zustand/react/shallow';
import { useEffect, useState } from 'react';
import { DEVICE_LABELS } from '../constants/devices';
import type { PreviewPanelProps } from '../types/components';
import { useProject } from '../store/useProject';
import { ResetPositionsDialog } from './ResetPositionsDialog';
import { PreviewToolbar } from './PreviewToolbar';
import { PreviewElements } from './PreviewElements';
import { PreviewTextOverlay } from './PreviewTextOverlay';
import { PreviewFeedback } from './PreviewFeedback';
import type { SlideSelection } from '../types/interaction';
import { PREVIEW_DEFAULT_ZOOM } from '../constants/preview';
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
  const { resetPositions, undo, redo, canUndo, canRedo } = useProject(
    useShallow((state) => ({
      resetPositions: state.resetPositions,
      undo: state.undo,
      redo: state.redo,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    })),
  );
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
  const interaction = useSlideInteraction(preset, design, slide, disabled);
  const { surface, selected, setSelection, keyMove } = interaction;
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
        canUndo={canUndo}
        canRedo={canRedo}
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
        className={stageClassName(preset.orientation)}
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
              style={{ visibility: canvasVisibility(ready, error) }}
            />
            {ready && !error && (
              <PreviewElements
                preset={preset}
                boxes={boxes}
                interaction={interaction}
                slideId={slide.id}
                editingElement={editingElement}
                disabled={disabled}
                setEditing={setEditing}
              />
            )}
            <PreviewTextOverlay
              slide={slide}
              design={design}
              preset={preset}
              boxes={boxes}
              width={size.width}
              zoom={zoom}
              editingElement={editingElement}
              disabled={disabled}
              onClose={() => setEditing(null)}
            />
          </div>
        </div>
        <PreviewFeedback loading={loading} ready={ready} error={error} />
      </div>
    </section>
  );
}

function canvasVisibility(ready: boolean, error: string) {
  return !ready || error ? 'hidden' : 'visible';
}

function stageClassName(orientation: string) {
  return 'canvas-stage ' + (orientation === 'landscape' ? 'wide' : '');
}
