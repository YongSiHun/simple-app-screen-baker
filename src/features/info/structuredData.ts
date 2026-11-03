import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '../../app/constants/pages';
import { GUIDE_ARTICLES } from './data/guides';

export function structuredDataJson(
  pathname: string,
  origin?: string,
): string | undefined {
  const hasMetadata = Boolean(origin && PAGE_TITLES[pathname]);

  const isMissingMetadata = !hasMetadata;

  if (isMissingMetadata) {
    return undefined;
  }

  const url = origin + pathname;
  const article = GUIDE_ARTICLES.find(
    (item) => pathname === '/guides/' + item.slug,
  );
  const data: Record<string, unknown>[] = [];

  const isApplication = pathname === '/';

  if (isApplication) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Simple App Screen Baker',
      url,
      description: PAGE_DESCRIPTIONS['/'],
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web browser',
      isAccessibleForFree: true,
    });
  }

  if (article) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      datePublished: article.published,
      dateModified: article.updated,
      inLanguage: 'ko',
      mainEntityOfPage: url,
    });
  }

  const hasBreadcrumbs =
    pathname !== '/' &&
    pathname !== '/editor' &&
    pathname !== '/privacy' &&
    pathname !== '/terms';

  if (hasBreadcrumbs) {
    const items = [{ name: '제작 도구', item: origin + '/' }];

    if (article) {
      items.push({ name: '제작 팁', item: origin + '/guides' });
    }

    items.push({ name: PAGE_TITLES[pathname], item: url });
    data.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        ...item,
      })),
    });
  }

  const hasData = data.length > 0;

  return hasData ? JSON.stringify(data).replaceAll('<', '\\u003c') : undefined;
}
