import type { TemplateId } from '../../editor/types/project';
export const TEMPLATES: {
  id: TemplateId;
  name: string;
  description: string;
}[] = [
  {
    id: 'top',
    name: 'Top Headline',
    description: '설명은 위에, 앱 화면은 크게',
  },
  {
    id: 'center',
    name: 'Centered Device',
    description: '기기를 먼저, 메시지는 아래에',
  },
  { id: 'frameless', name: 'Frameless', description: '프레임 없이 깔끔하게' },
];
