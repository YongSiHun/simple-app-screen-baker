import { createId } from '../../../core/utils/createId.ts';
import {
  DEFAULT_SLIDE_TITLE,
  DEFAULT_SLIDE_SUBTITLE,
} from '../constants/defaults.ts';
import type {
  Project,
  ProjectDesign,
  Slide,
  DeviceKind,
  SlideElement,
  ElementPosition,
} from '../types/project';
import type { ProjectSnapshot } from '../types/history';

/** 기본 문구의 빈 슬라이드 생성 */
export function createSlide(): Slide {
  return {
    id: createId(),
    title: DEFAULT_SLIDE_TITLE,
    subtitle: DEFAULT_SLIDE_SUBTITLE,
    images: {},
  };
}

/** 원본 유지 · 지정 슬라이드 갱신 */
function updateSlide(
  project: Project,
  id: string,
  update: (slide: Slide) => Slide,
): Project {
  return {
    ...project,
    slides: project.slides.map((slide) =>
      slide.id === id ? update(slide) : slide,
    ),
  };
}

/** 현재 슬라이드 전체 위치 리셋 */
export function resetSlidePositions(
  state: ProjectSnapshot,
  id: string,
): Partial<ProjectSnapshot> {
  const slide = state.project.slides.find((slide) => slide.id === id);
  const hasMovedElements = Object.values(slide?.positions ?? {}).some(
    (position) => (position?.x ?? 0) !== 0 || (position?.y ?? 0) !== 0,
  );
  const hasNoMovedElements = !hasMovedElements;

  if (hasNoMovedElements) {
    return {};
  }

  return {
    project: updateSlide(state.project, id, (slide) => ({
      ...slide,
      positions: undefined,
    })),
  };
}

/** 변경 디자인만 반영 */
export function updateDesign(
  state: ProjectSnapshot,
  patch: Partial<ProjectDesign>,
): Partial<ProjectSnapshot> {
  const isUnchanged = Object.entries(patch).every(
    ([key, value]) =>
      state.project.design[key as keyof ProjectDesign] === value,
  );

  if (isUnchanged) {
    return {};
  }

  return {
    project: {
      ...state.project,
      design: { ...state.project.design, ...patch },
    },
  };
}

/** 변경 제목·부제만 반영 */
export function updateText(
  state: ProjectSnapshot,
  id: string,
  patch: Partial<Pick<Slide, 'title' | 'subtitle'>>,
): Partial<ProjectSnapshot> {
  const slide = state.project.slides.find((slide) => slide.id === id);
  const hasNoSlide = slide === undefined;

  if (hasNoSlide) {
    return {};
  }

  const isUnchanged = Object.entries(patch).every(
    ([key, value]) => slide[key as 'title' | 'subtitle'] === value,
  );

  if (isUnchanged) {
    return {};
  }

  return {
    project: updateSlide(state.project, id, (slide) => ({
      ...slide,
      ...patch,
    })),
  };
}

/** 기본 좌표 제거 · 이동 좌표만 보관 */
function updateElementPositions(
  slide: Slide,
  element: SlideElement,
  position?: ElementPosition,
) {
  const positions = { ...slide.positions };
  const isDefaultPosition = !position || (!position.x && !position.y);

  if (isDefaultPosition) {
    delete positions[element];

    return Object.keys(positions).length > 0 ? positions : undefined;
  }

  positions[element] = position;

  return positions;
}

/** 선택 요소 좌표만 갱신 */
export function updatePosition(
  state: ProjectSnapshot,
  id: string,
  element: SlideElement,
  position?: ElementPosition,
): Partial<ProjectSnapshot> {
  const current = state.project.slides.find((slide) => slide.id === id)
    ?.positions?.[element];
  const isUnchanged = samePosition(current, position);

  if (isUnchanged) {
    return {};
  }

  return {
    project: updateSlide(state.project, id, (slide) => ({
      ...slide,
      positions: updateElementPositions(slide, element, position),
    })),
  };
}

/** 빈 슬라이드 추가·선택 */
export function addSlide(state: ProjectSnapshot): Partial<ProjectSnapshot> {
  const slide = createSlide();

  return {
    project: { ...state.project, slides: [...state.project.slides, slide] },
    selectedId: slide.id,
  };
}

/** 첫 이미지 → 현재 슬라이드 · 나머지 → 신규 */
export function attachScreenshots(
  state: ProjectSnapshot,
  ids: string[],
  kind: DeviceKind,
): Partial<ProjectSnapshot> {
  const hasNoImages = ids.length === 0;

  if (hasNoImages) {
    return {};
  }

  const slides = [...state.project.slides];
  attachToSelected(slides, state.selectedId, ids[0], kind);
  const additions = ids
    .slice(1)
    .map((imageId) => ({ ...createSlide(), images: { [kind]: imageId } }));
  slides.push(...additions);

  return { project: { ...state.project, slides } };
}

/** 슬라이드 삭제 · 최소 1장 유지 */
export function removeSlide(
  state: ProjectSnapshot,
  id: string,
): Partial<ProjectSnapshot> {
  let slides = state.project.slides.filter((slide) => slide.id !== id);
  const hasNoSlides = slides.length === 0;

  if (hasNoSlides) {
    slides = [createSlide()];
  }

  return {
    project: { ...state.project, slides },
    selectedId: state.selectedId === id ? slides[0].id : state.selectedId,
  };
}

/** 이미지 참조·문구 유지 복제 */
export function duplicateSlide(
  state: ProjectSnapshot,
  id: string,
): Partial<ProjectSnapshot> {
  const index = state.project.slides.findIndex((slide) => slide.id === id);
  const hasNoSlide = index < 0;

  if (hasNoSlide) {
    return {};
  }

  const original = state.project.slides[index];
  const duplicate = {
    ...original,
    id: createId(),
    images: { ...original.images },
  };
  const slides = [...state.project.slides];
  slides.splice(index + 1, 0, duplicate);

  return { project: { ...state.project, slides }, selectedId: duplicate.id };
}

/** 범위 내 슬라이드 재정렬 */
export function moveSlide(
  state: ProjectSnapshot,
  id: string,
  delta: number,
): Partial<ProjectSnapshot> {
  const slides = [...state.project.slides];
  const currentIndex = slides.findIndex((slide) => slide.id === id);
  const targetIndex = currentIndex + delta;
  const isOutOfBounds =
    currentIndex < 0 || targetIndex < 0 || targetIndex >= slides.length;

  if (isOutOfBounds) {
    return {};
  }

  [slides[currentIndex], slides[targetIndex]] = [
    slides[targetIndex],
    slides[currentIndex],
  ];

  return { project: { ...state.project, slides } };
}

function samePosition(current?: ElementPosition, next?: ElementPosition) {
  const x = current?.x ?? 0;
  const y = current?.y ?? 0;

  return x === (next?.x ?? 0) && y === (next?.y ?? 0);
}

function attachToSelected(
  slides: Slide[],
  selectedId: string,
  imageId: string,
  kind: DeviceKind,
) {
  const index = slides.findIndex((slide) => slide.id === selectedId);
  const hasNoSelectedSlide = index < 0;

  if (hasNoSelectedSlide) {
    return;
  }

  const slide = slides[index];
  slides[index] = { ...slide, images: { ...slide.images, [kind]: imageId } };
}
