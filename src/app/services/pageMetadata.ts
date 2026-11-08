import { PAGE_DESCRIPTIONS, PAGE_TITLES } from '../constants/pages';
import { structuredDataJson } from '../../features/info/structuredData';
import {
  readCanonicalUrl,
  updateBasicMetadata,
  updateCanonicalMetadata,
} from '../../core/data/documentMetadata';

/** Resolves route metadata; browser document writes stay in the data adapter. */
export function syncPageMetadata(pathname: string) {
  const pagePath = pathname.replace(/\/+$/, '') || '/';
  const title =
    (PAGE_TITLES[pagePath] ?? '앱 스크린샷을 가장 간단하게') +
    ' | Simple App Screen Baker';
  const description = PAGE_DESCRIPTIONS[pagePath] ?? PAGE_DESCRIPTIONS['/'];
  updateBasicMetadata(title, description);
  const canonical = readCanonicalUrl();
  const hasNoCanonical = !canonical;

  if (hasNoCanonical) {
    return;
  }

  const canonicalPath = pagePath === '/editor' ? '/' : pagePath;
  const url = new URL(canonicalPath, canonical);
  updateCanonicalMetadata(
    url.href,
    structuredDataJson(canonicalPath, url.origin),
  );
}
