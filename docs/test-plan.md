# QA Forge — automation test plan

## Objective and release gate

Validate the deployed private Playwright Practice Lab at https://qa-forge-playwright-lab.darkonaumovski.chatgpt.site/. Cover authentication, the complete exposed user workflow, locator exercises, asynchronous behavior, navigation, audit browsing, challenges and solution content. This plan is based on the deployed version 2 UI and JavaScript inspected on 12 September 2026, not an assumed conventional SaaS backend.

Publication to the owner's GitHub account requires all default tests to pass in all three browsers, type checking and plan coverage to pass, no skipped or expected-failing tests, and no unresolved application issues. A smoke pass alone does not satisfy this gate. Defect tests run normally and deliberately keep the gate red until the application is repaired. Never change assertions merely to accept a known defect.

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

The label “Keep this lab session” implies that a checked option preserves demo sign-in across a reload; QF-DEFECT-05 tests that interpretation. If the intended requirement is purely checkbox practice, the label should say so and the requirement should be reviewed explicitly. The audit search's displayed value must agree with the visible events after navigation. Solution snippets are part of the learning product and must use selectors that resolve the demonstrated elements.

The live site can change independently of this repository. Rerun the full default suite after a new deployment or credential change. Passing the defined plan establishes coverage of these 106 observable scenarios; it is not a claim to prove absence of every possible defect.


## Detailed scenario catalog

106 scenarios; each runs in Chromium, Firefox and WebKit (318 executions). IDs map directly to test titles and Allure labels. P1 denotes the smoke gate; P2 denotes full regression.

### ACCESS

#### QF-ACCESS-01 — Private hosting rejects requests without owner authentication

Priority: **P2** · Automation: [tests/access.spec.ts](../tests/access.spec.ts)

**Preconditions:** Anonymous isolated API context.

1. Request the live origin without cookies or the Sites header.

**Expected:** HTTP 401; response contains Sign in required.

#### QF-ACCESS-02 — Authorized browser can reach the deployed lab

Priority: **P1** · Automation: [tests/access.spec.ts](../tests/access.spec.ts)

**Preconditions:** Fresh owner-authorized browser.

1. Navigate to the live root URL.

**Expected:** HTTP 200; QA Forge title and demo login form visible.

### AUTH

#### QF-AUTH-01 — Login screen exposes accessible controls and demo credentials

Priority: **P1** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Inspect heading, demo credentials, labels, password type and session checkbox.

**Expected:** Accessible email; masked password; remember unchecked; application hidden.

#### QF-AUTH-02 — Empty login reports both required fields

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen, both fields blank.

1. Submit empty form.

**Expected:** Both exact required messages and aria-invalid=true; submit remains enabled.

#### QF-AUTH-03 — Login validates an individually missing email

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Fill only valid password.
2. submit.

**Expected:** Email is required; no password error.

#### QF-AUTH-04 — Login validates an individually missing password

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Fill only valid email.
2. submit.

**Expected:** Password is required; no email error.

#### QF-AUTH-05 — Login rejects wrong password

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Submit demo email with wrong-password.

**Expected:** Incorrect-credentials alert; application hidden; submit re-enabled.

#### QF-AUTH-06 — Login rejects unknown account

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Submit unknown@example.com with the demo password.

**Expected:** Incorrect-credentials alert; application hidden; submit re-enabled.

#### QF-AUTH-07 — Login rejects malformed email

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Submit invalid-email with the demo password.

**Expected:** Incorrect-credentials alert; application hidden; submit re-enabled.

#### QF-AUTH-08 — Valid login shows a disabled pending state then Users

Priority: **P1** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Submit the displayed valid credentials.

**Expected:** Checking access… and disabled submit precede User management and #users.

#### QF-AUTH-09 — Correcting invalid credentials recovers login

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Submit incorrect credentials.
2. wait for alert.
3. correct password and submit.

**Expected:** Successful sign-in; prior authentication alert hidden.

#### QF-AUTH-10 — Password visibility toggles without changing its value

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Fill Example-123!.
2. click Show password.
3. click Hide password.

**Expected:** Type changes password/text/password; value unchanged; button labels follow state.

#### QF-AUTH-11 — Remember checkbox can be checked and unchecked

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Check then uncheck Keep this lab session.

**Expected:** Checkbox states follow each action.

#### QF-AUTH-12 — Enter submits the login form

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Login screen.

1. Fill valid credentials.
2. press Enter in password.

