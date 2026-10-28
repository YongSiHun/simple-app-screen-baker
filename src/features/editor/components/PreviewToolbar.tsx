import {
  SLIDE_ELEMENTS,
  ELEMENT_LABELS,
  PREVIEW_MIN_ZOOM,
  PREVIEW_MAX_ZOOM,
  PREVIEW_ZOOM_STEP,
  PREVIEW_DEFAULT_ZOOM,
} from '../constants/preview';
import type { PreviewToolbarProps } from '../types/components';
/**
 * 컴포넌트 선택·배율·편집 이력 도구를 한 줄로 구성합니다.
 */
export function PreviewToolbar({
  disabled,
  selected,
  onSelect,
  keyMove,
  zoom,
  setZoom,
  canUndo,
  canRedo,
  hasPositions,
  undo,
  redo,
  onReset,
}: PreviewToolbarProps) {
  return (
    <div
      className="preview-toolbar preview-controls"
      role="group"
      aria-label="미리보기 편집 도구"
    >
      <div
        className="preview-edit-tools"
        role="group"
        aria-label="컴포넌트 선택"
      >
        {SLIDE_ELEMENTS.map((element) => (
          <button
            key={element}
            className={selected === element ? 'selected' : ''}
            aria-pressed={selected === element}
            disabled={disabled}
            onClick={() => onSelect(element)}
            onKeyDown={(e) => keyMove(e, element)}
          >
            {ELEMENT_LABELS[element]}
          </button>
        ))}
      </div>
      <div className="preview-zoom" role="group" aria-label="미리보기 배율">
        <button
          disabled={zoom <= PREVIEW_MIN_ZOOM}
          onClick={() =>
            setZoom((value) =>
              Math.max(PREVIEW_MIN_ZOOM, value - PREVIEW_ZOOM_STEP),
            )
          }
          aria-label="미리보기 축소"
        >
          −
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button
          disabled={zoom >= PREVIEW_MAX_ZOOM}
          onClick={() =>
            setZoom((value) =>
              Math.min(PREVIEW_MAX_ZOOM, value + PREVIEW_ZOOM_STEP),
            )
          }
          aria-label="미리보기 확대"
        >
          +
        </button>
        <button onClick={() => setZoom(PREVIEW_DEFAULT_ZOOM)}>
          화면에 맞춤
        </button>
      </div>
      <div
        className="history-actions"
        role="group"
        aria-label="편집 이력과 위치 초기화"
      >
        <button disabled={disabled || !canUndo} onClick={undo} title="Ctrl+Z">
          실행 취소
        </button>
        <button
          disabled={disabled || !canRedo}
          onClick={redo}
          title="Ctrl+Shift+Z"
        >
          다시 실행
        </button>
        <button
          className="position-reset"
          disabled={disabled || !hasPositions}
          onClick={onReset}
        >
          모든 위치 초기화
        </button>
      </div>
    </div>
  );
}
