import { createId } from '../../../core/utils/createId.ts';
import { create } from 'zustand';
import {
  DEFAULT_PROJECT_NAME,
  DEFAULT_PRESET_ID,
  DEFAULT_DESIGN,
} from '../constants/defaults.ts';
import type { ProjectState } from '../types/store';
import { releaseUnused } from '../services/images.ts';
import * as changes from '../services/projectChanges.ts';
import {
  snapshot,
  usedImageIds,
  recordHistoryChange,
  finishHistoryEdit,
  cancelHistoryEdit,
  undoHistoryEdit,
  redoHistoryEdit,
} from '../services/projectHistory.ts';
import type { ProjectHistory, ProjectSnapshot } from '../types/history';
export { usedImageIds } from '../services/projectHistory.ts';
/** 미참조 이미지 해제 */
function collect(state: ProjectHistory) {
  releaseUnused(usedImageIds(state));
}

const first = changes.createSlide();
/** 편집 상태·Undo/Redo 작업 */
export const useProject = create<ProjectState>((set, get) => {
  /** 이력 갱신·이미지 GC */
  const updateHistory = (
    update: (state: ProjectState) => Partial<ProjectHistory>,
  ) =>
    set((state) => {
      const patch = update(state);
      collect({ ...state, ...patch });

      return patch;
    });
  /** 변경 커밋·이력 기록 */
  const commit = (update: (state: ProjectState) => Partial<ProjectSnapshot>) =>
    updateHistory((state) => recordHistoryChange(state, update(state)));

  return {
    project: {
      id: createId(),
      name: DEFAULT_PROJECT_NAME,
      design: { ...DEFAULT_DESIGN },
      slides: [first],
    },
    selectedId: first.id,
    presetId: DEFAULT_PRESET_ID,
    past: [],
    future: [],
    transaction: null,
    /** 미참조 이미지 GC */
    collectImages: () => collect(get()),
    /** 연속 편집 묶음 시작 */
    beginEdit: () =>
      set((state) =>
        state.transaction ? {} : { transaction: snapshot(state) },
      ),
    /** 연속 편집 확정 */
    endEdit: () => updateHistory(finishHistoryEdit),
    /** 연속 편집 취소 */
    cancelEdit: () => updateHistory(cancelHistoryEdit),
    /** Undo */
    undo: () => updateHistory(undoHistoryEdit),
    /** Redo */
    redo: () => updateHistory(redoHistoryEdit),
    /** 현재 슬라이드 전체 위치 리셋 */
    resetPositions: (id) =>
      commit((state) => changes.resetSlidePositions(state, id)),
    /** 슬라이드 선택 */
    select: (selectedId) => set({ selectedId }),
    /** 출력 기기만 변경 */
    setPreset: (presetId) => set({ presetId }),
    /** 공통 디자인 변경 */
    design: (patch) => commit((state) => changes.updateDesign(state, patch)),
    /** 슬라이드 문구 변경 */
    text: (id, patch) =>
      commit((state) => changes.updateText(state, id, patch)),
    /** 선택 요소 위치 변경 */
    position: (id, element, position) =>
      commit((state) => changes.updatePosition(state, id, element, position)),
    /** 빈 슬라이드 추가 */
    add: () => commit(changes.addSlide),
    /** 업로드 이미지 연결 */
    attach: (ids, kind) =>
      commit((state) => changes.attachScreenshots(state, ids, kind)),
    /** 슬라이드 삭제·이력 기록 */
    remove: (id) => commit((state) => changes.removeSlide(state, id)),
    /** 슬라이드 복제 */
    duplicate: (id) => commit((state) => changes.duplicateSlide(state, id)),
    /** 슬라이드 재정렬 */
    move: (id, delta) => commit((state) => changes.moveSlide(state, id, delta)),
  };
});
