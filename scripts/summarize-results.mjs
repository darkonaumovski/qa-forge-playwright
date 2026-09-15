import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const report = JSON.parse(fs.readFileSync(new URL('test-results/results.json', root), 'utf8'));
const rows = [];
function walk(suite) {
  for (const spec of suite.specs ?? [])
    for (const test of spec.tests) {
      const latest = test.results.at(-1);
      rows.push({
        id: spec.title.match(/^QF-[A-Z]+-\d+/)?.[0],
        title: spec.title,
        browser: test.projectName,
        status: latest?.status ?? 'not-run',
        duration: latest?.duration ?? 0,
        attempts: test.results.length,
        expectedStatus: test.expectedStatus,
        error: latest?.error?.message?.replace(/\u001b\[[0-9;]*m/g, '') ?? null,
      });
    }
  (suite.suites ?? []).forEach(walk);
}
report.suites.forEach(walk);
const browsers = [...new Set(rows.map((row) => row.browser))].map((browser) => {
  const cases = rows.filter((row) => row.browser === browser);
  return {
    browser,
    total: cases.length,
    passed: cases.filter((r) => r.status === 'passed').length,
    failed: cases.filter((r) => r.status === 'failed' || r.status === 'timedOut').length,
    skipped: cases.filter((r) => r.status === 'skipped').length,
  };
});
const catalog = JSON.parse(fs.readFileSync(new URL('docs/test-cases.json', root), 'utf8'));
const expectedBrowsers = ['chromium', 'firefox', 'webkit'];
const coverageComplete = catalog.every((item) =>
  expectedBrowsers.every(
    (browser) => rows.filter((row) => row.id === item.id && row.browser === browser).length === 1,
  ),
);
const gatePassed =
  coverageComplete &&
  rows.length === catalog.length * 3 &&
  rows.every((row) => row.status === 'passed' && row.expectedStatus === 'passed' && row.attempts === 1) &&
  !report.errors?.length;
const summary = {
  startedAt: report.stats.startTime,
  durationMs: report.stats.duration,
  scenarios: catalog.length,
  executions: rows.length,
  gatePassed,
  browsers,
  failures: rows.filter((row) => row.status !== 'passed'),
};
fs.writeFileSync(new URL('test-results/summary.json', root), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ gatePassed, browsers }, null, 2));
if (process.argv.includes('--gate') && !gatePassed) process.exitCode = 1;
