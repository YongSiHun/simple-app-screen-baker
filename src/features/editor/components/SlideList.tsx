import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useProject } from '../store/useProject';
import { getSlideImage } from '../services/images';
import { Icon } from '../../../core/components/Icons';
import type { DeviceKindProps } from '../types/components';
import type { DeviceKind, Slide } from '../types/project';
import type { ProjectState } from '../types/store';

type Actions = Pick<ProjectState, 'select' | 'move' | 'duplicate' | 'remove'>;
type SlideItemProps = Pick<Slide, 'id' | 'title' | 'images'> & {
  index: number;
  count: number;
  selected: boolean;
  kind: DeviceKind;
  actions: Actions;
};

/** 행 props는 표시 내용만 전달 · 드래그 좌표 제외 */
const SlideItem = memo(function SlideItem({
  id,
  title,
  images,
  index,
  count,
  selected,
  kind,
  actions,
}: SlideItemProps) {
  const image = getSlideImage({ images }, kind);

  return (
    <div className={'slide-item ' + (selected ? 'active' : '')}>
      <button
        className="slide-select"
        aria-pressed={selected}
        onClick={() => actions.select(id)}
      >
        <span className="slide-number">
          {String(index + 1).padStart(2, '0')}
        </span>
        {image ? (
          <img src={image.url} alt={'스크린샷 ' + (index + 1)} />
        ) : (
          <span className="thumbnail-empty">
            <Icon name="image" />
          </span>
        )}
        <span className="slide-title">{title || '제목 없음'}</span>
      </button>
      <div className="slide-actions">
        <button
          aria-label={index + 1 + '번 앞으로 이동'}
          disabled={index === 0}
          onClick={() => actions.move(id, -1)}
        >
          ←
        </button>
        <button
          aria-label={index + 1 + '번 뒤로 이동'}
          disabled={index === count - 1}
          onClick={() => actions.move(id, 1)}
        >
          →
        </button>
        <button onClick={() => actions.duplicate(id)}>복제</button>
        <button onClick={() => actions.remove(id)}>삭제</button>
      </div>
    </div>
  );
});

export const SlideList = memo(function SlideList({ kind }: DeviceKindProps) {
  const { slides, selectedId, add } = useProject(
    useShallow((state) => ({
      slides: state.project.slides,
      selectedId: state.selectedId,
      add: state.add,
    })),
  );
  const actions = useProject(
    useShallow((state) => ({
      select: state.select,
      move: state.move,
      duplicate: state.duplicate,
      remove: state.remove,
    })),
  );

  return (
    <section className="slides-panel" aria-label="스크린샷 목록">
      <div className="slides-heading">
        <h2>
          스크린샷 <span>{slides.length}</span>
        </h2>
        <span>이미지마다 다른 이야기를 담아보세요</span>
        <button className="text-button" onClick={add}>
          <Icon name="plus" size={16} /> 이미지 추가
        </button>
      </div>
      <div className="slide-list">
        {slides.map(({ id, title, images }, index) => (
          <SlideItem
            key={id}
            id={id}
            title={title}
            images={images}
            index={index}
            count={slides.length}
            selected={id === selectedId}
            kind={kind}
            actions={actions}
          />
        ))}
        <button className="add-slide" onClick={add}>
          <Icon name="plus" size={24} />
          <span>새 스크린샷</span>
        </button>
      </div>
    </section>
  );
});
