import type { Project } from '../types/project';
import type { ProjectSnapshot, ProjectHistory } from '../types/history';
import { HISTORY_LIMIT } from '../constants/history.ts';
/**
 * 실행 취소에 필요한 프로젝트와 선택 상태를 보관합니다.
 */
export const snapshot = (state: ProjectSnapshot): ProjectSnapshot => ({
  project: state.project,
  selectedId: state.selectedId,
});
/**
 * 최대 보관 개수를 지키며 편집 이력을 추가합니다.
 */
function appendSnapshot(history: ProjectSnapshot[], entry: ProjectSnapshot) {
  return [...history, entry].slice(-HISTORY_LIMIT);
}

/** Add a project's image references without allocating flattened arrays. */
function collectProjectImages(project: Project, used: Set<string>) {
  for (const slide of project.slides) {
    for (const id of Object.values(slide.images)) {
      used.add(id);
    }
  }
}

/**
 * 현재 프로젝트와 복구 가능한 이력에서 사용하는 이미지를 모읍니다.
 */
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

/**
 * 실제 프로젝트 변경만 실행 취소 이력에 기록합니다.
 */
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

/**
 * 드래그나 연속 입력을 하나의 실행 취소 작업으로 확정합니다.
 */
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

/**
 * 진행 중인 편집을 이력에 남기지 않고 되돌립니다.
 */
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

/**
 * 직전 편집 상태를 복구하고 현재 상태를 다시 실행 이력에 넣습니다.
 */
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

/**
 * 실행 취소한 편집 상태를 다시 적용합니다.
 */
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
