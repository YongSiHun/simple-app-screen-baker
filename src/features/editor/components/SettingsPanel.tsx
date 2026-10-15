import { useRef, useState } from 'react';
import type { DeviceKind, ProjectDesign } from '../types/project';
import { useProject } from '../store/useProject';
import { getSlideImage, loadImage, releaseUnused } from '../services/images';
import { TEMPLATES } from '../../templates/definitions/templates';
import { Icon } from '../../../core/components/Icons';
const labels: Record<DeviceKind, string> = {
  phone: '스마트폰',
  tablet: '태블릿',
  pc: 'PC',
};
export function SettingsPanel({
  kind,
  onUploading,
}: {
  kind: DeviceKind;
  onUploading: (busy: boolean) => void;
}) {
  const { project, selectedId, design, text, attach } = useProject();
  const slide = project.slides.find((s) => s.id === selectedId)!;
  const d = project.design;
  const image = getSlideImage(slide, kind);
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function upload(files: FileList | null) {
    if (!files || busy) return;
    setBusy(true);
    onUploading(true);
    setError('');
    const ids: string[] = [];
    const errors: string[] = [];
    try {
      for (const file of Array.from(files)) {
        try {
          ids.push(await loadImage(file));
        } catch (e) {
          errors.push(e instanceof Error ? e.message : '업로드 오류');
        }
      }
      if (ids.length) attach(ids, kind);
      if (errors.length) setError(errors.join(' '));
    } finally {
      const used = new Set(
        useProject
          .getState()
          .project.slides.flatMap((s) => Object.values(s.images)),
      );
      releaseUnused(used);
      setBusy(false);
      onUploading(false);
      if (input.current) input.current.value = '';
    }
  }
  return (
    <aside className="settings-panel">
      <div className="panel-heading">
        <h2>디자인 설정</h2>
        <span>프로젝트 공통</span>
      </div>
      <section>
        <h3>
          <span>01</span> 앱 스크린샷
        </h3>
        <button
          className={'upload-zone ' + (drag ? 'dragging' : '')}
          disabled={busy}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            void upload(e.dataTransfer.files);
          }}
        >
          <span className="upload-icon">
            <Icon name="upload" size={23} />
          </span>
          <b>{busy ? '이미지 읽는 중…' : '클릭 또는 드래그하여 업로드'}</b>
          <small>PNG, JPEG, WebP · 파일당 최대 25MB</small>
          <em>
            {image?.reused
              ? labels[image.device] +
                ' 화면 재사용 중 · ' +
                labels[kind] +
                ' 전용 화면 추가 가능'
              : image
                ? labels[kind] + ' 화면 교체 · 여러 장 선택 가능'
                : '한 장으로 모든 기기 규격 생성 · 여러 장 선택 가능'}
          </em>
        </button>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          hidden
          onChange={(e) => void upload(e.target.files)}
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <p className="field-help">
          다른 기기용 화면이 없으면 업로드한 이미지를 비율 유지해 재사용해요.
        </p>
        <p className="field-help">
          <Icon name="lock" size={12} /> 이미지는 내 브라우저에만 머물러요.
        </p>
      </section>
      <section>
        <h3>
          <span>02</span> 템플릿
        </h3>
        <div className="template-options">
          {TEMPLATES.map((t, i) => (
            <button
              key={t.id}
              title={t.description}
              className={d.template === t.id ? 'selected' : ''}
              aria-pressed={d.template === t.id}
              onClick={() => design({ template: t.id })}
            >
              <div className={'template-diagram t-' + t.id}>
                <i />
                <i />
                <b />
              </div>
              <span>
                {String.fromCharCode(65 + i)}. {t.name}
              </span>
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3>
          <span>03</span> 메시지 <small>현재 이미지</small>
        </h3>
        <label className="field">
          제목 <span>{slide.title.length}/120</span>
          <textarea
            rows={2}
            maxLength={120}
            value={slide.title}
            onChange={(e) => text(slide.id, { title: e.target.value })}
          />
        </label>
        <label className="field">
          부제목 <span>{slide.subtitle.length}/180</span>
          <textarea
            rows={2}
            maxLength={180}
            value={slide.subtitle}
            placeholder="앱의 가치를 한 문장으로 소개하세요"
            onChange={(e) => text(slide.id, { subtitle: e.target.value })}
          />
        </label>
        <p className="field-help">
          문구 길이에 맞춰 줄바꿈과 크기가 자동 조절됩니다.
        </p>
      </section>
      <section>
        <h3>
          <span>04</span> 스타일
        </h3>
        <div className="color-fields">
          <label className="field">
            배경색
            <div className="color-input">
              <input
                type="color"
                aria-label="배경색"
                value={d.background}
                onChange={(e) => design({ background: e.target.value })}
              />
              <span>{d.background.toUpperCase()}</span>
            </div>
          </label>
          <label className="field">
            글자색
            <div className="color-input">
              <input
                type="color"
                aria-label="글자색"
                value={d.textColor}
                onChange={(e) => design({ textColor: e.target.value })}
              />
              <span>{d.textColor.toUpperCase()}</span>
            </div>
          </label>
        </div>
        <div className="swatches">
          {['#EAF0FF', '#F8FAFC', '#FFF4DE', '#DCF3EC', '#0F172A'].map(
            (color) => (
              <button
                key={color}
                style={{ background: color }}
                aria-label={'배경색 ' + color}
                aria-pressed={d.background === color}
                onClick={() => design({ background: color })}
              />
            ),
          )}
        </div>
        <div className="two-fields">
          <label className="field">
            폰트
            <select
              value={d.font}
              onChange={() => design({ font: 'Pretendard' })}
            >
              <option>Pretendard</option>
            </select>
          </label>
          <label className="field">
            굵기
            <select
              value={d.weight}
              onChange={(e) =>
                design({ weight: Number(e.target.value) as 600 | 800 })
              }
            >
              <option value="800">ExtraBold</option>
              <option value="600">SemiBold</option>
            </select>
          </label>
        </div>
        <div className="two-fields">
          <label className="field">
            기기 프레임
            <select
              value={d.frame}
              onChange={(e) =>
                design({ frame: e.target.value as ProjectDesign['frame'] })
              }
            >
              <option value="auto">출력 기기에 맞춤</option>
              {Object.entries(labels).map(([id, label]) => (
                <option value={id} key={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            프레임 색상
            <select
              value={d.frameColor}
              onChange={(e) => design({ frameColor: e.target.value })}
            >
              <option value="#111827">Black</option>
              <option value="#FFFFFF">White</option>
            </select>
          </label>
        </div>
        <p className="field-help">
          기본 프레임은 출력 기기에 맞춰 적용돼요. 원하는 외형을 직접 선택할
          수도 있어요.
        </p>
      </section>
    </aside>
  );
}
