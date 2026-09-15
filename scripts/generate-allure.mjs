import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/allure-commandline/bin/allure', import.meta.url));
const result = spawnSync(
  process.execPath,
  [cli, 'generate', 'allure-results', '--clean', '--single-file', '-o', 'allure-report'],
  {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ALLURE_NO_ANALYTICS: '1' },
  },
);
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
