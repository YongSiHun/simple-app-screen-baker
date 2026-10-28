import type {
  ProjectDesign,
  Slide,
  DeviceKind,
  SlideElement,
  ElementPosition,
} from './project';
import type { ProjectHistory } from './history';

export interface ProjectState extends ProjectHistory {
  presetId: string;
  beginEdit: () => void;
  endEdit: () => void;
  cancelEdit: () => void;
  undo: () => void;
  redo: () => void;
  resetPositions: (id: string) => void;
  collectImages: () => void;
  select: (id: string) => void;
  setPreset: (id: string) => void;
  design: (patch: Partial<ProjectDesign>) => void;
  text: (id: string, patch: Partial<Pick<Slide, 'title' | 'subtitle'>>) => void;
  position: (
    id: string,
    element: SlideElement,
    position?: ElementPosition,
  ) => void;
  add: () => void;
  attach: (ids: string[], kind: DeviceKind) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  move: (id: string, delta: number) => void;
}
