import { useEffect } from 'react';
import { useProject } from '../store/useProject';
import { historyShortcut } from '../utils/historyShortcut';
/**
 * 텍스트 입력과 모달을 방해하지 않고 실행 취소 단축키를 연결합니다.
 */
export function useHistoryShortcuts(disabled: boolean) {
  useEffect(() => {
    /**
     * 사용 가능한 실행 취소·다시 실행 단축키를 처리합니다.
     */
    function onKeyDown(event: KeyboardEvent) {
      const shouldIgnoreShortcut =
        event.defaultPrevented ||
        disabled ||
        document.querySelector('dialog[open]') !== null;

      if (shouldIgnoreShortcut) {
        return;
      }

      const editingText =
        event.target instanceof Element &&
        Boolean(
          event.target.closest(
            'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
          ),
        );
      const command = historyShortcut(event, editingText);
      const hasNoCommand = !command;

      if (hasNoCommand) {
        return;
      }

      event.preventDefault();
      useProject.getState()[command]();
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [disabled]);
}
