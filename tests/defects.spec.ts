import { authenticatedTest as test, expect } from '../src/fixtures/test';
import { auditEvents } from '../src/data/users';

// These are ordinary failing acceptance tests, never skipped or marked test.fail().
// They remain part of the default release gate until the application is fixed.

test('QF-DEFECT-01 Retained audit search must still filter after navigation @defect', async ({ audit, shell }) => {
  await shell.navigate('Audit log'); await audit.search.fill('role'); await expect(audit.details).toHaveText([auditEvents[2]]);
  await shell.navigate('Users'); await shell.navigate('Audit log');
  await expect(audit.search).toHaveValue('role');
  await expect(audit.details, 'Visible search value and rendered results must agree').toHaveText([auditEvents[2]]);
});

test('QF-DEFECT-02 Exercise 02 validation assertions must locate visible errors uniquely @defect', async ({ shell, challenges, solutions, users, userDialog: form, page }) => {
  await shell.navigate('Challenges'); await challenges.openSolutions(); await solutions.expand('02');
  const code = await solutions.item('02').locator('code').innerText();
  const emailMessage = code.match(/getByText\('([^']*work email)'\)/)?.[1];
  expect(emailMessage, 'Guide should specify a work-email validation assertion').toBeTruthy();
  await shell.navigate('Users'); await users.add(); await form.save.click();
  const nameError = code.includes("page.locator('#name-validation')") ? form.nameError : page.getByText('Enter a full name');
  const roleError = code.includes('data-error=') ? form.roleError : page.getByText('Choose a role');
  await expect.soft(nameError, 'Published name-error assertion must exclude hidden guide code').toBeVisible();
  await expect.soft(page.getByText(emailMessage!, { exact: true }), 'The exact email error asserted by the published solution must exist').toBeVisible();
  await expect.soft(roleError, 'Published role-error assertion must exclude the option and hidden guide code').toBeVisible();
});

test('QF-DEFECT-03 Exercise 07 Updating assertion must uniquely locate the status control @defect', async ({ shell, challenges, solutions, users, page }) => {
  await shell.navigate('Challenges'); await challenges.openSolutions(); await solutions.expand('07');
  const code = await solutions.item('07').locator('code').innerText();
  await shell.navigate('Users'); await page.clock.install(); await page.clock.pauseAt(new Date());
  await users.status('Sofia Anders', 'Suspended').click();
  // Match the locator form supplied by the guide, allowing a corrected scoped locator to pass.
  const scoped = /row\.getByRole\('button',\s*\{\s*name:\s*'Updating status'/.test(code);
  const target = scoped ? users.status('Sofia Anders', 'Updating status') : users.row('Sofia Anders').getByRole('button');
  await expect(target, 'The solution currently selects Edit and Delete as well as status').toHaveCount(1);
  await expect(target).toHaveText('Updating…');
});

test('QF-DEFECT-05 Keep this lab session must retain demo sign-in on reload @defect', async ({ login, shell, users, page }) => {
  await shell.signOut(); await login.remember.check(); await login.signIn(); await expect(users.heading).toBeVisible();
  await page.reload();
  await expect(users.heading, 'The checked session option should preserve sign-in across reload').toBeVisible();
});

test('QF-DEFECT-06 Exercise 08 Ready assertion must exclude unrelated hidden content @defect', async ({ shell, challenges, solutions, audit, page }) => {
  await shell.navigate('Challenges'); await challenges.openSolutions(); await solutions.expand('08');
  const code = await solutions.item('08').locator('code').innerText();
  await shell.navigate('Audit log'); await audit.search.fill('role'); await expect(audit.state).toHaveText('Ready');
  const ready = code.includes("page.locator('#debounce-state')") ? audit.state : page.getByText('Ready');
  await expect(ready, 'Published locator also matches hidden metric text, exercise text and solution code').toBeVisible();
});
