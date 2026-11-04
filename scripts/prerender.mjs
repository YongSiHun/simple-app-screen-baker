import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer, loadEnv } from 'vite';
import { dirname } from 'node:path';
import { siteOrigin } from './site-html.mjs';

const modeIndex = process.argv.indexOf('--mode');
const mode = modeIndex < 0 ? 'production' : process.argv[modeIndex + 1];
const origin = siteOrigin(loadEnv(mode, process.cwd(), '').SITE_URL);
const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: 'custom',
});
const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

try {
  const { renderInfoPages } = await server.ssrLoadModule(
    '/src/features/info/prerender.tsx',
  );
  const { structuredDataJson } = await server.ssrLoadModule(
    '/src/features/info/structuredData.ts',
  );
  const base = await readFile('dist/index.html', 'utf8');
  const addStructuredData = (html, pathname) => {
    const json = structuredDataJson(pathname, origin);

    return json
      ? html.replace(
          '</head>',
          '<script id="page-structured-data" type="application/ld+json">' +
            json +
            '</script></head>',
        )
      : html;
  };

  await writeFile('dist/index.html', addStructuredData(base, '/'));
  const pages = renderInfoPages();

  for (const page of pages) {
    let html = base
      .replace(new RegExp('<noscript>.*?</noscript>', 's'), '')
      .replace(
        '<div id="root"></div>',
        '<div id="root">' + page.html + '</div>',
      )
      .replace(
        new RegExp('<title>.*?</title>', 's'),
        '<title>' + escape(page.title) + '</title>',
      )
      .replace(
        /(<meta\s+name="description"\s+content=")[^"]*/,
        '$1' + escape(page.description),
      )
      .replace(
        /(<meta\s+property="og:title"\s+content=")[^"]*/,
        '$1' + escape(page.title),
      )
      .replace(
        /(<meta\s+property="og:description"\s+content=")[^"]*/,
        '$1' + escape(page.description),
      );

    if (origin) {
      html = html
        .replace(
          'rel="canonical" href="' + origin + '/' + '"',
          'rel="canonical" href="' + origin + page.pathname + '"',
        )
        .replace(
          'property="og:url" content="' + origin + '/' + '"',
          'property="og:url" content="' + origin + page.pathname + '"',
        );
    }

    const filename = 'dist' + page.pathname + '.html';
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, addStructuredData(html, page.pathname));
  }

  if (origin) {
    const urls = ['/', ...pages.map((page) => page.pathname)];
    await writeFile(
      'dist/sitemap.xml',
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        urls
          .map((url) => '<url><loc>' + escape(origin + url) + '</loc></url>')
          .join('') +
        '</urlset>',
    );
    await writeFile(
      'dist/robots.txt',
      'User-agent: *\nAllow: /\nSitemap: ' + origin + '/sitemap.xml\n',
    );
  } else {
    console.warn(
      'SITE_URL is unset: canonical, og:url, sitemap.xml and JSON-LD are omitted. Set the verified production origin before release.',
    );
  }
} finally {
  await server.close();
}
