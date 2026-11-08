import type {
  OutputPreset,
  ProjectDesign,
  Slide,
  SlideElement,
} from '../types/project';
import type { layout } from '../../rendering/utils/layout';
import { PreviewTextEditor } from './PreviewTextEditor';

type Props = {
  slide: Slide;
  design: ProjectDesign;
  preset: OutputPreset;
  boxes: ReturnType<typeof layout>;
  width: number;
  zoom: number;
  editingElement: SlideElement | null;
  disabled: boolean;
  onClose: () => void;
};

function textScale(element: 'title' | 'subtitle', landscape: boolean) {
  const scales = { title: [0.075, 0.041], subtitle: [0.033, 0.018] };

  return scales[element][Number(landscape)];
}

export function PreviewTextOverlay({
  slide,
  design,
  preset,
  boxes,
  width,
  zoom,
  editingElement,
  disabled,
  onClose,
}: Props) {
  const cannotEdit =
    disabled || editingElement === null || editingElement === 'device';

  if (cannotEdit) {
    return null;
  }

  const box = boxes[editingElement];

  return (
    <PreviewTextEditor
      key={slide.id + ':' + editingElement}
      slide={slide}
      element={editingElement}
      design={design}
      onClose={onClose}
      style={{
        left: (box.x / preset.width) * 100 + '%',
        top: (box.y / preset.height) * 100 + '%',
        width: (box.width / preset.width) * 100 + '%',
        height: (box.height / preset.height) * 100 + '%',
        fontSize: width * zoom * textScale(editingElement, boxes.landscape),
        textAlign: boxes.landscape ? 'left' : 'center',
      }}
    />
  );
}
