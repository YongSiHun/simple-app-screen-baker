import type { Dispatch, SetStateAction } from 'react';
import { SLIDE_ELEMENTS, ELEMENT_LABELS } from '../constants/preview';
import type { SlideSelection } from '../types/interaction';
import type { SlideElement, OutputPreset } from '../types/project';
import type { useSlideInteraction } from '../hooks/useSlideInteraction';
import type { layout } from '../../rendering/utils/layout';

type Props = {
  preset: OutputPreset;
  boxes: ReturnType<typeof layout>;
  interaction: ReturnType<typeof useSlideInteraction>;
  slideId: string;
  editingElement: SlideElement | null;
  disabled: boolean;
  setEditing: Dispatch<SetStateAction<SlideSelection | null>>;
};

/** 선택 핸들 · 포인터/KBD 입력 분리 */
export function PreviewElements(props: Props) {
  return SLIDE_ELEMENTS.map((element) => (
    <PreviewElement key={element} {...props} element={element} />
  ));
}

function PreviewElement({
  preset,
  boxes,
  interaction,
  slideId,
  editingElement,
  disabled,
  setEditing,
  element,
}: Props & { element: SlideElement }) {
  const {
    selected,
    setSelection,
    dragged,
    startMove,
    move,
    endMove,
    finishDrag,
    keyMove,
  } = interaction;
  const box = boxes[element];
  const isSelected = selected === element;

  return (
    <button
      type="button"
      className={
        'preview-element element-' + element + (isSelected ? ' selected' : '')
      }
      aria-label={
        ELEMENT_LABELS[element] +
        (element === 'device' ? ' 이동' : ' 편집 및 이동')
      }
      aria-pressed={isSelected}
      aria-describedby="preview-move-help"
      disabled={disabled}
      style={{
        visibility: editingElement === element ? 'hidden' : undefined,
        left: (box.x / preset.width) * 100 + '%',
        top: (box.y / preset.height) * 100 + '%',
        width: (box.width / preset.width) * 100 + '%',
        height: (box.height / preset.height) * 100 + '%',
      }}
      onClick={(event) => {
        setSelection({ slideId, element });
        const shouldEdit =
          element !== 'device' && (event.detail === 0 || !dragged.current);

        if (shouldEdit) {
          setEditing({ slideId, element });
        }
      }}
      onFocus={() => setSelection({ slideId, element })}
      onPointerDown={(event) => startMove(event, element)}
      onPointerMove={move}
      onPointerUp={(event) => endMove(event)}
      onPointerCancel={(event) => endMove(event, true)}
      onLostPointerCapture={finishDrag}
      onKeyDown={(event) => keyMove(event, element)}
    >
      <span aria-hidden="true">{ELEMENT_LABELS[element]}</span>
    </button>
  );
}
