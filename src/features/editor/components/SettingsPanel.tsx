import type { DeviceKind, OutputPreset } from '../types/project';
import { ScreenshotUpload } from './ScreenshotUpload';
import {
  TemplateSettings,
  TextSettings,
  StyleSettings,
} from './SettingsSections';
interface SettingsPanelProps {
  kind: DeviceKind;
  preset: OutputPreset;
  onUploading: (busy: boolean) => void;
}
/**
 * 업로드·템플릿·문구·스타일 설정을 구성합니다.
 */
export function SettingsPanel({
  kind,
  preset,
  onUploading,
}: SettingsPanelProps) {
  return (
    <aside className="settings-panel">
      <div className="panel-heading">
        <h2>디자인 설정</h2>
        <span>프로젝트 공통</span>
      </div>
      <ScreenshotUpload kind={kind} preset={preset} onUploading={onUploading} />
      <TemplateSettings />
      <TextSettings />
      <StyleSettings kind={kind} />
    </aside>
  );
}
