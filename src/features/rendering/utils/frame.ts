import type { DeviceKind, ProjectDesign } from '../../editor/types/project';

export function resolveFrame(
  frame: ProjectDesign['frame'],
  device: DeviceKind,
): DeviceKind {
  return frame === 'auto' ? device : frame;
}
