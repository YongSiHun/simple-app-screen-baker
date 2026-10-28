import { Link, NavLink, Outlet } from 'react-router';
import { SiteCredits } from './SiteCredits';
/**
 * 편집기로 돌아가는 브랜드 링크를 표시합니다.
 */
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Simple App Screen Baker 홈">
      <img src="/logo.svg" alt="" width="40" height="40" />
      <span>
        Simple App{' '}
        <strong>
          Screen Baker<span className="brand-dot">.</span>
        </strong>
      </span>
    </Link>
  );
}

/**
 * 안내 페이지의 공통 헤더와 푸터를 구성합니다.
 */
export function SiteLayout() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        본문으로 건너뛰기
      </a>
      <header className="site-header">
        <div className="shell nav-inner">
          <Brand />
          <nav aria-label="메인 메뉴">
            <NavLink to="/guide">사용 가이드</NavLink>
            <Link to="/editor" className="button small">
              에디터 열기 <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="site-footer shell">
        <div>
          <Brand />
          <p>작은 앱의 큰 시작을 돕습니다.</p>
        </div>
        <div className="footer-links">
          <Link to="/guide">사용 가이드</Link>
          <Link to="/privacy">개인정보처리방침</Link>
          <Link to="/terms">이용약관</Link>
        </div>
        <small>
          <SiteCredits />
        </small>
      </footer>
    </>
  );
}
