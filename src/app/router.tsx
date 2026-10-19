import {
  createBrowserRouter,
  Link,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router';
import { useEffect } from 'react';
import { SiteLayout } from '../core/components/SiteLayout';
import { EditorPage } from '../features/editor/screens/EditorPage';
import {
  GuidePage,
  PrivacyPage,
  TermsPage,
} from '../features/info/screens/InfoPage';
/**
 * 경로가 바뀌면 페이지 제목과 스크롤 위치를 갱신합니다.
 */
function Root() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const names: Record<string, string> = {
      '/': '스크린샷 에디터',
      '/editor': '스크린샷 에디터',
      '/guide': '사용 가이드',
      '/privacy': '개인정보처리방침',
      '/terms': '이용약관',
    };
    document.title =
      (names[pathname] ?? '앱 스크린샷을 가장 간단하게') +
      ' | Simple App Screen Baker';
  }, [pathname]);

  return <Outlet />;
}

/**
 * 페이지 로딩 오류와 복귀 링크를 표시합니다.
 */
function ErrorPage() {
  return (
    <main className="document-page shell">
      <h1>페이지를 불러오지 못했습니다</h1>
      <p>
        새로고침 후 다시 시도해주세요. 현재 탭의 편집 내용은 새로고침하면
        사라집니다.
      </p>
      <Link to="/" className="button">
        홈으로 이동
      </Link>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          { path: '/guide', element: <GuidePage /> },
          { path: '/privacy', element: <PrivacyPage /> },
          { path: '/terms', element: <TermsPage /> },
          {
            path: '*',
            element: (
              <main className="document-page shell">
                <h1>페이지를 찾을 수 없습니다</h1>
                <Link to="/" className="button">
                  홈으로 돌아가기
                </Link>
              </main>
            ),
          },
        ],
      },
      { path: '/', element: <EditorPage /> },
      { path: '/editor', element: <Navigate to="/" replace /> },
    ],
  },
]);
