let fontPromise: Promise<void> | undefined;
/**
 * 렌더링에 필요한 글꼴을 한 번만 읽고 준비 상태를 확인합니다.
 */
export function ensureFont() {
  fontPromise ??= (async () => {
    await Promise.all([
      document.fonts.load('600 32px Pretendard', '앱 스크린샷'),
      document.fonts.load('800 32px Pretendard', '앱 스크린샷'),
    ]);
    const isFontUnavailable = !document.fonts.check('800 32px Pretendard');

    if (isFontUnavailable) {
      throw new Error(
        'Pretendard 폰트를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.',
      );
    }
  })();

  return fontPromise;
}
