import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '../../app/constants/pages';
import { GUIDE_ARTICLES } from './content/guides';

type Context = {
  pathname: string;
  origin: string;
  url: string;
  article: (typeof GUIDE_ARTICLES)[number] | undefined;
};
type StructuredData = Record<string, unknown>;
type DataBuilder = (context: Context) => StructuredData | undefined;

const applicationData: DataBuilder = ({ pathname, url }) => {
  const isNotApplication = pathname !== '/';

  if (isNotApplication) {
    return;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Simple App Screen Baker',
    url,
    description: PAGE_DESCRIPTIONS['/'],
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web browser',
    isAccessibleForFree: true,
  };
};

const articleData: DataBuilder = ({ article, url }) => {
  const hasNoArticle = !article;

  if (hasNoArticle) {
    return;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.published,
    dateModified: article.updated,
    inLanguage: 'ko',
    mainEntityOfPage: url,
  };
};

const breadcrumbData: DataBuilder = ({ pathname, origin, url, article }) => {
  const excludesBreadcrumbs = ['/', '/editor', '/privacy', '/terms'].includes(
    pathname,
  );

  if (excludesBreadcrumbs) {
    return;
  }

  const items = [{ name: '제작 도구', item: origin + '/' }];

  if (article) {
    items.push({ name: '제작 팁', item: origin + '/guides' });
  }

  items.push({ name: PAGE_TITLES[pathname], item: url });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      ...item,
    })),
  };
};

const builders: DataBuilder[] = [applicationData, articleData, breadcrumbData];

export function structuredDataJson(
  pathname: string,
  origin?: string,
): string | undefined {
  const isMissingMetadata = !origin || !PAGE_TITLES[pathname];

  if (isMissingMetadata) {
    return;
  }

  const context: Context = {
    pathname,
    origin,
    url: origin + pathname,
    article: GUIDE_ARTICLES.find((item) => pathname === '/guides/' + item.slug),
  };
  const data = builders
    .map((build) => build(context))
    .filter((value) => value !== undefined);

  return data.length > 0
    ? JSON.stringify(data).replaceAll('<', '\\u003c')
    : undefined;
}
