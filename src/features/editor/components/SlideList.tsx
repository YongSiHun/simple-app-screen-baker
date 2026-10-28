import { useProject } from '../store/useProject';
import { getSlideImage } from '../services/images';
import { Icon } from '../../../core/components/Icons';
import type { DeviceKindProps } from '../types/components';
/**
 * 슬라이드 선택·추가·복제·정렬·삭제 도구를 표시합니다.
 */
export function SlideList({ kind }: DeviceKindProps) {
  const { project, selectedId, select, add, remove, duplicate, move } =
    useProject();

  return (
    <section className="slides-panel" aria-label="스크린샷 목록">
      <div className="slides-heading">
        <h2>
          스크린샷 <span>{project.slides.length}</span>
        </h2>
        <span>이미지마다 다른 이야기를 담아보세요</span>
        <button className="text-button" onClick={add}>
          <Icon name="plus" size={16} /> 이미지 추가
        </button>
      </div>
      <div className="slide-list">
        {project.slides.map((s, i) => {
          const image = getSlideImage(s, kind);

          return (
            <div
              className={'slide-item ' + (s.id === selectedId ? 'active' : '')}
              key={s.id}
            >
              <button
                className="slide-select"
                aria-pressed={s.id === selectedId}
                onClick={() => select(s.id)}
              >
                <span className="slide-number">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {image ? (
                  <img src={image.url} alt={'스크린샷 ' + (i + 1)} />
                ) : (
                  <span className="thumbnail-empty">
                    <Icon name="image" />
                  </span>
                )}
                <span className="slide-title">{s.title || '제목 없음'}</span>
              </button>
              <div className="slide-actions">
                <button
                  aria-label={i + 1 + '번 앞으로 이동'}
                  disabled={i === 0}
                  onClick={() => move(s.id, -1)}
                >
                  ←
                </button>
                <button
                  aria-label={i + 1 + '번 뒤로 이동'}
                  disabled={i === project.slides.length - 1}
                  onClick={() => move(s.id, 1)}
                >
                  →
                </button>
                <button onClick={() => duplicate(s.id)}>복제</button>
                <button onClick={() => remove(s.id)}>삭제</button>
              </div>
            </div>
          );
        })}
        <button className="add-slide" onClick={add}>
          <Icon name="plus" size={24} />
          <span>새 스크린샷</span>
        </button>
      </div>
    </section>
  );
}
