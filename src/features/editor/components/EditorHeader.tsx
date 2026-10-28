import { Link } from 'react-router';
import { Brand } from '../../../core/components/SiteLayout';
import { Icon } from '../../../core/components/Icons';
import { PRESETS } from '../../export/constants/presets';
import type { EditorHeaderProps } from '../types/components';
/**
 * 출력 기기 선택과 ZIP·PNG 다운로드 버튼을 표시합니다.
 */
export function EditorHeader({
  presetId,
  busy,
  canDownloadZip,
  canDownloadPng,
  setPreset,
  download,
}: EditorHeaderProps) {
  return (
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
          disabled={busy}
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
      <div
        className="download-actions"
        role="group"
        aria-label="현재 기기로 다운로드"
      >
        <button
          className="button small"
          disabled={busy || !canDownloadZip}
          onClick={() => void download('zip')}
          title="현재 기기의 전체 슬라이드를 ZIP으로 다운로드"
        >
          <Icon name="download" size={17} /> ZIP 다운로드 (전체 슬라이드)
        </button>
        <button
          className="button secondary small"
          disabled={busy || !canDownloadPng}
          onClick={() => void download('png')}
          title="현재 선택한 슬라이드를 PNG로 다운로드"
        >
          <Icon name="download" size={17} /> PNG 다운로드 (현재 슬라이드)
        </button>
      </div>
    </header>
  );
}