**Expected:** Users screen visible.

#### QF-AUTH-13 — Sign out hides the application and allows a new login

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Successful demo sign-in.

1. Sign out.
2. inspect screen and hash.
3. sign in again.

**Expected:** Application hidden, login visible, Signed out toast, no #users; re-login succeeds.

#### QF-AUTH-14 — Hash navigation alone does not reveal the demo application

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Fresh context without demo sign-in.

1. Navigate directly to /#users.

**Expected:** Login visible; Users hidden.

#### QF-AUTH-15 — Credential copy failure offers an observable fallback

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Clipboard API deterministically rejects in a test stub.

1. Click the email copy button.

**Expected:** Manual-copy fallback toast visible; no uncaught application error.

#### QF-AUTH-16 — Credential copy sends the selected value to the clipboard API

Priority: **P2** · Automation: [tests/auth.spec.ts](../tests/auth.spec.ts)

**Preconditions:** Clipboard write API replaced by an in-memory test spy.

1. Click email then password copy controls.

**Expected:** Each exact selected value reaches writeText; two success notifications.

### USERS

#### QF-USERS-01 — Seed rows and metrics match the baseline

Priority: **P1** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated, six seed users.

1. Inspect every row and all metrics.

**Expected:** All names/emails/roles/statuses/last-active values match seed; metrics 6/4/1/2.

#### QF-USERS-02 — Role filter shows only Admin accounts

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Select Admin role.

**Expected:** Only Ava and Liam visible; Showing 2 of 6 users; total metric remains 6.

#### QF-USERS-03 — Role filter shows only Manager accounts

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Select Manager role.

**Expected:** Only Noah and Sofia visible; Showing 2 of 6 users; total metric remains 6.

#### QF-USERS-04 — Role filter shows only Viewer accounts

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Select Viewer role.

**Expected:** Only Mila and Ethan visible; Showing 2 of 6 users; total metric remains 6.

#### QF-USERS-05 — All roles restores all users

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Select Admin.
2. select All roles.

**Expected:** All six rows and full result summary restored.

#### QF-USERS-06 — Search matches full name

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Search Mila Petrova.

**Expected:** Only Mila; Showing 1 of 6 users.

#### QF-USERS-07 — Search matches partial name

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Search Rodri.

**Expected:** Only Ava; Showing 1 of 6 users.

#### QF-USERS-08 — Search matches email

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Search liam@qaforge.dev.

**Expected:** Only Liam; Showing 1 of 6 users.

#### QF-USERS-09 — Search matches case-insensitive text

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Search sOFIA.

**Expected:** Only Sofia; matching ignores case.

#### QF-USERS-10 — Search matches trimmed text

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Search Ethan with surrounding spaces.

**Expected:** Only Ethan; search trims outer whitespace.

#### QF-USERS-11 — Search and role filters intersect

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Select Manager.
2. search Sofia.
3. change role to Viewer.

**Expected:** Sofia first visible; then zero matching rows and empty state.

#### QF-USERS-12 — No matches has a zero summary and recovers on clear

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Search does-not-exist.
2. clear search.

**Expected:** No users found; Showing 0 of 6; select-all unchecked; clear restores six rows.

#### QF-USERS-13 — Whitespace-only search is unfiltered

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Search three spaces.

**Expected:** All six rows remain.

#### QF-USERS-14 — Duplicate Edit actions are scoped to the target row

Priority: **P1** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Count duplicate Edit buttons.
2. scope Edit to Mila's row.

**Expected:** Six Edit controls; only Mila notification; row count and Pending status unchanged.

#### QF-USERS-15 — Delete menu is a scoped notification target

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Click Delete Noah Williams within Noah's row.

**Expected:** Delete-menu notification names Noah; six rows remain; no destructive deletion.

#### QF-USERS-16 — Semantic locators survive rerender and full reload

Priority: **P2** · Automation: [tests/users.spec.ts](../tests/users.spec.ts)

**Preconditions:** Authenticated baseline.

1. Retain semantic Ava locator.
2. filter Admin/all.
3. reload and re-login.

**Expected:** Row is found after each render; generated ID shape observed but never used as an action selector.

### FORM

#### QF-FORM-01 — New-user dialog has correct defaults and options

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Authenticated, Add user opened.

1. Inspect initial focus, fields, roles, timezones and account checkboxes.

**Expected:** Close control initially focused; fields blank; role placeholder; Skopje timezone; welcome on; MFA off.

