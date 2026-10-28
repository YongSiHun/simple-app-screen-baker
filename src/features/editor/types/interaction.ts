import type { SlideElement, ElementPosition } from './project';

export interface SlideDragState {
  element: SlideElement;
  pointer: number;
  x: number;
  y: number;
  width: number;
  height: number;
  original?: ElementPosition;
}

export interface SlideSelection {
  slideId: string;
  element: SlideElement;
}

export interface HistoryKeyEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

export type HistoryCommand = 'undo' | 'redo' | null;
