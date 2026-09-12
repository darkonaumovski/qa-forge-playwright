# QA Forge Playwright automation

TypeScript end-to-end tests for the private [QA Forge practice lab](https://qa-forge-playwright-lab.darkonaumovski.chatgpt.site/), using page objects, isolated fixtures and Allure reporting.

**106 scenarios across Chromium, Firefox and WebKit: 318 test executions.** The default suite includes regression tests for application defects; see [known issues](docs/known-issues.md) and the [validation record](docs/validation.md). A red suite blocks publication. Tests are never marked as expected failures to make the build green.

## Start locally

Requirements: Node.js 22 or newer, npm and Java 8+ (Java 17 recommended for CI).

```sh
npm ci
npx playwright install chromium firefox webkit
```

Copy `.env.example` to `.env`. The demo credentials are already filled in. Set `SITE_BYPASS_TOKEN` to the existing token authorized by the site owner. Alternatively set `SITE_STORAGE_STATE` to a local Playwright storage-state file containing only the outer Sites login. These are separate from the lab's demo sign-in, which every authenticated test performs through the UI.

The working copy supplied to the owner has an ignored local `.env` configured for this run. The token must stay local or in a GitHub Actions secret; it is not in the repository or distribution archive. If the private access gate returns 401, refresh authorized access rather than making the site public.

```sh
npm run typecheck
npm run coverage:check
npm test
npm run allure:generate
npm run allure:open
```

Generate reports after a failing run too. `npm test` correctly exits nonzero while application regressions remain. The generated Allure HTML is self-contained at `allure-report/index.html` and can be opened locally. Use `npm run report` for Playwright's report with videos and screenshots.

## Commands

| Command | Purpose |
|---|---|
| `npm test` | Clean prior generated reports, run every scenario on all three browsers |
| `npm run test:chromium` | Clean reports, run the full Chromium suite |
| `npm run test:smoke` | Clean reports, run the P1 subset across all browsers |
| `npm run test:headed` | Chromium with a visible browser |
| `npm run test:ui` | Interactive Playwright runner |
| `npx playwright test --grep QF-FORM-14 --project=chromium` | Investigate one scenario; does not clean old reports |
| `npm run typecheck` | Strict TypeScript validation |
| `npm run coverage:check` | Enforce one-to-one plan/test IDs and all browser projects |
| `npm run plan:generate` | Regenerate the detailed plan from the scenario catalog |
| `npm run results:summary` | Write compact JSON counts from the last full result |
| `npm run results:gate` | Reject missing, failed, skipped, expected-failing or retried cases |
| `npm run security:scan` | Scan source and report artifacts for the configured private token |
| `npm run allure:generate` | Generate a clean, self-contained Allure HTML report |

## Repository structure

```text
.github/workflows/playwright.yml  CI and report artifacts
docs/
  test-strategy.md               Scope, risks, data and release criteria
  test-cases.json                Detailed scenario source of truth
  test-plan.md                   Generated 106-scenario test plan
  known-issues.md                Reproductions and suggested fixes
  validation.md                 Actual run and publication decision
scripts/                        Coverage, report cleanup and safety checks
src/
  config/environment.ts         Environment-only private access
  data/users.ts                 Typed fixtures and expected seed data
  fixtures/test.ts              POM fixtures, login, access, error guard, Allure
  pages/                        Login, shell, users, dialog, audit, challenges, solutions
tests/                          Domain-based specs with stable QF scenario IDs
playwright.config.ts            Browser projects and reporters
```

The [detailed test plan](docs/test-plan.md) gives preconditions, steps and expected results for every case. Its exercise matrix links all nine learning exercises to their automation.

## Design decisions

Each test owns a fresh browser context. User data is in-memory in this demo, so deterministic input data is safe with parallel workers. The suite logs in normally and does not seed the application's internal variables. Stable roles, labels and test IDs live in page objects; assertions live in tests. Generated row IDs are never action locators.

The suite checks real async states with retrying assertions. Playwright's virtual clock is used for the exact debounce boundary and toast lifetime. No `waitForTimeout`, forced clicks or blanket retries are used. Browser errors fail the test. The private Sites header is scoped to the lab origin. Traces are disabled for private token/storage-state runs because they can capture credentials; screenshot and video evidence remains enabled on failure.

Edit, delete and export intentionally produce notifications only in this lab. Timezone, welcome and MFA are form controls without an exposed persistence or delivery contract. Their tests reflect that scope. Clipboard API success and failure are deterministic component-level browser stubs, not assertions about the operating system's clipboard.

## GitHub Actions

The workflow runs on pull requests, pushes to `main`, and manual dispatch. Configure the private `SITE_BYPASS_TOKEN` repository secret before enabling it. Optional secrets: `LAB_EMAIL`, `LAB_PASSWORD`; optional variable: `BASE_URL`. Fork pull requests do not receive secrets and cannot run against the owner-only endpoint.

CI installs the pinned dependency set and matching browsers, checks TypeScript and scenario coverage, runs all tests and generates Allure even when tests fail. Report upload is contingent on the artifact credential scan passing. Reports remain workflow artifacts for 14 days; nothing is published to GitHub Pages.

The owner subsequently authorized GitHub publication with the documented failures still present. Publication does not change the regression gate: the default suite remains red until the application issues are fixed. Configure GitHub authentication locally when needed; do not paste an access token into source or a remote URL.

## References

- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Allure Playwright integration](https://allurereport.org/docs/playwright/)

The lab's solution guide is part of the product being tested. Working repository tests correct its locator mistakes; separate regression cases identify incorrect published snippets.