#### QF-FORM-02 — Empty submit reports three errors and focuses the first invalid field

Priority: **P1** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Authenticated, blank Add user dialog.

1. Submit empty form.

**Expected:** Exact name/email/role errors; all three aria-invalid=true; name focused; dialog open; six users remain.

#### QF-FORM-03 — Rejects two-character name

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Submit name Al with valid email and Manager.

**Expected:** Full-name error; name focused; dialog stays open.

#### QF-FORM-04 — Rejects whitespace name

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Submit whitespace-only name with other fields valid.

**Expected:** Full-name error; name focused; dialog stays open.

#### QF-FORM-05 — Rejects trimmed short name

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Submit space-A-space with other fields valid.

**Expected:** Trimmed one-character name rejected.

#### QF-FORM-06 — Rejects empty email

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Submit Maya Chen and Manager with blank email.

**Expected:** Enter a valid work email; email focused; dialog open.

#### QF-FORM-07 — Rejects missing at sign

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Submit maya.example.com with other fields valid.

**Expected:** Missing-at-sign email rejected; email focused; dialog open.

#### QF-FORM-08 — Rejects missing domain suffix

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Submit maya@example with other fields valid.

**Expected:** Missing-domain-suffix email rejected; email focused; dialog open.

#### QF-FORM-09 — Rejects internal whitespace

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Submit maya chen@example.com with other fields valid.

**Expected:** Internal-whitespace email rejected; email focused; dialog open.

#### QF-FORM-10 — Role is mandatory

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Fill valid name/email.
2. leave role unselected.
3. submit.

**Expected:** Choose a role error; role control focused.

#### QF-FORM-11 — Rejects existing email

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog, seeded Ava account.

1. Submit ava@qaforge.dev with a valid new name/role.

**Expected:** Duplicate-email error; no additional row.

#### QF-FORM-12 — Rejects case and whitespace duplicate

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog, seeded Ava account.

1. Submit AVA@QAFORGE.DEV with surrounding spaces.

**Expected:** Case-insensitive trimmed duplicate rejected; no additional row.

#### QF-FORM-13 — Creates a Pending Admin with updated metrics

Priority: **P1** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Create Maya Chen as Admin.

**Expected:** Creating user… disabled state; toast; Pending/Never row; total 7, pending 2, admins 3.

#### QF-FORM-14 — Creates a Pending Manager with updated metrics

Priority: **P1** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Create Maya Chen as Manager with default welcome option.

**Expected:** Creating user… disabled state; toast; Pending/Never row; total 7, pending 2, admins 2.

#### QF-FORM-15 — Creates a Pending Viewer with updated metrics

Priority: **P1** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Create Maya Chen as Viewer.

**Expected:** Creating user… disabled state; toast; Pending/Never row; total 7, pending 2, admins 2.

#### QF-FORM-16 — Accepts the three-character boundary and trims input

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Submit space-Ana-space and padded ana@example.com.

**Expected:** Three-character boundary accepted; row name and email trimmed.

#### QF-FORM-17 — Correcting validation errors permits submission

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Submit empty form.
2. correct all values.
3. submit.

**Expected:** Validation recovery succeeds; dialog closes; Maya row appears.

#### QF-FORM-18 — All timezones and account checkboxes can be selected

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Select each timezone.
2. uncheck welcome.
3. check MFA.
4. submit valid user.

**Expected:** Each control retains chosen UI state; user creation succeeds.

#### QF-FORM-19 — Cancel discards an unsaved user

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog with valid unsaved data.

1. Click Cancel.

**Expected:** Dialog closes; six rows remain; Maya absent.

#### QF-FORM-20 — Close discards an unsaved user

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog with valid unsaved data.

1. Click Close dialog.

**Expected:** Dialog closes; six rows remain; Maya absent.

#### QF-FORM-21 — Escape discards an unsaved user

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog with valid unsaved data.

1. Press Escape.

**Expected:** Native dialog closes; six rows remain; Maya absent.

#### QF-FORM-22 — Reopening clears errors and restores form defaults

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Trigger validation.
2. change checkboxes/timezone.
3. cancel and reopen.

**Expected:** Errors and aria-invalid removed; default checkboxes/timezone restored.

#### QF-FORM-23 — Creating a user clears active user filters

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Authenticated with Viewer role and Mila search filters.

1. Open Add user and create Manager Maya.

