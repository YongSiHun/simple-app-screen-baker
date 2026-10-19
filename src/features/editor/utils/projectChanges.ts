import type {
  Project,
  ProjectDesign,
  Slide,
  DeviceKind,
  SlideElement,
  ElementPosition,
} from '../types/project';
import type { ProjectSnapshot } from '../store/projectHistory';

/**
 * 기본 문구를 가진 빈 슬라이드를 생성합니다.
 */
export function createSlide(): Slide {
  return {
    id: crypto.randomUUID(),
    title: '앱의 매력을\n한눈에 보여주세요',
    subtitle: '당신의 아이디어가 더 빛날 수 있도록.',
    images: {},
  };
}

/**
 * 원본 프로젝트를 유지하며 지정한 슬라이드만 변경합니다.
 */
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

/**
 * 현재 슬라이드의 모든 컴포넌트를 기본 위치로 되돌립니다.
 */
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

/**
 * 달라진 디자인 설정만 프로젝트에 적용합니다.
 */
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

/**
 * 달라진 제목과 부제목만 해당 슬라이드에 적용합니다.
 */
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

/**
 * 기본 위치는 제거하고 이동한 컴포넌트의 위치만 보관합니다.
 */
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

/**
 * 선택한 컴포넌트의 위치를 다른 요소와 독립적으로 변경합니다.
 */
export function updatePosition(
  state: ProjectSnapshot,
  id: string,
  element: SlideElement,
  position?: ElementPosition,
): Partial<ProjectSnapshot> {
  const current = state.project.slides.find((slide) => slide.id === id)
    ?.positions?.[element];
  const isUnchanged =
    (current?.x ?? 0) === (position?.x ?? 0) &&
    (current?.y ?? 0) === (position?.y ?? 0);

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

/**
 * 빈 슬라이드를 추가하고 새 슬라이드를 선택합니다.
 */
export function addSlide(state: ProjectSnapshot): Partial<ProjectSnapshot> {
  const slide = createSlide();

  return {
    project: { ...state.project, slides: [...state.project.slides, slide] },
    selectedId: slide.id,
  };
}

/**
 * 첫 이미지는 현재 슬라이드에, 나머지는 새 슬라이드에 연결합니다.
 */
export function attachScreenshots(
  state: ProjectSnapshot,
  ids: string[],
  kind: DeviceKind,
): Partial<ProjectSnapshot> {
  const slides = state.project.slides.map((slide) => ({
    ...slide,
    images: { ...slide.images },
  }));
  ids.forEach((imageId, index) => {
    const isFirstImage = index === 0;

    if (isFirstImage) {
      const selectedSlide = slides.find(
        (slide) => slide.id === state.selectedId,
      );
      const hasSelectedSlide = selectedSlide !== undefined;

      if (hasSelectedSlide) {
        selectedSlide.images[kind] = imageId;
      }

      return;
    }

    const slide = createSlide();
    slide.images[kind] = imageId;
    slides.push(slide);
  });

  return { project: { ...state.project, slides } };
}

/**
 * 슬라이드를 삭제하되 프로젝트에 최소 한 장을 유지합니다.
 */
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

/**
 * 이미지 참조와 문구를 유지한 슬라이드 복사본을 만듭니다.
 */
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
    id: crypto.randomUUID(),
    images: { ...original.images },
  };
  const slides = [...state.project.slides];
  slides.splice(index + 1, 0, duplicate);

  return { project: { ...state.project, slides }, selectedId: duplicate.id };
}

/**
 * 목록 범위 안에서 슬라이드의 순서를 변경합니다.
 */
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
