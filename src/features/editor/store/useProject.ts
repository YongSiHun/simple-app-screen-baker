import { create } from 'zustand';
import {
  DEFAULT_PROJECT_NAME,
  DEFAULT_PRESET_ID,
  DEFAULT_DESIGN,
} from '../constants/defaults.ts';
import type { ProjectState } from '../types/store';
import { releaseUnused } from '../services/images.ts';
import * as changes from '../utils/projectChanges.ts';
import {
  snapshot,
  usedImageIds,
  recordHistoryChange,
  finishHistoryEdit,
  cancelHistoryEdit,
  undoHistoryEdit,
  redoHistoryEdit,
} from './projectHistory.ts';
import type { ProjectHistory, ProjectSnapshot } from '../types/history';
export { usedImageIds } from './projectHistory.ts';
/**
 * 현재 프로젝트와 편집 이력에서 사용하지 않는 이미지를 해제합니다.
 */
function collect(state: ProjectHistory) {
  releaseUnused(usedImageIds(state));
}

const first = changes.createSlide();
/**
 * 프로젝트 편집 상태와 실행 취소 가능한 변경 작업을 제공합니다.
 */
export const useProject = create<ProjectState>((set, get) => {
  /**
   * 편집 이력을 갱신하고 이미지 참조를 정리합니다.
   */
  const updateHistory = (
    update: (state: ProjectState) => Partial<ProjectHistory>,
  ) =>
    set((state) => {
      const patch = update(state);
      collect({ ...state, ...patch });

      return patch;
    });
  /**
   * 프로젝트 변경을 실행 취소 가능한 작업으로 적용합니다.
   */
  const commit = (update: (state: ProjectState) => Partial<ProjectSnapshot>) =>
    updateHistory((state) => recordHistoryChange(state, update(state)));

  return {
    project: {
      id: crypto.randomUUID(),
      name: DEFAULT_PROJECT_NAME,
      design: { ...DEFAULT_DESIGN },
      slides: [first],
    },
    selectedId: first.id,
    presetId: DEFAULT_PRESET_ID,
    past: [],
    future: [],
    transaction: null,
    /**
     * 프로젝트와 편집 이력에서 참조하지 않는 이미지를 정리합니다.
     */
    collectImages: () => collect(get()),
    /**
     * 연속 편집을 하나의 실행 취소 작업으로 묶기 시작합니다.
     */
    beginEdit: () =>
      set((state) =>
        state.transaction ? {} : { transaction: snapshot(state) },
      ),
    /**
     * 연속 편집을 하나의 이력으로 확정합니다.
     */
    endEdit: () => updateHistory(finishHistoryEdit),
    /**
     * 진행 중인 연속 편집을 취소합니다.
     */
    cancelEdit: () => updateHistory(cancelHistoryEdit),
    /**
     * 직전 편집 작업을 되돌립니다.
     */
    undo: () => updateHistory(undoHistoryEdit),
    /**
     * 실행 취소한 편집 작업을 다시 적용합니다.
     */
    redo: () => updateHistory(redoHistoryEdit),
    /**
     * 현재 슬라이드의 전체 위치를 초기화합니다.
     */
    resetPositions: (id) =>
      commit((state) => changes.resetSlidePositions(state, id)),
    /**
     * 편집할 슬라이드를 선택합니다.
     */
    select: (selectedId) => set({ selectedId }),
    /**
     * 편집 내용을 유지하며 출력 기기만 변경합니다.
     */
    setPreset: (presetId) => set({ presetId }),
    /**
     * 프로젝트 공통 디자인을 변경합니다.
     */
    design: (patch) => commit((state) => changes.updateDesign(state, patch)),
    /**
     * 선택한 슬라이드의 문구를 변경합니다.
     */
    text: (id, patch) =>
      commit((state) => changes.updateText(state, id, patch)),
    /**
     * 선택한 컴포넌트의 위치를 변경합니다.
     */
    position: (id, element, position) =>
      commit((state) => changes.updatePosition(state, id, element, position)),
    /**
     * 빈 슬라이드를 추가합니다.
     */
    add: () => commit(changes.addSlide),
    /**
     * 업로드한 이미지를 슬라이드에 연결합니다.
     */
    attach: (ids, kind) =>
      commit((state) => changes.attachScreenshots(state, ids, kind)),
    /**
     * 지정한 슬라이드를 삭제하고 편집 이력에 기록합니다.
     */
    remove: (id) => commit((state) => changes.removeSlide(state, id)),
    /**
     * 지정한 슬라이드를 복제합니다.
     */
    duplicate: (id) => commit((state) => changes.duplicateSlide(state, id)),
    /**
     * 지정한 슬라이드의 순서를 변경합니다.
     */
    move: (id, delta) => commit((state) => changes.moveSlide(state, id, delta)),
  };
});
