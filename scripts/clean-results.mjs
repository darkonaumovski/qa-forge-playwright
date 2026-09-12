import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fs.realpathSync(fileURLToPath(new URL('../', import.meta.url)));
for (const name of ['allure-results', 'allure-report', 'playwright-report', 'test-results', 'blob-report']) {
  const target = path.resolve(root, name);
  if (!fs.existsSync(target)) continue;
  const real = fs.realpathSync(target);
  if (path.dirname(real) !== root || path.basename(real) !== name || fs.lstatSync(target).isSymbolicLink()) {
    throw new Error(`Refusing to clean a path outside the repository: ${name}`);
  }
  fs.rmSync(target, { recursive: true, force: true });
}
console.log('Cleaned generated reports within this repository.');
