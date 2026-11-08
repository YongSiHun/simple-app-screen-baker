import type { DeviceKind, ProjectDesign } from '../../editor/types/project';

/** 자동 프레임 → 출력 기기 */
export function resolveFrame(
  frame: ProjectDesign['frame'],
  device: DeviceKind,
): DeviceKind {
  return frame === 'auto' ? device : frame;
}
