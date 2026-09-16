import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const excluded = new Set(['node_modules', '.git']);
function files(dir) {
  return readdirSync(dir).flatMap(name => {
    if (excluded.has(name)) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.(?:m?js)$/.test(name) ? [path] : [];
  });
}
for (const file of files('.')) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}
console.log('Syntax OK');
