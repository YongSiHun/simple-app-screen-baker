export type DeviceKind = 'phone' | 'tablet' | 'pc';
export type TemplateId = 'top' | 'center' | 'frameless';
export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  images: Partial<Record<DeviceKind, string>>;
}
export interface ProjectDesign {
  template: TemplateId;
  background: string;
  textColor: string;
  font: 'Pretendard';
  weight: 600 | 800;
  frame: 'auto' | DeviceKind;
  frameColor: string;
}
export interface Project {
  id: string;
  name: string;
  design: ProjectDesign;
  slides: Slide[];
}
export interface OutputPreset {
  id: string;
  platform: 'app-store' | 'mac-app-store' | 'google-play';
  device: DeviceKind;
  label: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  folder: string;
}