**Expected:** Dialog closes; search cleared; All roles selected; all seven rows visible.

#### QF-FORM-24 — User-supplied markup is displayed as text

Priority: **P2** · Automation: [tests/user-form.spec.ts](../tests/user-form.spec.ts)

**Preconditions:** Add user dialog.

1. Create a user whose name is an img/onerror markup string.

**Expected:** Literal name visible; no image element created; document title unchanged.

### BULK

#### QF-BULK-01 — Invitation action starts disabled with no selection

Priority: **P2** · Automation: [tests/bulk-actions.spec.ts](../tests/bulk-actions.spec.ts)

**Preconditions:** Authenticated baseline.

1. Inspect invitation button, count and select-all.

**Expected:** Invite disabled; count 0; select-all unchecked.

#### QF-BULK-02 — Selecting and deselecting one user updates count and action

Priority: **P2** · Automation: [tests/bulk-actions.spec.ts](../tests/bulk-actions.spec.ts)

**Preconditions:** Authenticated baseline.

1. Select Mila then deselect Mila.

**Expected:** Count 1/enabled/indeterminate then count 0/disabled/not indeterminate.

#### QF-BULK-03 — Select all selects six rows and can clear them

Priority: **P2** · Automation: [tests/bulk-actions.spec.ts](../tests/bulk-actions.spec.ts)

**Preconditions:** Authenticated baseline.

1. Check select-all.
2. inspect all row checkboxes.
3. uncheck select-all.

**Expected:** Six selected, then none; each checkbox matches.

#### QF-BULK-04 — Select all applies only to visible filtered users

Priority: **P2** · Automation: [tests/bulk-actions.spec.ts](../tests/bulk-actions.spec.ts)

**Preconditions:** Viewer filter active.

1. Select all visible users.
2. return to All roles.

**Expected:** Only Mila and Ethan selected; count 2; header checkbox indeterminate.

#### QF-BULK-05 — Selection persists when a selected row is filtered out

Priority: **P2** · Automation: [tests/bulk-actions.spec.ts](../tests/bulk-actions.spec.ts)

**Preconditions:** Authenticated baseline.

1. Select Sofia.
2. hide her with Viewer filter.
3. restore All roles.

**Expected:** Count remains 1; Sofia remains selected when visible again.

#### QF-BULK-06 — Clearing visible selections preserves a hidden selection

Priority: **P2** · Automation: [tests/bulk-actions.spec.ts](../tests/bulk-actions.spec.ts)

**Preconditions:** Ava selected before applying Viewer filter.

1. Select all visible Viewers.
2. unselect all visible.
3. return to All roles.

**Expected:** Count 3 then 1; hidden Ava selection preserved.

#### QF-BULK-07 — Two invitations show Sending then clear selection

Priority: **P1** · Automation: [tests/bulk-actions.spec.ts](../tests/bulk-actions.spec.ts)

**Preconditions:** Mila and Sofia selected.

1. Click Invite selected 2.
2. observe async completion.

**Expected:** Sending… 2 disabled; two-user toast; all selections cleared; button disabled at 0; statuses unchanged.

#### QF-BULK-08 — All-user invitation reports the selected count

Priority: **P2** · Automation: [tests/bulk-actions.spec.ts](../tests/bulk-actions.spec.ts)

**Preconditions:** All six users selected.

1. Send invitations.

**Expected:** Six-user notification; selection count resets to 0; header unchecked.

#### QF-BULK-09 — Invitations can be sent again after a completed batch

Priority: **P2** · Automation: [tests/bulk-actions.spec.ts](../tests/bulk-actions.spec.ts)

**Preconditions:** Authenticated baseline.

1. Send one invitation.
2. select two new users after completion.
3. send again.

**Expected:** Correct one-user then two-user notifications; action resets after both batches.

#### QF-BULK-10 — Empty results cannot add users to a selection

Priority: **P2** · Automation: [tests/bulk-actions.spec.ts](../tests/bulk-actions.spec.ts)

**Preconditions:** Search has zero results.

1. Click select-all.

**Expected:** Selection count stays 0; Invite remains disabled.

### STATUS

#### QF-STATUS-01 — Suspended becomes Active with async feedback and metrics

Priority: **P1** · Automation: [tests/status.spec.ts](../tests/status.spec.ts)

**Preconditions:** Sofia Suspended, active metric 4.

1. Click Sofia's status.
2. observe Updating.
3. await completion.

