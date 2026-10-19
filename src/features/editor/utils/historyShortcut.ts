/**
 * 키 입력을 실행 취소·다시 실행 명령으로 해석합니다.
 */
export function historyShortcut(
  event: {
    key: string;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
  },
  editingText: boolean,
): 'undo' | 'redo' | null {
  const shouldIgnoreShortcut =
    editingText || event.altKey || (!event.ctrlKey && !event.metaKey);

  if (shouldIgnoreShortcut) {
    return null;
  }

  const key = event.key.toLowerCase();
  const isUndoKey = key === 'z';

  if (isUndoKey) {
    return event.shiftKey ? 'redo' : 'undo';
  }

  const isRedoKey = key === 'y' && event.ctrlKey && !event.shiftKey;

  if (isRedoKey) {
    return 'redo';
  }

  return null;
}
