import { authenticatedTest as test, expect } from '../src/fixtures/test';
import { auditEvents } from '../src/data/users';

// These acceptance tests preserve regressions found during the first full run.

test('QF-DEFECT-01 Retained audit search must still filter after navigation @regression', async ({
  audit,
  shell,
}) => {
  await shell.navigate('Audit log');
  await audit.search.fill('role');
  await expect(audit.details).toHaveText([auditEvents[2]]);
  await shell.navigate('Users');
  await shell.navigate('Audit log');
  await expect(audit.search).toHaveValue('role');
  await expect(audit.details, 'Visible search value and rendered results must agree').toHaveText([
    auditEvents[2],
  ]);
});

test('QF-DEFECT-02 Exercise 02 validation assertions must locate visible errors uniquely @regression', async ({
  shell,
  challenges,
  solutions,
  users,
  userDialog: form,
}) => {
  await shell.navigate('Challenges');
  await challenges.openSolutions();
  await solutions.expand('02');
  const code = await solutions.item('02').locator('code').innerText();
  expect(code).toContain("page.locator('#name-validation')");
  expect(code).toContain("page.locator('#work-email-validation')");
  expect(code).toContain('page.locator(\'[data-error="role"]\')');
  expect(code).toContain("toHaveText('Enter a valid work email')");
  await shell.navigate('Users');
  await users.add();
  await form.save.click();
  await expect(form.nameError).toHaveText('Enter a full name');
  await expect(form.emailError).toHaveText('Enter a valid work email');
  await expect(form.roleError).toHaveText('Choose a role');
});

test('QF-DEFECT-03 Exercise 07 Updating assertion must uniquely locate the status control @regression', async ({
  shell,
  challenges,
  solutions,
  users,
  page,
}) => {
  await shell.navigate('Challenges');
  await challenges.openSolutions();
  await solutions.expand('07');
  const code = await solutions.item('07').locator('code').innerText();
  await shell.navigate('Users');
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await users.status('Sofia Anders', 'Suspended').click();
  // Match the locator form supplied by the guide, allowing a corrected scoped locator to pass.
  const scoped = /row\.getByRole\('button',\s*\{\s*name:\s*'Updating status'/.test(code);
  const target = scoped
    ? users.status('Sofia Anders', 'Updating status')
    : users.row('Sofia Anders').getByRole('button');
  await expect(target, 'The solution currently selects Edit and Delete as well as status').toHaveCount(1);
  await expect(target).toHaveText('Updating…');
});

test('QF-DEFECT-05 Keep this lab session must retain demo sign-in on reload @regression', async ({
  login,
  shell,
  users,
  page,
}) => {
  await shell.signOut();
  await login.remember.check();
  await login.signIn();
  await expect(users.heading).toBeVisible();
  await page.reload();
  await expect(
    users.heading,
    'The checked session option should preserve sign-in across reload',
  ).toBeVisible();
});

test('QF-DEFECT-06 Exercise 08 Ready assertion must exclude unrelated hidden content @regression', async ({
  shell,
  challenges,
  solutions,
  audit,
  page,
}) => {
  await shell.navigate('Challenges');
  await challenges.openSolutions();
  await solutions.expand('08');
  const code = await solutions.item('08').locator('code').innerText();
  await shell.navigate('Audit log');
  await audit.search.fill('role');
  await expect(audit.state).toHaveText('Ready');
  const ready = code.includes("page.locator('#debounce-state')") ? audit.state : page.getByText('Ready');
  await expect(
    ready,
    'Published locator also matches hidden metric text, exercise text and solution code',
  ).toBeVisible();
});
