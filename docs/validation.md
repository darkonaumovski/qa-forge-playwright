# Validation record

The final clean run targeted the repaired live private QA Forge Sites version 3. **318 passed out of 318 executions.** There were no failures, skips, retries, or expected failures.

Started: 2026-09-12T20:18:54.666Z (UTC). Duration: 12.8 minutes. Host: Windows; Node.js v24.20.0.

## Browser results

| Browser | Total | Passed | Failed | Skipped |
|---|---:|---:|---:|---:|
| chromium | 106 | 106 | 0 | 0 |
| firefox | 106 | 106 | 0 | 0 |
| webkit | 106 | 106 | 0 | 0 |

There are 106 documented scenarios, each executed once per browser. The 17-scenario smoke subset is included in this full run.

## Completed release checks

- Strict TypeScript validation passed.
- Plan coverage passed: 106/106, with no duplicate IDs and exactly three browser projects per scenario.
- The five repaired application regressions passed in every browser.
- Allure HTML, Playwright HTML, JSON and JUnit results were generated from the clean final run.
- The strict results gate passed with no failures, skipped tests, expected failures, or retries.
- The credential and private-key scan checked 699 source and artifact files and found no configured private token or private-key material.
- Private credentials and generated reports remain excluded from Git.

## Release decision

**Test gate: PASSED. Release: APPROVED.** The live application fixes and automation updates satisfy the repository's full release criteria.

## Reproduce

Run from the repository with the authorized local environment configured:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run verify
npm run allure:generate
npm run results:summary
npm run results:gate
npm run security:scan
```

The [detailed test plan](test-plan.md), generated Allure report, and `test-results/summary.json` provide the full evidence.
