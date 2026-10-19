import { useProject } from '../store/useProject';
import type { DeviceKind, ProjectDesign } from '../types/project';
import { TEMPLATES } from '../../templates/definitions/templates';
import { DEVICE_LABELS as labels } from '../constants/devices';
/**
 * 프로젝트에 적용할 템플릿을 선택합니다.
 */
export function TemplateSettings() {
  const { project, design } = useProject();
  const currentDesign = project.design;

  return (
    <section>
      <h3>
        <span>02</span> 템플릿
      </h3>
      <div className="template-options">
        {TEMPLATES.map((template, i) => (
          <button
            key={template.id}
            title={template.description}
            className={currentDesign.template === template.id ? 'selected' : ''}
            aria-pressed={currentDesign.template === template.id}
            onClick={() => design({ template: template.id })}
          >
            <div className={'template-diagram template-' + template.id}>
              <i />
              <i />
              <b />
            </div>
            <span>
              {String.fromCharCode(65 + i)}. {template.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * 현재 슬라이드의 제목과 부제목을 편집합니다.
 */
export function TextSettings() {
  const { project, selectedId, text } = useProject();
  const slide = project.slides.find((slide) => slide.id === selectedId)!;

  return (
    <section>
      <h3>
        <span>03</span> 메시지
      </h3>
      <label className="field">
        제목 <span>{slide.title.length}/120</span>
        <textarea
          rows={2}
          onFocus={() => useProject.getState().beginEdit()}
          onBlur={() => useProject.getState().endEdit()}
          maxLength={120}
          value={slide.title}
          onChange={(e) => text(slide.id, { title: e.target.value })}
        />
      </label>
      <label className="field">
        부제목 <span>{slide.subtitle.length}/180</span>
        <textarea
          rows={2}
          onFocus={() => useProject.getState().beginEdit()}
          onBlur={() => useProject.getState().endEdit()}
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
  );
}

/**
 * 색상·글꼴·기기 프레임 설정을 표시합니다.
 */
export function StyleSettings({ kind }: { kind: DeviceKind }) {
  const { project, design } = useProject();
  const currentDesign = project.design;

  return (
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
              value={currentDesign.background}
              onChange={(e) => design({ background: e.target.value })}
            />
            <span>{currentDesign.background.toUpperCase()}</span>
          </div>
        </label>
        <label className="field">
          글자색
          <div className="color-input">
            <input
              type="color"
              aria-label="글자색"
              value={currentDesign.textColor}
              onChange={(e) => design({ textColor: e.target.value })}
            />
            <span>{currentDesign.textColor.toUpperCase()}</span>
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
              aria-pressed={currentDesign.background === color}
              onClick={() => design({ background: color })}
            />
          ),
        )}
      </div>
      <div className="two-fields">
        <label className="field">
          폰트
          <select
            value={currentDesign.font}
            onChange={() => design({ font: 'Pretendard' })}
          >
            <option>Pretendard</option>
          </select>
        </label>
        <label className="field">
          굵기
          <select
            value={currentDesign.weight}
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
            value={currentDesign.frame}
            onChange={(e) =>
              design({ frame: e.target.value as ProjectDesign['frame'] })
            }
          >
            <option value="auto">출력 기기에 맞춤 ({labels[kind]})</option>
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
            value={currentDesign.frameColor}
            onChange={(e) => design({ frameColor: e.target.value })}
          >
            <option value="#111827">Black</option>
            <option value="#FFFFFF">White</option>
          </select>
        </label>
      </div>
      <p className="field-help">
        기본 프레임은 출력 기기에 맞춰 적용돼요. 원하는 외형을 직접 선택할 수도
        있어요.
      </p>
    </section>
  );
}
