import type { Project } from './project';

export interface ProjectSnapshot {
  project: Project;
  selectedId: string;
}

export interface ProjectHistory extends ProjectSnapshot {
  past: ProjectSnapshot[];
  future: ProjectSnapshot[];
  transaction: ProjectSnapshot | null;
}
