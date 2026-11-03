import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router';
import { SiteLayout } from '../../core/components/SiteLayout';
import {
  AboutPage,
  GuidePage,
  PrivacyPage,
  TermsPage,
} from './screens/InfoPage';
import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '../../app/constants/pages';

export function renderInfoPages() {
  return Object.entries({
    '/about': AboutPage,
    '/guide': GuidePage,
    '/privacy': PrivacyPage,
    '/terms': TermsPage,
  }).map(([pathname, Page]) => ({
    pathname,
    title: PAGE_TITLES[pathname] + ' | Simple App Screen Baker',
    description: PAGE_DESCRIPTIONS[pathname],
    html: renderToStaticMarkup(
      <StaticRouter location={pathname}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path={pathname} element={<Page />} />
          </Route>
        </Routes>
      </StaticRouter>,
    ),
  }));
}
