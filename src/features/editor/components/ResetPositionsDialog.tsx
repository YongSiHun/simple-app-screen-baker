import { useLayoutEffect, useRef } from 'react';
import type { ResetPositionsDialogProps } from '../types/components';
/**
 * 전체 위치 초기화 여부를 확인합니다.
 */
export function ResetPositionsDialog({
  onConfirm,
  onClose,
}: ResetPositionsDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const element = dialog.current;
    const shouldOpenDialog = element !== null && !element.open;

    if (shouldOpenDialog) {
      element.showModal();
    }

    return () => {
      const isDialogOpen = element?.open === true;

      if (isDialogOpen) {
        element.close();
      }
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="reset-dialog"
      aria-labelledby="reset-position-title"
      aria-describedby="reset-position-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <h2 id="reset-position-title">모든 위치를 초기화할까요?</h2>
      <p id="reset-position-description">
        현재 슬라이드의 제목·부제목·기기 화면을 기본 위치로 되돌립니다. 초기화
        후 Ctrl+Z로 복구할 수 있습니다.
      </p>
      <div className="reset-dialog-actions">
        <button className="button secondary small" autoFocus onClick={onClose}>
          취소
        </button>
        <button className="button small" onClick={onConfirm}>
          초기화
        </button>
      </div>
    </dialog>
  );
}
