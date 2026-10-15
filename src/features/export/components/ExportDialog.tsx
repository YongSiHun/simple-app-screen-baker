import { useRef, useState } from 'react';
import type { Project, OutputPreset, Slide } from '../../editor/types/project';
import { PRESETS } from '../constants/presets';
import { exportZip, png, save } from '../services/export';
import { Icon } from '../../../core/components/Icons';
export function ExportDialog({
  project,
  slide,
  preset,
  onClose,
  onBusy,
}: {
  project: Project;
  slide: Slide;
  preset: OutputPreset;
  onClose: () => void;
  onBusy: (busy: boolean) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);
  const [selected, setSelected] = useState([preset.id]);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const busy = Boolean(progress);
  const chosen = PRESETS.filter((p) => selected.includes(p.id));
  const missing = chosen.reduce(
    (count, p) =>
      count + project.slides.filter((s) => !s.images[p.device]).length,
    0,
  );
  async function download(zip: boolean) {
    if (lock.current) return;
    lock.current = true;
    onBusy(true);
    setProgress('준비 중');
    setError('');
    setDone('');
    try {
      if (zip) {
        const skipped = await exportZip(project, chosen, setProgress);
        setDone(
          'ZIP 다운로드 완료' +
            (skipped ? ' · 원본 없는 ' + skipped + '개 제외' : ''),
        );
      } else {
        await new Promise<void>((r) => setTimeout(r, 0));
        const bytes = await png(project, slide, preset);
        save(
          new Blob([new Uint8Array(bytes)], { type: 'image/png' }),
          'screenbaker-' +
            preset.platform +
            '-' +
            preset.folder +
            '-' +
            String(
              project.slides.findIndex((v) => v.id === slide.id) + 1,
            ).padStart(2, '0') +
            '.png',
        );
        setDone(
          'PNG 다운로드 완료 · ' +
            preset.width +
            ' × ' +
            preset.height +
            ' · RGB 24-bit',
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '다운로드에 실패했습니다.');
    } finally {
      setProgress('');
      lock.current = false;
      onBusy(false);
    }
  }
  return (
    <dialog
      ref={(el) => {
        ref.current = el;
        if (el && !el.open) el.showModal();
      }}
      onCancel={(e) => {
        if (busy) e.preventDefault();
        else onClose();
      }}
      aria-labelledby="export-title"
      className="export-dialog"
    >
      <div className="dialog-heading">
        <h2 id="export-title">스크린샷 다운로드</h2>
        <button
          className="icon-button"
          aria-label="닫기"
          onClick={onClose}
          disabled={busy}
        >
          <Icon name="close" />
        </button>
      </div>
      <p>출력은 실제 해상도에서 새로 렌더링하고 RGB PNG를 검증합니다.</p>
      <h3>현재 스크린샷</h3>
      <button
        className="button full"
        disabled={busy || !slide.images[preset.device]}
        onClick={() => void download(false)}
      >
        <Icon name="download" /> PNG 다운로드{' '}
        <small>
          {preset.width} × {preset.height}
        </small>
      </button>
      {!slide.images[preset.device] && (
        <p className="notice">이 규격의 기기용 원본 이미지가 필요합니다.</p>
      )}
      <h3>전체 스크린샷 ZIP</h3>
      <div className="preset-checkboxes">
        {PRESETS.map((p) => (
          <label key={p.id}>
            <input
              type="checkbox"
              disabled={busy}
              checked={selected.includes(p.id)}
              onChange={(e) =>
                setSelected(
                  e.target.checked
                    ? [...selected, p.id]
                    : selected.filter((v) => v !== p.id),
                )
              }
            />
            <span>
              {p.platform === 'google-play'
                ? 'Google Play'
                : p.platform === 'mac-app-store'
                  ? 'Mac App Store'
                  : 'App Store'}{' '}
              · {p.label}
              <small>
                {p.width} × {p.height}
              </small>
            </span>
          </label>
        ))}
      </div>
      {missing > 0 && (
        <p className="notice">
          원본 이미지가 없는 {missing}개 출력은 ZIP에서 제외됩니다.
        </p>
      )}
      <button
        className="button secondary full"
        disabled={busy || !selected.length}
        onClick={() => void download(true)}
      >
        ZIP 일괄 다운로드
      </button>
      <div role="status" aria-live="polite">
        {progress && <p className="notice">{progress}…</p>}
        {done && <p className="success">✓ {done}</p>}
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </dialog>
  );
}
