import type { Project } from '../types/project';
import type { ProjectSnapshot, ProjectHistory } from '../types/history';
import { HISTORY_LIMIT } from '../constants/history.ts';
/** 프로젝트·선택 상태 스냅샷 */
export const snapshot = (state: ProjectSnapshot): ProjectSnapshot => ({
  project: state.project,
  selectedId: state.selectedId,
});
/** 이력 추가 · 보관 상한 적용 */
function appendSnapshot(history: ProjectSnapshot[], entry: ProjectSnapshot) {
  return [...history, entry].slice(-HISTORY_LIMIT);
}

const projectImages = new WeakMap<Project, ReadonlySet<string>>();

/** 불변 프로젝트별 이미지 참조 캐시 · 드래그 프레임 간 재사용 */
function imageIdsFor(project: Project): ReadonlySet<string> {
  const cached = projectImages.get(project);

  if (cached) {
    return cached;
  }

  const ids = new Set(
    project.slides.flatMap((slide) => Object.values(slide.images)),
  );
  projectImages.set(project, ids);

  return ids;
}

function collectProjectImages(project: Project, used: Set<string>) {
  for (const id of imageIdsFor(project)) {
    used.add(id);
  }
}

/** 현재·Undo/Redo 이력의 이미지 ID 수집 */
export function usedImageIds(
  state: Pick<ProjectHistory, 'project' | 'past' | 'future' | 'transaction'>,
) {
  const projects = new Set([
    state.project,
    ...state.past.map((entry) => entry.project),
    ...state.future.map((entry) => entry.project),
  ]);
  const transaction = state.transaction;
  const hasTransaction = transaction !== null;

  if (hasTransaction) {
    projects.add(transaction.project);
  }

  const used = new Set<string>();

  for (const project of projects) {
    collectProjectImages(project, used);
  }

  return used;
}

/** 실제 변경만 이력 기록 */
export function recordHistoryChange(
  state: ProjectHistory,
  patch: Partial<ProjectSnapshot>,
): Partial<ProjectHistory> {
  const hasNoProjectChange = !patch.project || patch.project === state.project;

  if (hasNoProjectChange) {
    return {};
  }

  return {
    ...patch,
    past: state.transaction
      ? state.past
      : appendSnapshot(state.past, snapshot(state)),
    future: state.transaction ? state.future : [],
  };
}

/** 연속 편집 → Undo 1회 확정 */
export function finishHistoryEdit(
  state: ProjectHistory,
): Partial<ProjectHistory> {
  const transaction = state.transaction;
  const hasNoTransaction = transaction === null;

  if (hasNoTransaction) {
    return {};
  }

  const hasChanged =
    JSON.stringify(state.project) !== JSON.stringify(transaction.project);

  return {
    transaction: null,
    past: hasChanged ? appendSnapshot(state.past, transaction) : state.past,
    future: hasChanged ? [] : state.future,
  };
}

/** 연속 편집 취소 · 이력 미추가 */
export function cancelHistoryEdit(
  state: ProjectHistory,
): Partial<ProjectHistory> {
  const transaction = state.transaction;
  const hasNoTransaction = transaction === null;

  if (hasNoTransaction) {
    return {};
  }

  return { ...transaction, transaction: null };
}

/** Undo · 현재 상태는 Redo로 이동 */
export function undoHistoryEdit(
  state: ProjectHistory,
): Partial<ProjectHistory> {
  const hasTransaction = state.transaction !== null;

  if (hasTransaction) {
    return cancelHistoryEdit(state);
  }

  const previous = state.past.at(-1);
  const hasNoPrevious = previous === undefined;

  if (hasNoPrevious) {
    return {};
  }

  return {
    ...previous,
    past: state.past.slice(0, -1),
    future: appendSnapshot(state.future, snapshot(state)),
  };
}

/** Redo 적용 */
export function redoHistoryEdit(
  state: ProjectHistory,
): Partial<ProjectHistory> {
  const hasTransaction = state.transaction !== null;

  if (hasTransaction) {
    return {};
  }

  const next = state.future.at(-1);
  const hasNoNext = next === undefined;

  if (hasNoNext) {
    return {};
  }

  return {
    ...next,
    past: appendSnapshot(state.past, snapshot(state)),
    future: state.future.slice(0, -1),
  };
}