**Expected:** Updating… disabled; Active status and toast; active 5, pending 1, total 6.

#### QF-STATUS-02 — Active becomes Suspended with async feedback and metrics

Priority: **P1** · Automation: [tests/status.spec.ts](../tests/status.spec.ts)

**Preconditions:** Ava Active, active metric 4.

1. Click Ava's status.
2. observe Updating.
3. await completion.

**Expected:** Updating… disabled; Suspended status and toast; active 3, pending 1, total 6.

#### QF-STATUS-03 — Pending becomes Active with async feedback and metrics

Priority: **P1** · Automation: [tests/status.spec.ts](../tests/status.spec.ts)

**Preconditions:** Mila Pending, pending metric 1.

1. Click Mila's status.
2. observe Updating.
3. await completion.

**Expected:** Updating… disabled; Active status and toast; active 5, pending 0, total 6.

#### QF-STATUS-04 — Status changes affect only the chosen user

Priority: **P2** · Automation: [tests/status.spec.ts](../tests/status.spec.ts)

**Preconditions:** Authenticated baseline.

1. Activate Sofia.
2. inspect Mila and Ava.

**Expected:** Only Sofia changes; Mila Pending and Ava Active remain.

#### QF-STATUS-05 — Status changes can be reversed

Priority: **P2** · Automation: [tests/status.spec.ts](../tests/status.spec.ts)

**Preconditions:** Authenticated baseline.

1. Activate Sofia.
2. suspend Sofia after completion.

**Expected:** Final Suspended state; active metric restored to 4.

#### QF-STATUS-06 — Mutation preserves active filters and selection

Priority: **P2** · Automation: [tests/status.spec.ts](../tests/status.spec.ts)

**Preconditions:** Manager filter, Sofia search, Sofia selected.

1. Activate Sofia.

**Expected:** Filter values, one visible row and selected checkbox preserved.

### AUDIT

#### QF-AUDIT-01 — Audit initially shows the first four events in order

Priority: **P1** · Automation: [tests/audit.spec.ts](../tests/audit.spec.ts)

**Preconditions:** Authenticated, Audit opened.

1. Inspect initial events and controls.

**Expected:** First four seed events in exact order; Ready; Load more visible.

#### QF-AUDIT-02 — Load more shows a disabled loading state then all eight events

Priority: **P2** · Automation: [tests/audit.spec.ts](../tests/audit.spec.ts)

**Preconditions:** Audit initial four events.

1. Click Load more.

**Expected:** Loading… disabled; eight ordered events; Load more hidden.

#### QF-AUDIT-03 — Debounced role search exposes Filtering then Ready

Priority: **P1** · Automation: [tests/audit.spec.ts](../tests/audit.spec.ts)

**Preconditions:** Audit initial four events.

1. Search role.

**Expected:** Filtering… then Ready; only role-change event; Load more hidden.

#### QF-AUDIT-04 — Search is case-insensitive and trims whitespace

Priority: **P2** · Automation: [tests/audit.spec.ts](../tests/audit.spec.ts)

**Preconditions:** Audit initial four events.

1. Search padded uppercase ROLE.

**Expected:** Only role-change event; Ready.

#### QF-AUDIT-05 — No-match state recovers when the search is cleared

Priority: **P2** · Automation: [tests/audit.spec.ts](../tests/audit.spec.ts)

**Preconditions:** Audit initial four events.

1. Search nonexistent.
2. clear search.

**Expected:** No matching events and zero articles; clear restores first four and Load more.

#### QF-AUDIT-06 — Rapid input cancels stale debounce work

Priority: **P2** · Automation: [tests/audit.spec.ts](../tests/audit.spec.ts)

**Preconditions:** Audit with Playwright virtual clock.

1. Type role.
2. advance 100 ms.
3. replace with MFA.
4. advance 299 then 1 ms.

**Expected:** Prior results and Filtering at 299 ms; only MFA event and Ready at 300 ms.

#### QF-AUDIT-07 — Search covers events that have not yet been loaded

Priority: **P2** · Automation: [tests/audit.spec.ts](../tests/audit.spec.ts)

**Preconditions:** Audit first page only.

1. Search archived.

**Expected:** Eighth seed event is returned although not previously loaded.

#### QF-AUDIT-08 — Clearing a filter preserves the expanded event limit

Priority: **P2** · Automation: [tests/audit.spec.ts](../tests/audit.spec.ts)

