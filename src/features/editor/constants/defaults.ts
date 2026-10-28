import type { ProjectDesign } from '../types/project';

export const DEFAULT_PROJECT_NAME = '나의 첫 프로젝트';
export const DEFAULT_PRESET_ID = 'iphone';
export const DEFAULT_SLIDE_TITLE = '앱의 매력을\n한눈에 보여주세요';
export const DEFAULT_SLIDE_SUBTITLE = '당신의 아이디어가 더 빛날 수 있도록.';
export const DEFAULT_DESIGN: ProjectDesign = {
  template: 'top',
  background: '#EAF0FF',
  textColor: '#0F172A',
  font: 'Pretendard',
  weight: 800,
  frame: 'auto',
  frameColor: '#111827',
};

export const BACKGROUND_SWATCHES = [
  '#EAF0FF',
  '#F8FAFC',
  '#FFF4DE',
  '#DCF3EC',
  '#0F172A',
];
