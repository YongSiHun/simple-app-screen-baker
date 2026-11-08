interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  /** HTTP → HTTPS · 정적 페이지/파일 제공 */
  fetch(request: Request, env: Env): Promise<Response> | Response {
    const url = new URL(request.url);
    const isHttp = url.protocol === 'http:';

    if (isHttp) {
      url.protocol = 'https:';

      return Response.redirect(url.href, 308);
    }

    return env.ASSETS.fetch(request);
  },
};
