import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { ELEMENT_LABELS } from '../constants/preview';
import { useProject } from '../store/useProject';
import type { ProjectDesign, Slide } from '../types/project';

interface PreviewTextEditorProps {
  slide: Slide;
  element: 'title' | 'subtitle';
  design: ProjectDesign;
  style: CSSProperties;
  onClose: () => void;
}

/** 미리보기에서 문구를 직접 수정하고 한 번의 실행 취소 작업으로 묶습니다. */
export function PreviewTextEditor({
  slide,
  element,
  design,
  style,
  onClose,
}: PreviewTextEditorProps) {
  const input = useRef<HTMLTextAreaElement>(null);
  const finished = useRef(false);
  const { text, beginEdit, endEdit, cancelEdit } = useProject();

  useEffect(() => {
    finished.current = false;
    beginEdit();
    input.current?.focus({ preventScroll: true });
    input.current?.select();

    return () => {
      const shouldFinish = !finished.current;

      if (shouldFinish) {
        endEdit();
      }
    };
  }, [beginEdit, endEdit]);

  function finish(cancel = false) {
    const alreadyFinished = finished.current;

    if (alreadyFinished) {
      return;
    }

    finished.current = true;

    if (cancel) {
      cancelEdit();
    }

    endEdit();
    onClose();
  }

  return (
    <textarea
      ref={input}
      className="preview-text-editor"
      aria-label={ELEMENT_LABELS[element] + ' 편집'}
      aria-describedby="preview-text-help"
      maxLength={element === 'title' ? 120 : 180}
      value={slide[element]}
      style={{
        ...style,
        color: design.textColor,
        background: design.background,
        fontFamily: design.font,
        fontWeight: element === 'title' ? design.weight : 600,
      }}
      onChange={(event) => text(slide.id, { [element]: event.target.value })}
      onBlur={() => finish()}
      onKeyDown={(event) => {
        const isComposing = event.nativeEvent.isComposing;

        if (isComposing) {
          return;
        }

        const shouldSave =
          event.key === 'Enter' && (event.ctrlKey || event.metaKey);
        const shouldCancel = event.key === 'Escape';

        const shouldFinish = shouldSave || shouldCancel;

        if (shouldFinish) {
          event.preventDefault();

          finish(shouldCancel);
        }
      }}
    />
  );
}
