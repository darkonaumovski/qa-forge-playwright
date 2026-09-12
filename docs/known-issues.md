# QA Forge application issues

These issues are observed against the live version 2 practice lab. They are application or learning-content issues, not ignored tests. The default suite must fail while they remain. No site code or access policy has been changed by this repository.

## QF-DEFECT-01 — audit results ignore the retained filter after navigation

Severity: medium. Reproduction: sign in, open Audit log, search `role`, wait for one event, navigate to Users, then return to Audit log.

Expected: the retained `role` search input and the event list agree, showing only “Liam Chen changed Sofia Anders role to Manager.” Actual: the input still says `role`, but four unfiltered events are rendered. The navigation click handler calls the audit renderer without passing the search input.

Suggested application fix: render audit events using the current search value whenever Audit is opened, or intentionally clear both the input and results together. The current acceptance test preserves the existing retained-input behavior.

## QF-DEFECT-02 — exercise 02 has incorrect and ambiguous validation assertions

Severity: medium; blocks learners following the supplied answer. Open the solution guide for exercise 02, then submit an empty Add user form.

Expected: the supplied email assertion locates the actual validation message. Actual: the guide asserts `Enter a work email`, while the application renders `Enter a valid work email`.

Suggested guide correction:

```ts
await expect(page.getByText('Enter a valid work email', { exact: true })).toBeVisible();
```

The name and role assertions also use global substring text queries. They match hidden solution code; the role query additionally matches the dropdown option. These fail Playwright strictness even before the missing email assertion is reached. Scope the errors to their stable validation containers (`#name-validation`, `#work-email-validation`, `[data-error="role"]`). The working automation does so; soft assertions in the defect case expose all three guide problems in one run.

## QF-DEFECT-03 — exercise 07 Updating assertion selects three buttons

Severity: medium; blocks the supplied answer. In exercise 07, click Sofia's Suspended status and use the guide's `row.getByRole('button')` locator for the Updating assertion.

Expected: the assertion targets one Updating status control. Actual: the row contains three buttons: status, Edit and Delete. A scalar `toHaveText('Updating…')` on the unscoped locator cannot succeed.

Suggested guide correction:

```ts
await expect(row.getByRole('button', { name: 'Updating status', exact: true }))
  .toHaveText('Updating…');
```

The separate Active-metric assertion in the same guide was investigated and **passes**. It is covered by QF-GUIDE-01 and is not reported as a defect.

## QF-DEFECT-05 — Keep this lab session has no session behavior

Severity: medium; acceptance clarification possible. Sign out, check `Keep this lab session`, sign in successfully, then reload.

Expected based on the label: the checked option preserves the demo sign-in during that lab session. Actual: the login screen returns; the checkbox value is never read by the application and no session state is stored.

Suggested application fix: persist only the demo sign-in state in session storage when requested and clear it on sign-out, without persisting passwords. If this is intended solely as checkbox practice, change the label to make that scope explicit and agree the revised acceptance criterion. The regression must not be silently removed to obtain a green build.

## QF-DEFECT-06 — exercise 08 Ready locator matches four elements

Severity: medium; blocks the supplied answer. Open the exercise 08 solution, navigate to Audit and filter for `role`. The guide uses `page.getByText('Ready')` with a scalar visibility assertion.

Expected: one visible audit state. Actual: four matches, including hidden “Ready to sign in” metric text, hidden exercise instructions and hidden solution code. The assertion fails strict-mode resolution. The earlier global Filtering text query is vulnerable to the same hidden-code collision.

Suggested guide correction: use `page.locator('#debounce-state')` and assert `toHaveText('Filtering…')`, then `toHaveText('Ready')`. The audit page object in this repository already uses that stable container.

## Publication decision

The user's condition requires all tests to pass and no outstanding issues before GitHub publication. These unresolved issues block that action. A local repository and reports are delivered so the application can be corrected and the complete suite rerun. No GitHub repository has been created or pushed by this task.
