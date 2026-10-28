/**
 * 사이트의 저작권과 연락처를 표시합니다.
 */
export function SiteCredits() {
  return (
    <span className="site-credits">
      <span>
        © {new Date().getFullYear()} Simple App Screen Baker. All rights
        reserved.
      </span>
      <a href="mailto:tlgns7386@gmail.com">tlgns7386@gmail.com</a>
    </span>
  );
}
