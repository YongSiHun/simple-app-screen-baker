import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router';
import { SiteLayout } from '../../core/components/SiteLayout';
import { INFO_ROUTES } from './routes';
import {
  INFO_PAGE_PATHS,
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
} from '../../app/constants/pages';

export function renderInfoPages() {
  return INFO_PAGE_PATHS.map((pathname) => ({
    pathname,
    title: PAGE_TITLES[pathname] + ' | Simple App Screen Baker',
    description: PAGE_DESCRIPTIONS[pathname],
    html: renderToStaticMarkup(
      <StaticRouter location={pathname}>
        <Routes>
          <Route element={<SiteLayout />}>
            {INFO_ROUTES.map((route) => (
              <Route key={route.path} {...route} />
            ))}
          </Route>
        </Routes>
      </StaticRouter>,
    ),
  }));
}
