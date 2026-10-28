import type { OutputPreset, Slide } from '../../editor/types/project';

export interface ExportJob {
  preset: OutputPreset;
  slide: Slide;
  index: number;
}

export interface PresetAvailability {
  preset: OutputPreset;
  available: number;
  reused: number;
  missing: number;
}

export interface ExportPlan {
  jobs: ExportJob[];
  availability: PresetAvailability[];
  missing: number;
}

export type ExportFormat = 'zip' | 'png';
