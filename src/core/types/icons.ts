export type IconName =
  | 'arrow'
  | 'upload'
  | 'download'
  | 'plus'
  | 'check'
  | 'lock'
  | 'layers'
  | 'image'
  | 'close';

export interface IconProps {
  name: IconName;
  size?: number;
}
