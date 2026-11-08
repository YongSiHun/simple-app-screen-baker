import { after, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { createServer } from 'vite';

const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
});
after(() => server.close());
const { EditorStatus } = await server.ssrLoadModule(
  '/src/features/editor/components/EditorStatus.tsx',
);
const idle = {
  hasExportableSlides: true,
  missing: 1,
  progress: '',
  done: '',
  error: '',
  onDismissDone() {},
};
const renderStatus = (props = {}) =>
  renderToStaticMarkup(createElement(EditorStatus, { ...idle, ...props }));
const inlineStatus = (html) =>
  html.match(
    new RegExp('<div class="download-status"[^>]*>(.*?)</div>', 's'),
  )[1];

it('shows the ZIP exclusion notice while idle with both exportable and empty slides', () => {
  assert.ok(
    renderStatus().includes('이미지 없는 슬라이드 1개는 ZIP에서 제외됩니다.'),
  );
  assert.ok(
    !renderStatus({ hasExportableSlides: false }).includes(
      'ZIP에서 제외됩니다.',
    ),
  );
  assert.ok(!renderStatus({ missing: 0 }).includes('ZIP에서 제외됩니다.'));
  assert.ok(!renderStatus().includes('class="download-toast"'));
});

for (const [name, props, message] of [
  ['download progress', { progress: '이미지 준비 중' }, '이미지 준비 중'],
  [
    'download error',
    { error: '다운로드에 실패했습니다.' },
    '다운로드에 실패했습니다.',
  ],
]) {
  it('prioritizes ' + name + ' over the unrelated ZIP exclusion notice', () => {
    const html = renderStatus(props);
    assert.ok(html.includes(message));
    assert.ok(!html.includes('ZIP에서 제외됩니다.'));
  });
}

for (const message of [
  '현재 슬라이드 PNG 다운로드 완료',
  'ZIP 다운로드 완료 · 이미지 없는 슬라이드 1개 제외',
]) {
  it(
    'renders ' +
      message +
      ' in a dismissible toast instead of the inline status',
    () => {
      const html = renderStatus({ done: message });
      const toast = html.match(
        new RegExp('<div class="download-toast"[^>]*>(.*?)</div>', 's'),
      )[1];
      assert.ok(toast.includes(message));
      assert.ok(toast.includes('다운로드 완료 알림 닫기'));
      assert.ok(!inlineStatus(html).includes(message));
      assert.equal(inlineStatus(html), inlineStatus(renderStatus()));
    },
  );
}

it('keeps the inline status empty after completing a project with no missing images', () => {
  const html = renderStatus({
    missing: 0,
    done: '현재 슬라이드 PNG 다운로드 완료',
  });
  assert.equal(inlineStatus(html), '');
  assert.ok(html.includes('class="download-toast"'));
});
