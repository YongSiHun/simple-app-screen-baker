import type { KeyboardEvent, Dispatch, SetStateAction } from 'react';
import type { ExportFormat } from '../../export/types/plan';
import type {
  DeviceKind,
  OutputPreset,
  ProjectDesign,
  Slide,
  SlideElement,
} from './project';

export interface EditorHeaderProps {
  presetId: string;
  busy: boolean;
  canDownloadZip: boolean;
  canDownloadPng: boolean;
  setPreset: (id: string) => void;
  download: (format: ExportFormat) => Promise<void>;
}

export interface EditorStatusProps {
  hasExportableSlides: boolean;
  missing: number;
  progress: string;
  done: string;
  error: string;
}

export interface SettingsPanelProps {
  kind: DeviceKind;
  preset: OutputPreset;
  onUploading: (busy: boolean) => void;
}

export interface PreviewToolbarProps {
  disabled: boolean;
  selected: SlideElement | null;
  onSelect: (element: SlideElement) => void;
  keyMove: (
    event: KeyboardEvent<HTMLButtonElement>,
    element: SlideElement,
  ) => void;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
  canUndo: boolean;
  canRedo: boolean;
  hasPositions: boolean;
  undo: () => void;
  redo: () => void;
  onReset: () => void;
}

export interface PreviewPanelProps {
  preset: OutputPreset;
  design: ProjectDesign;
  slide: Slide;
  disabled?: boolean;
}

export interface ResetPositionsDialogProps {
  onConfirm: () => void;
  onClose: () => void;
}

export interface DeviceKindProps {
  kind: DeviceKind;
}

export type ScreenshotUploadProps = SettingsPanelProps;
