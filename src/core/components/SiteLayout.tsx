import { Link, NavLink, Outlet } from 'react-router';
import { SiteCredits } from './SiteCredits';
/** 편집기 복귀 링크 */
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

/** 안내 페이지 공통 헤더·푸터 */
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
      <nav className="content-nav shell" aria-label="제작 도움말">
        <NavLink to="/guide">사용 방법</NavLink>
        <NavLink to="/guides">제작 팁</NavLink>
        <NavLink to="/requirements">플랫폼 규격</NavLink>
        <NavLink to="/faq">FAQ</NavLink>
        <NavLink to="/about">서비스 소개</NavLink>
      </nav>
      <Outlet />
      <footer className="site-footer shell">
        <div>
          <Brand />
          <p>작은 앱의 큰 시작을 돕습니다.</p>
        </div>
        <div className="footer-links">
          <Link to="/about">서비스 소개</Link>
          <Link to="/guide">사용 가이드</Link>
          <Link to="/guides">제작 팁</Link>
          <Link to="/requirements">플랫폼 규격</Link>
          <Link to="/faq">FAQ</Link>
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