**Preconditions:** Audit expanded to eight events.

1. Filter role.
2. clear filter.

**Expected:** One filtered row then eight restored; no Load more.

#### QF-AUDIT-09 — Export CSV produces the documented simulation notification

Priority: **P2** · Automation: [tests/audit.spec.ts](../tests/audit.spec.ts)

**Preconditions:** Audit screen.

1. Click Export CSV.

**Expected:** Documented export-prepared notification; four original rows remain; real download is outside demo contract.

#### QF-AUDIT-10 — Whitespace-only event search leaves results unfiltered

Priority: **P2** · Automation: [tests/audit.spec.ts](../tests/audit.spec.ts)

**Preconditions:** Audit initial four events.

1. Search whitespace only.

**Expected:** Ready; four initial events; Load more remains visible.

### NAV

#### QF-NAV-01 — Main navigation updates heading breadcrumb and URL hash

Priority: **P2** · Automation: [tests/navigation.spec.ts](../tests/navigation.spec.ts)

**Preconditions:** Authenticated baseline.

1. Navigate Audit, Challenges, Users.

**Expected:** Each heading, breadcrumb and hash match; sections switch correctly.

#### QF-NAV-02 — Keyboard shortcuts switch Users and Audit

Priority: **P2** · Automation: [tests/navigation.spec.ts](../tests/navigation.spec.ts)

**Preconditions:** Authenticated, focus outside form fields.

1. Press 2 then 1.

**Expected:** Audit then Users displayed.

#### QF-NAV-03 — Typing shortcut digits in search does not navigate

Priority: **P2** · Automation: [tests/navigation.spec.ts](../tests/navigation.spec.ts)

**Preconditions:** Authenticated, user search focused.

1. Type keyboard shortcut digit 2.

**Expected:** Search receives digit; Users and #users retained.

#### QF-NAV-04 — Reset restores users metrics filters and bulk selection

Priority: **P1** · Automation: [tests/navigation.spec.ts](../tests/navigation.spec.ts)

**Preconditions:** Create Maya, activate Sofia, select Mila, apply filters.

1. Click Reset lab data.

**Expected:** Six seeds; active 4/pending 1; Sofia Suspended; Maya removed; filters and selection cleared; reset toast.

#### QF-NAV-05 — Reset is idempotent

Priority: **P2** · Automation: [tests/navigation.spec.ts](../tests/navigation.spec.ts)

**Preconditions:** Authenticated baseline.

1. Click Reset lab data twice.

**Expected:** Six seed rows and baseline summary remain.

#### QF-NAV-06 — Toast is transient and disappears after its lifetime

Priority: **P2** · Automation: [tests/navigation.spec.ts](../tests/navigation.spec.ts)

**Preconditions:** Authenticated with virtual clock installed.

1. Trigger Edit toast.
2. advance 3200 ms.

**Expected:** Toast first visible then removed.

#### QF-NAV-07 — Form fields support forward and reverse keyboard navigation

Priority: **P2** · Automation: [tests/navigation.spec.ts](../tests/navigation.spec.ts)

**Preconditions:** Add user dialog open.

1. Focus name.
2. Tab to email.
3. Tab to role.
4. Shift+Tab to email.

**Expected:** Form fields follow logical forward and reverse keyboard order.

#### QF-NAV-08 — Fresh browser reload restores disposable demo data

Priority: **P2** · Automation: [tests/navigation.spec.ts](../tests/navigation.spec.ts)

**Preconditions:** Create a disposable seventh user; remember option off.

1. Reload page.
2. sign in.

**Expected:** Fresh six-user demo baseline; new user absent.

#### QF-NAV-09 — Mobile viewport supports login navigation table and dialog

Priority: **P2** · Automation: [tests/navigation.spec.ts](../tests/navigation.spec.ts)

**Preconditions:** Authenticated, viewport changed to 390x844.

1. Sign out/in.
2. create user.
3. navigate Audit.

**Expected:** Login, user row, modal controls and Audit heading operable at narrow width.

### CHALLENGE

#### QF-CHALLENGE-01 — Nine exercise cards are grouped into three difficulty levels

Priority: **P1** · Automation: [tests/challenges.spec.ts](../tests/challenges.spec.ts)

**Preconditions:** Challenges screen.

1. Inspect levels and card headings.

**Expected:** Nine ordered exercise titles; three levels with three cards each.

#### QF-CHALLENGE-02 — Every exercise has a brief expected outcome and completion control

