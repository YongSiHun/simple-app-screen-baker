import type { DeviceKind, ProjectDesign } from '../../editor/types/project';

/**
 * 자동 프레임 설정을 현재 출력 기기 종류로 해석합니다.
 */
export function resolveFrame(
  frame: ProjectDesign['frame'],
  device: DeviceKind,
): DeviceKind {
  return frame === 'auto' ? device : frame;
}
