import { loadEnv } from 'vite';

export const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7225723390864149';

export function siteOrigin(value) {
  const isUnset = !value;

  if (isUnset) {
    return undefined;
  }

  const url = new URL(value);
  const valid =
    url.protocol === 'https:' &&
    url.pathname === '/' &&
    !url.search &&
    !url.hash &&
    !url.username &&
    !url.password;

  const isInvalid = !valid;

  if (isInvalid) {
    throw new Error(
      'SITE_URL must be an HTTPS origin, without a path, credentials, query or hash.',
    );
  }

  return url.origin;
}

export function siteHtml() {
  let production = false;
  let origin;

  return {
    name: 'site-html',
    configResolved(config) {
      production = config.command === 'build' && config.isProduction;
      origin = siteOrigin(loadEnv(config.mode, config.root, '').SITE_URL);
    },
    transformIndexHtml() {
      const tags = [];

      if (production) {
        tags.push({
          tag: 'script',
          attrs: { async: true, src: ADSENSE_SRC, crossorigin: 'anonymous' },
          injectTo: 'head',
        });
      }

      if (origin) {
        tags.push({
          tag: 'link',
          attrs: { rel: 'canonical', href: origin + '/' },
          injectTo: 'head',
        });
        tags.push({
          tag: 'meta',
          attrs: { property: 'og:url', content: origin + '/' },
          injectTo: 'head',
        });
      }

      return tags;
    },
  };
}
