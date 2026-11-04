import { GUIDE_ARTICLES } from '../../features/info/data/guides';

export const PAGE_TITLES: Record<string, string> = {
  '/': '앱 스크린샷 PNG·ZIP 제작 도구',
  '/editor': '앱 스크린샷 PNG·ZIP 제작 도구',
  '/about': '서비스 소개',
  '/guide': '앱 스크린샷 사용 가이드',
  '/guides': '스크린샷 제작 팁',
  '/requirements': 'App Store·Google Play 플랫폼 규격',
  '/faq': '자주 묻는 질문',
  ...Object.fromEntries(
    GUIDE_ARTICLES.map((article) => ['/guides/' + article.slug, article.title]),
  ),
  '/privacy': '개인정보처리방침',
  '/terms': '이용약관',
};
export const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/': '브라우저에서 앱 스크린샷을 업로드하고 템플릿과 설명 문구를 편집해 PNG 또는 ZIP으로 다운로드하세요.',
  '/about':
    '앱 화면에 문구와 디자인을 더해 소개 이미지를 만들어보세요. 무료로 이용할 수 있는 Simple App Screen Baker를 소개합니다.',
  '/guide':
    '앱 화면 준비부터 디자인과 문구 편집, 완성 이미지 저장과 스토어 등록까지 순서대로 안내합니다.',
  '/guides':
    '어떤 화면을 고르고 문구를 어떻게 쓸지 고민될 때 참고할 앱 소개 이미지 제작 팁을 모았습니다.',
  '/requirements':
    'App Store와 Google Play에 필요한 이미지 크기와 수량, 이 도구에서 만들 수 있는 크기를 확인하세요.',
  '/faq':
    '무료 이용, 이미지 보관과 다운로드, 홍보 이미지 사용에 관해 자주 묻는 질문에 답해드립니다.',
  ...Object.fromEntries(
    GUIDE_ARTICLES.map((article) => [
      '/guides/' + article.slug,
      article.description,
    ]),
  ),
  '/privacy':
    '편집에 사용하는 이미지와 문구, 사이트 접속 정보와 광고 관련 정보가 어떻게 처리되는지 안내합니다.',
  '/terms':
    '서비스 이용 범위와 자료의 사용 권한, 완성한 이미지의 이용 조건과 문의 방법을 안내합니다.',
};

export const INFO_PAGE_PATHS = Object.keys(PAGE_TITLES).filter(
  (path) => path !== '/' && path !== '/editor',
);
