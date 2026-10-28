import type { SlideElement } from '../types/project';

export const SLIDE_ELEMENTS: SlideElement[] = ['device', 'title', 'subtitle'];
export const ELEMENT_LABELS = {
  title: '제목',
  subtitle: '부제목',
  device: '기기 화면',
};

export const PREVIEW_MIN_ZOOM = 0.5;
export const PREVIEW_MAX_ZOOM = 2.5;
export const PREVIEW_ZOOM_STEP = 0.25;
export const PREVIEW_DEFAULT_ZOOM = 1;
export const ARROW_DIRECTIONS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};
