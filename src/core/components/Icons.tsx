import type { IconProps } from '../types/icons';
import { ICON_PATHS } from '../constants/icons';

/**
 * 이름에 맞는 공통 SVG 아이콘을 표시합니다.
 */
export function Icon({ name, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
