import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/@playwright/test/cli.js', import.meta.url));
const result = spawnSync(process.execPath, [cli, 'test', '--list', '--reporter=json'], { cwd: root, encoding: 'utf8' });
if (result.status !== 0) { console.error(result.stderr || result.stdout); process.exit(1); }
const catalog = JSON.parse(fs.readFileSync(new URL('../docs/test-cases.json', import.meta.url), 'utf8'));
const found = [];
function walk(suite) { found.push(...(suite.specs ?? [])); (suite.suites ?? []).forEach(walk); }
JSON.parse(result.stdout).suites.forEach(walk);
const ids = [...new Set(found.map(spec => spec.title.match(/^QF-[A-Z]+-\d+/)?.[0]))];
const planned = catalog.map(item => item.id);
const errors = [
  ...ids.filter(id => !id || !planned.includes(id)).map(id => `Unplanned test: ${id}`),
  ...planned.filter(id => !ids.includes(id)).map(id => `Missing automation: ${id}`),
  ...planned.filter((id, i) => planned.indexOf(id) !== i).map(id => `Duplicate plan ID: ${id}`),
];
for (const id of ids) {
  const specs = found.filter(spec => spec.title.startsWith(`${id} `));
  const tests = specs.flatMap(spec => spec.tests);
  const projects = tests.map(test => test.projectName);
  if (projects.length !== 3 || new Set(projects).size !== 3) errors.push(`${id}: expected exactly one case per browser project`);
  const sources = new Set(specs.map(spec => `${spec.file}:${spec.line}`));
  if (sources.size !== 1) errors.push(`${id}: duplicate scenario ID in different tests`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`${planned.length}/${planned.length} planned scenarios automated across three browsers; no duplicate IDs.`);
