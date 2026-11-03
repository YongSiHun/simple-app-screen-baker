import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { ContentLink } from '../types/content';

export function InfoLink({ href, label }: ContentLink) {
  const isPageLink = href.startsWith('/') && !href.startsWith('/fonts/');

  if (isPageLink) {
    return <Link to={href}>{label}</Link>;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {label} <span aria-hidden="true">↗</span>
    </a>
  );
}

export function Breadcrumbs({ items }: { items: ContentLink[] }) {
  return (
    <nav className="content-breadcrumbs" aria-label="현재 위치">
      <ol>
        <li>
          <Link to="/">제작 도구</Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href}>
            {index === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link to={item.href}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ContentLayout({
  title,
  description,
  kicker,
  children,
  breadcrumbs,
}: {
  title: string;
  description: string;
  kicker: string;
  children: ReactNode;
  breadcrumbs?: ContentLink[];
}) {
  return (
    <main id="main-content" className="document-page shell">
      <Breadcrumbs items={breadcrumbs ?? [{ label: title, href: '#' }]} />
      <span className="section-kicker">{kicker}</span>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
      {children}
    </main>
  );
}

export function ToolLink() {
  return (
    <div className="content-tool-link">
      <p>준비한 화면으로 스크린샷을 만들어보세요.</p>
      <Link to="/" className="button">
        제작 도구 열기 →
      </Link>
    </div>
  );
}
