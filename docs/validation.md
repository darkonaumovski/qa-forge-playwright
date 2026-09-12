# Validation record

The final clean run targeted the live private QA Forge deployment. **303 passed; 15 failed out of 318 executions.** The 5 distinct failing scenarios are retained as ordinary failures.

Started: 2026-09-12T19:42:25.100Z (UTC). Duration: 12.9 minutes. Host: Windows; Node.js v24.20.0.

## Browser results

| Browser | Total | Passed | Failed | Skipped |
|---|---:|---:|---:|---:|
| chromium | 106 | 101 | 5 | 0 |
| firefox | 106 | 101 | 5 | 0 |
| webkit | 106 | 101 | 5 | 0 |

There are 106 documented scenarios, each executed once per browser. Retries: 0. Expected failures: 0. The 17-scenario smoke subset is part of this full run.

## Failing scenarios

- **QF-DEFECT-01**: Retained audit search must still filter after navigation.
- **QF-DEFECT-02**: Exercise 02 validation assertions must locate visible errors uniquely.
- **QF-DEFECT-03**: Exercise 07 Updating assertion must uniquely locate the status control.
- **QF-DEFECT-05**: Keep this lab session must retain demo sign-in on reload.
- **QF-DEFECT-06**: Exercise 08 Ready assertion must exclude unrelated hidden content.

See [known issues](known-issues.md) for reproductions, actual versus expected behavior, suggested fixes, and the session-checkbox acceptance assumption. No application code was changed.

## Completed repository checks

- Strict TypeScript validation passed.
- Plan coverage check passed: 106/106; no duplicate IDs; exactly three browser projects per scenario.
- Matching installed browser versions: chromium 151.0.7922.34, firefox 153.0, webkit 26.5.
- Allure 2.43.0 / allure-playwright 3.12.1; Playwright 1.62.1; TypeScript 7.0.2.
- Allure HTML, Playwright HTML, JSON and JUnit results generated; screenshots and videos retained for failed tests.
- Generated reports were cleaned before the final run. Exploratory and targeted runs are not mixed into the final Allure report.
- Private credentials and generated artifacts are excluded from Git. A known-token/private-key scan was run before packaging. The local .env is not in the source archive.
- GitHub Actions workflow supplied; it has not been executed on GitHub.

## Release decision

**Test gate: BLOCKED. Publication: owner-authorized despite failures.** The original request required a fully passing suite before publication. The owner subsequently explicitly requested the GitHub push with the recorded failures still present. This changes the publication authorization, not the validation result or the unresolved issues.

## Reproduce

Run the following from the repository with the authorized local environment configured:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run verify
# After the run, even when it fails:
npm run allure:generate
npm run results:summary
npm run results:gate
npm run security:scan
```

The release gate must exit nonzero for this recorded result. The [detailed test plan](test-plan.md), [Allure report](../allure-report/index.html) and [machine-readable summary](../test-results/summary.json) provide the full evidence. Generated reports are supplied in the working copy and can be regenerated from the source ZIP.
