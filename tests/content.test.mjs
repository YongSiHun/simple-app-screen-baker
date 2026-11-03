import { after, it } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: 'custom',
});
after(() => server.close());
const { renderInfoPages } = await server.ssrLoadModule(
  '/src/features/info/prerender.tsx',
);
const { structuredDataJson } = await server.ssrLoadModule(
  '/src/features/info/structuredData.ts',
);
const { PAGE_DESCRIPTIONS } = await server.ssrLoadModule(
  '/src/app/constants/pages.ts',
);
const pages = renderInfoPages();
const byPath = new Map(pages.map((page) => [page.pathname, page]));

it('renders every content route, including nested articles, with one heading and unique metadata', () => {
  assert.ok(pages.length >= 11);
  assert.equal(new Set(pages.map((page) => page.title)).size, pages.length);
  assert.equal(
    new Set(pages.map((page) => page.description)).size,
    pages.length,
  );

  for (const page of pages) {
    assert.equal((page.html.match(/<h1>/g) ?? []).length, 1, page.pathname);
    assert.ok(page.html.includes('id="main-content"'), page.pathname);
    assert.ok(page.html.includes('href="/"'), page.pathname);
    assert.ok(page.title.length > 10 && page.description.length > 20);
  }
});

it('keeps all internal page and section links reachable without JavaScript', () => {
  for (const page of pages) {
    for (const match of page.html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
      const href = match[1];
      const isLocal = href.startsWith('/') || href.startsWith('#');

      if (isLocal) {
        const url = new URL(
          href,
          'https://content.example.test' + page.pathname,
        );
        const isKnownAssetOrEditor = [
          '/',
          '/editor',
          '/fonts/OFL.txt',
        ].includes(url.pathname);

        if (isKnownAssetOrEditor) {
          continue;
        }

        const target = byPath.get(url.pathname);
        assert.ok(target, page.pathname + ' -> ' + href);
        const hasHash = Boolean(url.hash);

        if (hasHash) {
          assert.ok(
            target.html.includes('id="' + url.hash.slice(1) + '"'),
            page.pathname + ' -> ' + href,
          );
        }
      }
    }
  }
});

it('matches article structured data to the visible content and never invents ratings', () => {
  for (const page of pages.filter((page) =>
    page.pathname.startsWith('/guides/'),
  )) {
    const data = JSON.parse(
      structuredDataJson(page.pathname, 'https://content.example.test'),
    );
    const article = data.find((item) => item['@type'] === 'Article');
    assert.ok(page.html.includes(article.headline));
    assert.equal(article.description, page.description);
    assert.equal(
      article.mainEntityOfPage,
      'https://content.example.test' + page.pathname,
    );
    assert.ok(!JSON.stringify(data).includes('aggregateRating'));
    const breadcrumbs = data.find((item) => item['@type'] === 'BreadcrumbList');
    assert.equal(
      breadcrumbs.itemListElement.at(-1).item,
      article.mainEntityOfPage,
    );
  }

  assert.equal(structuredDataJson('/faq'), undefined);
  assert.equal(
    structuredDataJson('/missing', 'https://content.example.test'),
    undefined,
  );
});

it('escapes HTML in embedded JSON-LD', () => {
  const original = PAGE_DESCRIPTIONS['/'];

  try {
    PAGE_DESCRIPTIONS['/'] = '<script>test</script>';
    const json = structuredDataJson('/', 'https://content.example.test');
    assert.ok(!json.includes('<'));
    assert.equal(JSON.parse(json)[0].description, '<script>test</script>');
  } finally {
    PAGE_DESCRIPTIONS['/'] = original;
  }
});
