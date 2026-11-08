function setMeta(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute('content', content);
}

export function updateBasicMetadata(title: string, description: string) {
  document.title = title;
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  document.getElementById('page-structured-data')?.remove();
}

export function readCanonicalUrl() {
  return document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
}

export function updateCanonicalMetadata(url: string, json?: string) {
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  setMeta('meta[property="og:url"]', url);
  const hasNoData = !json;

  if (hasNoData) {
    return;
  }

  const script = document.createElement('script');
  script.id = 'page-structured-data';
  script.type = 'application/ld+json';
  script.textContent = json;
  document.head.append(script);
}
