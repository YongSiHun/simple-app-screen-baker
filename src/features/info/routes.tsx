import {
  AboutPage,
  GuidePage,
  PrivacyPage,
  TermsPage,
} from './screens/InfoPage';
import {
  FaqPage,
  GuidesPage,
  GuideArticlePage,
  RequirementsPage,
} from './screens/ContentPages';
export const INFO_ROUTES = [
  { path: '/about', element: <AboutPage /> },
  { path: '/guide', element: <GuidePage /> },
  { path: '/guides', element: <GuidesPage /> },
  { path: '/guides/:slug', element: <GuideArticlePage /> },
  { path: '/requirements', element: <RequirementsPage /> },
  { path: '/faq', element: <FaqPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/terms', element: <TermsPage /> },
];
