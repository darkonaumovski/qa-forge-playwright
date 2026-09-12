# QA Forge — automation test plan

## Objective and release gate

Validate the deployed private Playwright Practice Lab at https://qa-forge-playwright-lab.darkonaumovski.chatgpt.site/. Cover authentication, the complete exposed user workflow, locator exercises, asynchronous behavior, navigation, audit browsing, challenges and solution content. This plan is based on the deployed version 3 UI and JavaScript validated on 12 September 2026, not an assumed conventional SaaS backend.

The regression gate requires all default tests to pass in all three browsers, type checking and plan coverage to pass, no skipped or expected-failing tests, and no unresolved application issues. A smoke pass alone does not satisfy this gate. Regression tests for previously observed defects run normally and protect the repaired behavior.

## Scope and explicit demo boundaries

- The app has Login, Users, Audit, Challenges and a separate Solutions screen. All exposed controls are covered.
- User records live in each page's JavaScript memory. Every test gets a new browser context, loads the deployed app and signs in through its UI. Reload restores the seed data. Tests do not share state or modify an external database.
- Edit, delete-menu and CSV export are notification-only targets in this demo. Assertions check those exact notifications and unchanged rows. Real editing, deletion, exported file contents, email delivery and backend API CRUD do not exist here and are not claimed as coverage.
- Timezone, welcome-email and MFA options can be manipulated in the dialog; the app does not expose a persisted profile or delivery/enrollment behavior. The plan tests control states and successful submission without inventing backend behavior.
- Audit data is a fixed eight-event fixture with a four-item initial limit. It is not a live history of the user actions performed during these tests.
- Clipboard success/failure tests stub only the browser clipboard API. App logic, page content and application timers remain real except the explicitly named deterministic virtual-clock cases. OS clipboard permissions are not tested.
- Private hosting is checked both anonymously (401) and through existing owner-authorized access (200). Demo sign-in is a separate UI exercise, not production security. This is functional regression coverage, not a penetration test, load test, accessibility certification or pixel-perfect visual audit.
- Desktop coverage runs in Chromium, Firefox and WebKit. The narrow-viewport workflow is also repeated in all three engines. Real mobile hardware is outside scope.

## Environment, data and isolation

Use Node.js 22+, the committed npm lockfile, Playwright 1.62.1 with its matching browser binaries, and Java 8+ for the pinned Allure 2 CLI. The Playwright version matches the available, validated browser installations; installing arbitrary browser executables is unnecessary.

Copy `.env.example` to `.env`; configure the existing Sites access token or an owner-supplied outer-login storage state. Never commit the token or storage state. The token is added only to requests whose origin exactly matches BASE_URL; third-party fonts and other origins never receive it. A failed outer login must fail the suite visibly; do not change the live site's audience.

Seed data: Ava/Admin/Active; Noah/Manager/Active; Mila/Viewer/Pending; Liam/Admin/Active; Sofia/Manager/Suspended; Ethan/Viewer/Active. Initial metrics are total=6, active=4, pending=1, admins=2. New-user tests use Maya Chen / maya@example.com, with independent contexts making the same deterministic data safe across workers.

Three workers are the conservative default against the live endpoint. Zero retries expose instability. Assertions wait on observable states. The debounce boundary and toast expiration tests use Playwright's virtual clock to advance application time, without wall-clock sleeps. Async login, creation, invitation and status tests exercise the real delays.

## Architecture and locator policy

`src/pages` contains focused page objects and the user-dialog component. `src/fixtures/test.ts` supplies authenticated and unauthenticated tests, owner access, Allure labels and a guard against uncaught page errors. `src/data/users.ts` holds typed seed and input data. Assertions remain in domain-specific spec files.

Prefer roles, labels and stable test IDs; scope duplicate actions to a semantic user row. Generated `user-row-NNNN` IDs are observed only to identify the practice trap and never used for interaction. The role dropdown uses `data-testid` because its wrapping label includes dynamic validation text. Stable selectors encapsulated in page objects cover metrics and containers where the application has no unique user-facing selector.

`docs/test-cases.json` is the scenario source of truth. `npm run plan:generate` builds this full plan. `npm run coverage:check` fails if a scenario lacks automation, an automated case is undocumented, an ID is duplicated or a case is missing a browser project.

## Nine-exercise traceability

| Exercise | Automated scenarios | Additional guide validation |
|---|---|---|
| 01 Demo sign-in | QF-AUTH-08, QF-AUTH-12 | Guide visibility/expansion: QF-CHALLENGE-05/06 |
| 02 Required validation | QF-FORM-02 | QF-DEFECT-02 checks the published email assertion |
| 03 Filter users | QF-USERS-04 | Summary and exact Viewer rows asserted |
| 04 Create a manager | QF-FORM-14 | Pending row, welcome default, toast and metrics |
| 05 Scope duplicate buttons | QF-USERS-14 | Mila-only Edit notification |
| 06 Bulk invitation state | QF-BULK-07 | Count, disabled state, async completion and reset |
| 07 Wait for status mutation | QF-STATUS-01 | QF-DEFECT-03 and QF-GUIDE-01 check the published locators |
| 08 Debounced audit filter | QF-AUDIT-03, QF-AUDIT-06 | Intermediate state, final result, cancellation; QF-DEFECT-06 checks guide scoping |
| 09 Reject dynamic IDs | QF-USERS-16 | Semantic row survives rerender and reload |

## Reporting and triage

Allure receives scenario IDs, feature/severity labels, assertions, failure screenshots and video attachments. Playwright HTML, JSON and JUnit are also generated. Private authentication can appear in network traces, so traces are disabled when a token or owner storage state is used. Allure automatic step details are disabled to avoid logging credential-bearing fixture arguments; assertion failures and attachments remain available. Reports and credentials are Git-ignored.

Classify failures as application defects, harness mistakes or environment failures. Fix harness mistakes and rerun the affected cases before the final complete run. Preserve genuine failing expectations and document reproducible defects in `docs/known-issues.md`. Export a run summary with browser counts and the exact dependency versions. Reports from exploratory runs must not be mixed into the final report.

## Acceptance assumptions and risk

The label “Keep this lab session” means that a checked option preserves demo sign-in across a reload; QF-DEFECT-05 verifies that behavior. The audit search's displayed value must agree with the visible events after navigation. Solution snippets are part of the learning product and must use selectors that resolve the demonstrated elements.

The live site can change independently of this repository. Rerun the full default suite after a new deployment or credential change. Passing the defined plan establishes coverage of these 106 observable scenarios; it is not a claim to prove absence of every possible defect.
