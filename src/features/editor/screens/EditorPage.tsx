import { useState } from 'react';
import { Link } from 'react-router';
import { Brand } from '../../../core/components/SiteLayout';
import { Icon } from '../../../core/components/Icons';
import { useProject } from '../store/useProject';
import { PRESETS } from '../../export/constants/presets';
import { PreviewPanel } from '../components/PreviewPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { SlideList } from '../components/SlideList';
import { ExportDialog } from '../../export/components/ExportDialog';
export function EditorPage() {
  const { project, selectedId, presetId, setPreset } = useProject();
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const slide = project.slides.find((s) => s.id === selectedId)!;
  return (
    <div className="editor">
      <a href="#main-content" className="skip-link">
        본문으로 건너뛰기
      </a>
      <header className="editor-header">
        <Brand />
        <Link className="editor-guide" to="/guide">
          사용 가이드 ↗
        </Link>
        <label className="preset-select">
          <span className="sr-only">출력 규격</span>
          <select
            aria-label="출력 규격"
            value={presetId}
            disabled={exporting || uploading}
            onChange={(e) => setPreset(e.target.value)}
          >
            {PRESETS.map((p) => (
              <option value={p.id} key={p.id}>
                {p.platform === 'google-play'
                  ? 'Google Play'
                  : p.platform === 'mac-app-store'
                    ? 'Mac App Store'
                    : 'App Store'}{' '}
                · {p.label} ({p.width} × {p.height})
              </option>
            ))}
          </select>
        </label>
        <button
          className="button small"
          disabled={exporting || uploading}
          onClick={() => setExportOpen(true)}
        >
          <Icon name="download" size={17} /> 다운로드
        </button>
      </header>
      <div className="editor-note">
        <span>
          <Icon name="lock" size={13} /> 브라우저에서만 처리됩니다.
        </span>
        <span>새로고침하면 작업이 사라져요. 완료 후 다운로드해주세요.</span>
      </div>
      <fieldset disabled={exporting || uploading} className="editor-workspace">
        <SettingsPanel kind={preset.device} onUploading={setUploading} />
        <main id="main-content" className="editor-main">
          <div className="workspace-title">
            <div>
              <span className="section-kicker">
                YOUR NEXT GREAT FIRST IMPRESSION
              </span>
              <h1>작은 화면, 멋진 첫인상.</h1>
            </div>
            <span className="workspace-badge">
              <i /> 작업 중
            </span>
          </div>
          {preset.platform === 'google-play' && preset.device !== 'phone' && (
            <p className="store-notice">
              Google Play 대형 화면은 앱 외 설명 문구를 제외하도록 안내합니다.
              제출 전 제목·부제목을 비우고 Frameless 템플릿을 사용해주세요. 최소
              4장의 앱 화면을 준비하세요.
            </p>
          )}
          <PreviewPanel
            key={preset.id + ':' + project.design.frame}
            preset={preset}
            design={project.design}
            slide={slide}
          />
          <SlideList kind={preset.device} />
        </main>
      </fieldset>
      {exportOpen && (
        <ExportDialog
          project={project}
          slide={slide}
          preset={preset}
          onClose={() => setExportOpen(false)}
          onBusy={setExporting}
        />
      )}
    </div>
  );
}
