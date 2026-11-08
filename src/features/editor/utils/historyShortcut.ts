import type { HistoryKeyEvent, HistoryCommand } from '../types/interaction';

/** 키 입력 → Undo/Redo 명령 */
export function historyShortcut(
  event: HistoryKeyEvent,
  editingText: boolean,
): HistoryCommand {
  const shouldIgnoreShortcut = blocksHistoryShortcut(event, editingText);

  if (shouldIgnoreShortcut) {
    return null;
  }

  const key = event.key.toLowerCase();
  const isUndoKey = key === 'z';

  if (isUndoKey) {
    return zCommand(event.shiftKey);
  }

  const isRedoKey = key === 'y' && event.ctrlKey && !event.shiftKey;

  if (isRedoKey) {
    return 'redo';
  }

  return null;
}

function zCommand(shiftKey: boolean): HistoryCommand {
  return shiftKey ? 'redo' : 'undo';
}

function blocksHistoryShortcut(event: HistoryKeyEvent, editingText: boolean) {
  const hasModifier = event.ctrlKey || event.metaKey;

  return editingText || event.altKey || !hasModifier;
}
