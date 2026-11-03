interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  /**
   * 모든 HTTP 경로를 HTTPS로 전환한 뒤 정적 페이지와 파일을 제공합니다.
   */
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
