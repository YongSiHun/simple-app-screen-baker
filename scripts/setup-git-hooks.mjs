import { access, chmod } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
try {
  await access(new URL('../.git', import.meta.url));
} catch {
  // Source archives can run without Git metadata.
  process.exit(0);
}

const current = spawnSync('git', ['config', '--get', 'core.hooksPath'], {
  cwd: root,
  encoding: 'utf8',
});
if (current.error || ![0, 1].includes(current.status)) {
  throw new Error(
    current.error?.message || current.stderr || 'Git 설정을 읽을 수 없습니다.',
  );
}
const hooksPath = current.stdout.trim();
if (hooksPath && hooksPath !== '.githooks') {
  throw new Error(
    '기존 core.hooksPath 설정(' +
      hooksPath +
      ')이 있습니다. .githooks/pre-commit 검사를 기존 훅에 연결해주세요.',
  );
}
await chmod(new URL('../.githooks/pre-commit', import.meta.url), 0o755);
if (hooksPath !== '.githooks') {
  const result = spawnSync(
    'git',
    ['config', '--local', 'core.hooksPath', '.githooks'],
    {
      cwd: root,
      encoding: 'utf8',
    },
  );
  if (result.error || result.status !== 0) {
    throw new Error(
      result.error?.message || result.stderr || 'Git 훅 등록에 실패했습니다.',
    );
  }
}
console.log('Git pre-commit: Prettier + ESLint checks enabled.');
