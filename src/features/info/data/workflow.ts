import type { WorkflowStep } from '../types/content';
export const WORKFLOW: WorkflowStep[] = [
  {
    title: '실제 앱 화면 준비',
    instruction:
      '현재 배포할 기능이 보이는 PNG·JPEG·WebP를 준비하세요. 계정명·이메일·알림 등 개인정보는 캡처 전에 가리고, 사용할 권리가 있는 자료만 포함하세요.',
    check:
      '파일당 25MB·4천만 픽셀 이하. 한 번에 최대 20장까지 선택할 수 있습니다.',
  },
  {
    title: '이미지 업로드',
    instruction:
      '왼쪽 앱 스크린샷 영역을 클릭하거나 파일을 끌어 놓으세요. 여러 장이면 첫 파일은 현재 슬라이드에, 나머지는 새 슬라이드에 연결됩니다.',
    check:
      '미리보기에 화면이 보이는지 확인하세요. 이미지는 브라우저에서 처리합니다.',
  },
  {
    title: '출력 규격과 디바이스 프레임 선택',
    instruction:
      '상단에서 출력 기기를 고르고 왼쪽 기기 프레임을 선택하세요. 출력 기기에 맞춤은 외형을 자동 적용하고, Frameless 템플릿은 외곽 프레임을 숨깁니다.',
    check:
      '프레임 모양과 출력 크기는 서로 다른 설정입니다. 실제 저장 크기는 상단 출력 규격으로 결정됩니다.',
  },
  {
    title: '배경과 설명 문구 설정',
    instruction:
      'Top Headline·Centered Device·Frameless 중 템플릿을 고르고 배경색, 글자색과 굵기를 조절하세요. 제목과 부제목에는 한 슬라이드에 전달할 한 가지 이점만 적어보세요.',
    check:
      '템플릿·스타일은 프로젝트 공통, 제목·부제목은 슬라이드별로 적용됩니다.',
  },
  {
    title: '구성과 미리보기 점검',
    instruction:
      '미리보기의 문구나 기기를 선택해 드래그하거나 방향키로 위치를 조정하세요. Shift와 방향키를 함께 누르면 빠르게 움직입니다. 슬라이드는 추가·복제·순서 변경할 수 있습니다.',
    check:
      '출력 기기를 바꾸며 잘림과 줄바꿈을 확인하세요. 원본 비율을 유지해 화면을 채우므로 일부가 잘릴 수 있습니다.',
  },
  {
    title: 'PNG 또는 ZIP 다운로드',
    instruction:
      'PNG는 현재 선택한 슬라이드, ZIP은 현재 출력 기기의 전체 슬라이드를 저장합니다. ZIP 안에는 1.png, 2.png 순서로 들어가고 이미지 없는 슬라이드는 제외됩니다.',
    check:
      '다운로드 파일을 열어 크기·문구·순서를 확인하세요. 작업은 탭 메모리에만 있으므로 새로고침 전에 저장하세요.',
  },
  {
    title: '스토어에 개별 이미지 등록',
    instruction:
      'ZIP은 먼저 압축을 풀고 PNG를 등록하세요. App Store Connect에서는 앱 버전의 Product Page Information에서 App Previews and Screenshots의 기기·언어 항목을 확인합니다. Google Play Console에서는 Main store listing의 Graphics 아래 기기별 항목에 등록합니다.',
    check:
      '이 서비스가 스토어로 대신 전송하지는 않습니다. 등록 후 순서와 언어, 기기별 필수 자료를 확인하고 각 스토어 절차에 따라 제출하세요.',
  },
];
