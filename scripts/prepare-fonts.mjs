import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
const base = new URL('../node_modules/pretendard/', import.meta.url);
const out = new URL('../public/fonts/', import.meta.url);
await mkdir(out, { recursive: true });
for (const weight of ['Regular', 'SemiBold', 'ExtraBold'])
  await copyFile(
    new URL('dist/web/static/woff2/Pretendard-' + weight + '.woff2', base),
    new URL('Pretendard-' + weight + '.woff2', out),
  );
let license;
for (const path of ['LICENSE', 'LICENSE.txt', 'dist/LICENSE.txt']) {
  try {
    license = await readFile(new URL(path, base), 'utf8');
    break;
  } catch {
    /* Try the next package license location. */
  }
}
if (!license || !license.includes('SIL OPEN FONT LICENSE'))
  throw new Error('Pretendard OFL 라이선스 파일을 찾지 못했습니다.');
await writeFile(new URL('OFL.txt', out), license);
console.log('Pretendard: 3 fonts + original OFL license copied.');
