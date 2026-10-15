import { useRef, useState } from 'react';
import type { Project, OutputPreset, Slide } from '../../editor/types/project';
import { PRESETS } from '../constants/presets';
import { createExportPlan } from '../services/plan';
import { getImage, getSlideImage } from '../../editor/services/images';
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
  const plan = createExportPlan(project.slides, PRESETS, (id) =>
    Boolean(getImage(id)),
  );
  const chosenPlan = createExportPlan(project.slides, chosen, (id) =>
    Boolean(getImage(id)),
  );
  const missing = chosenPlan.missing;
  const currentImage = getSlideImage(slide, preset.device);
  const frameLabels = { phone: '스마트폰', tablet: '태블릿', pc: 'PC' };
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
            (skipped ? ' · 이미지 없는 ' + skipped + '개 제외' : ''),
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
        disabled={busy || !currentImage}
        onClick={() => void download(false)}
      >
        <Icon name="download" /> PNG 다운로드{' '}
        <small>
          {preset.width} × {preset.height}
        </small>
      </button>
      {!currentImage && (
        <p className="notice">먼저 이 슬라이드에 스크린샷을 업로드해주세요.</p>
      )}
      {currentImage?.reused && (
        <p className="notice">
          업로드한 화면을 이 규격에 재사용합니다. 원본 비율은 유지돼요.
        </p>
      )}
      <h3>전체 스크린샷 ZIP</h3>
      <p className="field-help">
        스크린샷 한 장으로 모든 규격을 만들어요. 기기별 화면이 있으면 우선
        적용합니다.
      </p>
      <p className="export-summary" role="status">
        선택한 {chosen.length}개 규격에서 {chosenPlan.jobs.length}개 파일 생성
      </p>
      {project.design.frame !== 'auto' && (
        <p className="notice">
          현재 {frameLabels[project.design.frame]} 프레임이 모든 규격에 고정
          적용됩니다. 기기별 외형이 필요하면 에디터의 기기 프레임을 ‘출력 기기에
          맞춤’으로 선택해주세요.
        </p>
      )}
      <div className="preset-checkboxes">
        {plan.availability.map(
          ({ preset: p, available, reused, missing: unavailable }) => (
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
              <span className="preset-option-copy">
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
                <span
                  className={
                    'preset-availability' + (available ? '' : ' missing')
                  }
                >
                  {available
                    ? available + '개 생성 가능'
                    : '스크린샷 업로드 필요'}
                  {reused > 0 ? ' · ' + reused + '개 화면 재사용' : ''}
                  {available > 0 && unavailable > 0
                    ? ' · ' + unavailable + '개 이미지 없음'
                    : ''}
                </span>
              </span>
            </label>
          ),
        )}
      </div>
      {missing > 0 && (
        <div className="export-missing" role="status">
          <p>이미지가 없는 슬라이드의 {missing}개 출력은 ZIP에서 제외됩니다.</p>
          <ul>
            {chosenPlan.availability
              .filter((entry) => entry.missing > 0)
              .map((entry) => (
                <li key={entry.preset.id}>
                  {entry.preset.label}: {entry.missing}개 제외
                </li>
              ))}
          </ul>
          <p>
            빈 슬라이드에 이미지를 올리거나 삭제해주세요. 스크린샷 한 장만
            등록해도 스마트폰·태블릿·PC 규격에 모두 사용할 수 있어요.
          </p>
        </div>
      )}
      <button
        className="button secondary full"
        disabled={busy || !chosenPlan.jobs.length}
        onClick={() => void download(true)}
      >
        ZIP 일괄 다운로드 · {chosenPlan.jobs.length}개 파일
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
