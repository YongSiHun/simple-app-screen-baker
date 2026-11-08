import { useEffect } from 'react';
import { useProject } from '../store/useProject';
import { historyShortcut } from '../utils/historyShortcut';
/** 텍스트·모달 제외 Undo/Redo 키 연결 */
export function useHistoryShortcuts(disabled: boolean) {
  useEffect(() => {
    /** Undo/Redo 단축키 처리 */
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