Priority: **P2** · Automation: [tests/challenges.spec.ts](../tests/challenges.spec.ts)

**Preconditions:** Challenges screen.

1. Inspect every brief, expected outcome and completion checkbox.

**Expected:** Briefs nonempty; expected outcomes present; all completion checkboxes unchecked.

#### QF-CHALLENGE-03 — Each exercise can independently be marked complete and undone

Priority: **P2** · Automation: [tests/challenges.spec.ts](../tests/challenges.spec.ts)

**Preconditions:** Challenges screen.

1. Check and uncheck each of nine completion controls.

**Expected:** Each corresponding card gains and loses done state.

#### QF-CHALLENGE-04 — Completion persists when switching views

Priority: **P2** · Automation: [tests/challenges.spec.ts](../tests/challenges.spec.ts)

**Preconditions:** Challenges screen.

1. Complete exercise 04.
2. visit Users.
3. return.

**Expected:** 04 remains checked; 05 remains unchecked.

#### QF-CHALLENGE-05 — Solutions stay hidden until the separate guide is opened

Priority: **P2** · Automation: [tests/challenges.spec.ts](../tests/challenges.spec.ts)

**Preconditions:** Challenges screen.

1. Verify hidden guide.
2. open solution guide.

**Expected:** Separate guide visible; challenge heading hidden; #solutions/breadcrumb correct; nine panels.

#### QF-CHALLENGE-06 — All nine solution panels can expand and collapse

Priority: **P2** · Automation: [tests/challenges.spec.ts](../tests/challenges.spec.ts)

**Preconditions:** Solution guide.

1. Expand and collapse each of nine panels.

**Expected:** Code initially hidden; nonempty Playwright code shown on expansion; hidden on collapse.

#### QF-CHALLENGE-07 — Back from solutions restores the challenge screen

Priority: **P2** · Automation: [tests/challenges.spec.ts](../tests/challenges.spec.ts)

**Preconditions:** Solution guide.

1. Click Back to challenges.

**Expected:** Challenges visible; guide hidden; #challenges URL.

### DEFECT

#### QF-DEFECT-01 — Retained audit search must still filter after navigation

Priority: **P2** · Automation: [tests/defects.spec.ts](../tests/defects.spec.ts)

**Preconditions:** Audit filtered to role.

1. Navigate Users then Audit.

**Expected:** Retained role search must still show only the role event; current deployment fails.

#### QF-DEFECT-02 — Exercise 02 validation assertions must locate visible errors uniquely

Priority: **P2** · Automation: [tests/defects.spec.ts](../tests/defects.spec.ts)

**Preconditions:** Published exercise 02 guide.

1. Read the validation assertions.
2. submit blank Add user form.

**Expected:** Name and role locators must be unique and visible; email assertion must match the real error; current deployment fails all three.

#### QF-DEFECT-03 — Exercise 07 Updating assertion must uniquely locate the status control

Priority: **P2** · Automation: [tests/defects.spec.ts](../tests/defects.spec.ts)

**Preconditions:** Published exercise 07 guide; frozen timer during status update.

1. Use the guide's Updating locator against Sofia's row.

**Expected:** Locator must match one Updating control; current guide also matches Edit and Delete.

#### QF-DEFECT-05 — Keep this lab session must retain demo sign-in on reload

Priority: **P2** · Automation: [tests/defects.spec.ts](../tests/defects.spec.ts)

**Preconditions:** Login with Keep this lab session checked.

1. Sign in successfully then reload.

**Expected:** Demo sign-in should be retained; current deployment fails; acceptance based on the checkbox label.

#### QF-DEFECT-06 — Exercise 08 Ready assertion must exclude unrelated hidden content

Priority: **P2** · Automation: [tests/defects.spec.ts](../tests/defects.spec.ts)

**Preconditions:** Published exercise 08 guide and Audit filtered to role.

1. Wait for Ready.
2. evaluate the guide's Ready locator.

**Expected:** Locator must uniquely target the visible audit state rather than hidden metric, challenge and code text.

### GUIDE

#### QF-GUIDE-01 — Exercise 07 Active metric locator resolves the expected value

Priority: **P2** · Automation: [tests/guide.spec.ts](../tests/guide.spec.ts)

**Preconditions:** Published exercise 07 guide; Sofia activated.

1. Use the guide's Active metric locator.

**Expected:** Locator resolves one element containing 5; investigated and confirmed working.
