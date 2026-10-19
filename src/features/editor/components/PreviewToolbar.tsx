import type { KeyboardEvent, Dispatch, SetStateAction } from 'react';
import type { SlideElement } from '../types/project';
export const elements: SlideElement[] = ['device', 'title', 'subtitle'];
export const labels = {
  title: '제목',
  subtitle: '부제목',
  device: '기기 화면',
};

interface PreviewToolbarProps {
  disabled: boolean;
  selected: SlideElement | null;
  onSelect: (element: SlideElement) => void;
  keyMove: (
    event: KeyboardEvent<HTMLButtonElement>,
    element: SlideElement,
  ) => void;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
  canUndo: boolean;
  canRedo: boolean;
  hasPositions: boolean;
  undo: () => void;
  redo: () => void;
  onReset: () => void;
}
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
        {elements.map((element) => (
          <button
            key={element}
            className={selected === element ? 'selected' : ''}
            aria-pressed={selected === element}
            disabled={disabled}
            onClick={() => onSelect(element)}
            onKeyDown={(e) => keyMove(e, element)}
          >
            {labels[element]}
          </button>
        ))}
      </div>
      <div className="preview-zoom" role="group" aria-label="미리보기 배율">
        <button
          disabled={zoom <= 0.5}
          onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
          aria-label="미리보기 축소"
        >
          −
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button
          disabled={zoom >= 2.5}
          onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))}
          aria-label="미리보기 확대"
        >
          +
        </button>
        <button onClick={() => setZoom(1)}>화면에 맞춤</button>
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
