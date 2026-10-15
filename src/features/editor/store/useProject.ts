import { create } from 'zustand';
import type {
  Project,
  ProjectDesign,
  Slide,
  DeviceKind,
} from '../types/project';
import { releaseUnused } from '../services/images';
const newSlide = (): Slide => ({
  id: crypto.randomUUID(),
  title: '앱의 매력을\n한눈에 보여주세요',
  subtitle: '당신의 아이디어가 더 빛날 수 있도록.',
  images: {},
});
const first = newSlide();
interface State {
  project: Project;
  selectedId: string;
  presetId: string;
  select: (id: string) => void;
  setPreset: (id: string) => void;
  setName: (name: string) => void;
  design: (patch: Partial<ProjectDesign>) => void;
  text: (id: string, patch: Partial<Pick<Slide, 'title' | 'subtitle'>>) => void;
  add: () => void;
  attach: (ids: string[], kind: DeviceKind) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  move: (id: string, delta: number) => void;
}
function collect(project: Project) {
  releaseUnused(
    new Set(project.slides.flatMap((s) => Object.values(s.images))),
  );
}
export const useProject = create<State>((set) => ({
  project: {
    id: crypto.randomUUID(),
    name: '나의 첫 프로젝트',
    design: {
      template: 'top',
      background: '#EAF0FF',
      textColor: '#0F172A',
      font: 'Pretendard',
      weight: 800,
      frame: 'auto',
      frameColor: '#111827',
    },
    slides: [first],
  },
  selectedId: first.id,
  presetId: 'iphone',
  select: (selectedId) => set({ selectedId }),
  setPreset: (presetId) => set({ presetId }),
  setName: (name) => set((s) => ({ project: { ...s.project, name } })),
  design: (patch) =>
    set((s) => ({
      project: { ...s.project, design: { ...s.project.design, ...patch } },
    })),
  text: (id, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((v) =>
          v.id === id ? { ...v, ...patch } : v,
        ),
      },
    })),
  add: () =>
    set((s) => {
      const slide = newSlide();
      return {
        project: { ...s.project, slides: [...s.project.slides, slide] },
        selectedId: slide.id,
      };
    }),
  attach: (ids, kind) =>
    set((s) => {
      const slides = s.project.slides.map((v) => ({
        ...v,
        images: { ...v.images },
      }));
      ids.forEach((id, i) => {
        if (i === 0) {
          const slide = slides.find((v) => v.id === s.selectedId);
          if (slide) slide.images[kind] = id;
        } else {
          const slide = newSlide();
          slide.images[kind] = id;
          slides.push(slide);
        }
      });
      const project = { ...s.project, slides };
      collect(project);
      return { project };
    }),
  remove: (id) =>
    set((s) => {
      let slides = s.project.slides.filter((v) => v.id !== id);
      if (!slides.length) slides = [newSlide()];
      const project = { ...s.project, slides };
      collect(project);
      return {
        project,
        selectedId: s.selectedId === id ? slides[0].id : s.selectedId,
      };
    }),
  duplicate: (id) =>
    set((s) => {
      const i = s.project.slides.findIndex((v) => v.id === id);
      if (i < 0) return {};
      const slide = {
        ...s.project.slides[i],
        id: crypto.randomUUID(),
        images: { ...s.project.slides[i].images },
      };
      const slides = [...s.project.slides];
      slides.splice(i + 1, 0, slide);
      return { project: { ...s.project, slides }, selectedId: slide.id };
    }),
  move: (id, delta) =>
    set((s) => {
      const slides = [...s.project.slides];
      const i = slides.findIndex((v) => v.id === id),
        j = i + delta;
      if (i < 0 || j < 0 || j >= slides.length) return {};
      [slides[i], slides[j]] = [slides[j], slides[i]];
      return { project: { ...s.project, slides } };
    }),
}));
