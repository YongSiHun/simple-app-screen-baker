import { useRef, useState } from 'react';
import type { PointerEvent, KeyboardEvent } from 'react';
import type {
  OutputPreset,
  ProjectDesign,
  Slide,
  SlideElement,
  ElementPosition,
} from '../types/project';
import { useProject } from '../store/useProject';
import { layout, movePosition } from '../../rendering/utils/layout';
import { resolveFrame } from '../../rendering/utils/frame';
/**
 * 컴포넌트 선택과 포인터·키보드 이동을 관리합니다.
 */
export function useSlideInteraction(
  preset: OutputPreset,
  design: ProjectDesign,
  slide: Slide,
  disabled: boolean,
) {
  const surface = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    element: SlideElement;
    pointer: number;
    x: number;
    y: number;
    width: number;
    height: number;
    original?: ElementPosition;
  } | null>(null);
  const { position, beginEdit, endEdit, cancelEdit } = useProject();
  const [selection, setSelection] = useState<{
    slideId: string;
    element: SlideElement;
  } | null>(null);
  const selected = selection?.slideId === slide.id ? selection.element : null;
  const frame = resolveFrame(design.frame, preset.device);
  const base = layout(preset.width, preset.height, design.template, frame);
  /**
   * 드래그 시작 위치를 기록하고 편집 이력 묶음을 엽니다.
   */
  function startMove(
    event: PointerEvent<HTMLButtonElement>,
    element: SlideElement,
  ) {
    const shouldIgnorePointer =
      disabled || event.button !== 0 || drag.current !== null;

    if (shouldIgnorePointer) {
      return;
    }

    const bounds = surface.current?.getBoundingClientRect();
    const hasInvalidBounds = !bounds?.width || !bounds.height;

    if (hasInvalidBounds) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelection({ slideId: slide.id, element });
    beginEdit();
    drag.current = {
      element,
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      width: bounds.width,
      height: bounds.height,
      original: slide.positions?.[element],
    };
  }

  /**
   * 화면상의 포인터 이동을 출력 크기에 비례한 위치로 변환합니다.
   */
  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    const shouldIgnoreMove =
      !current || current.pointer !== event.pointerId || disabled;

    if (shouldIgnoreMove) {
      return;
    }

    position(
      slide.id,
      current.element,
      movePosition(
        base[current.element],
        preset.width,
        preset.height,
        current.original,
        (event.clientX - current.x) / current.width,
        (event.clientY - current.y) / current.height,
      ),
    );
  }

  /**
   * 드래그 상태와 포인터 캡처를 해제합니다.
   */
  function releaseDrag(
    event: PointerEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
    pointer: number,
  ) {
    drag.current = null;
    const hasPointerCapture = event.currentTarget.hasPointerCapture(pointer);

    if (hasPointerCapture) {
      event.currentTarget.releasePointerCapture(pointer);
    }
  }

  /**
   * 드래그를 확정하거나 취소하고 포인터를 해제합니다.
   */
  function endMove(event: PointerEvent<HTMLButtonElement>, cancel = false) {
    const current = drag.current;
    const isDifferentPointer =
      current === null || current.pointer !== event.pointerId;

    if (isDifferentPointer) {
      return;
    }

    if (cancel) {
      cancelEdit();
      releaseDrag(event, event.pointerId);

      return;
    }

    move(event);
    endEdit();
    releaseDrag(event, event.pointerId);
  }

  /**
   * 진행 중인 드래그를 시작 위치로 되돌립니다.
   */
  function cancelDrag(event: KeyboardEvent<HTMLButtonElement>) {
    const activeDrag = drag.current;
    const hasNoActiveDrag = activeDrag === null;

    if (hasNoActiveDrag) {
      return;
    }

    cancelEdit();
    releaseDrag(event, activeDrag.pointer);
  }

  /**
   * 방향키 입력을 미세 이동 또는 빠른 이동으로 적용합니다.
   */
  function moveWithArrow(
    event: KeyboardEvent<HTMLButtonElement>,
    element: SlideElement,
  ) {
    const direction: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const delta = direction[event.key];
    const hasNoDirection = delta === undefined;

    if (hasNoDirection) {
      return;
    }

    event.preventDefault();
    setSelection({ slideId: slide.id, element });
    const step = event.shiftKey ? 10 : 1;
    const nextPosition = movePosition(
      base[element],
      preset.width,
      preset.height,
      slide.positions?.[element],
      (delta[0] * step) / preset.width,
      (delta[1] * step) / preset.height,
    );
    position(slide.id, element, nextPosition);
  }

  /**
   * 선택한 컴포넌트의 이동·선택 해제·드래그 취소를 처리합니다.
   */
  function keyMove(
    event: KeyboardEvent<HTMLButtonElement>,
    element: SlideElement,
  ) {
    if (disabled) {
      return;
    }

    const shouldCancelDrag =
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === 'z' &&
      drag.current !== null;

    if (shouldCancelDrag) {
      event.preventDefault();
      cancelDrag(event);

      return;
    }

    const isEscape = event.key === 'Escape';

    if (isEscape) {
      cancelDrag(event);
      setSelection(null);
      event.currentTarget.blur();

      return;
    }

    moveWithArrow(event, element);
  }

  /**
   * 포인터 캡처를 잃으면 진행 중인 드래그를 확정합니다.
   */
  function finishDrag() {
    const hasNoActiveDrag = drag.current === null;

    if (hasNoActiveDrag) {
      return;
    }

    endEdit();
    drag.current = null;
  }

  return {
    surface,
    selected,
    setSelection,
    startMove,
    move,
    endMove,
    keyMove,
    finishDrag,
  };
}
