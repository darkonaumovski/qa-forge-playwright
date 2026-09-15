import { authenticatedTest as test, expect } from '../src/fixtures/test';
import { newUser } from '../src/data/users';

test('QF-NAV-01 Main navigation updates heading breadcrumb and URL hash', async ({
  shell,
  users,
  audit,
  challenges,
  page,
}) => {
  for (const [view, hash, heading] of [
    ['Audit log', 'audit', audit.heading],
    ['Challenges', 'challenges', challenges.heading],
    ['Users', 'users', users.heading],
  ] as const) {
    await shell.navigate(view);
    await expect(heading).toBeVisible();
    await expect(shell.breadcrumb).toHaveText(view);
    await expect(page).toHaveURL(new RegExp(`#${hash}$`));
  }
});

test('QF-NAV-02 Keyboard shortcuts switch Users and Audit', async ({ page, audit, users }) => {
  await users.heading.click();
  await page.keyboard.press('2');
  await expect(audit.heading).toBeVisible();
  await page.keyboard.press('1');
  await expect(users.heading).toBeVisible();
});

test('QF-NAV-03 Typing shortcut digits in search does not navigate', async ({ page, users }) => {
  await users.search.fill('');
  await users.search.press('2');
  await expect(users.search).toHaveValue('2');
  await expect(users.heading).toBeVisible();
  await expect(page).toHaveURL(/#users$/);
});

test('QF-NAV-04 Reset restores users metrics filters and bulk selection @smoke', async ({
  users,
  userDialog: form,
  shell,
}) => {
  await users.add();
  await form.create(newUser());
  await expect(users.rows).toHaveCount(7);
  await users.status('Sofia Anders', 'Suspended').click();
  await expect(users.status('Sofia Anders', 'Active')).toBeVisible();
  await users.select('Mila Petrova');
  await users.filter('Manager');
  await users.search.fill('Sofia');
  await shell.reset();
  await expect(shell.toast('Lab data reset')).toBeVisible();
  await expect(users.rows).toHaveCount(6);
  await expect(users.search).toHaveValue('');
  await expect(users.roleFilter).toHaveValue('all');
  await expect(users.selectedCount).toHaveText('0');
  await expect(users.invite).toBeDisabled();
  await expect(users.metric('Active')).toHaveText('4');
  await expect(users.metric('Pending')).toHaveText('1');
  await expect(users.status('Sofia Anders', 'Suspended')).toBeVisible();
  await expect(users.row('Maya Chen')).toHaveCount(0);
});

test('QF-NAV-05 Reset is idempotent', async ({ shell, users }) => {
  await shell.reset();
  await shell.reset();
  await expect(users.rows).toHaveCount(6);
  await expect(users.summary).toHaveText('Showing 6 of 6 users');
});

test('QF-NAV-06 Toast is transient and disappears after its lifetime', async ({ page, users, shell }) => {
  await page.clock.install();
  await users.edit('Mila Petrova');
  const toast = shell.toast('Editing Mila Petrova — practice target reached');
  await expect(toast).toBeVisible();
  await page.clock.runFor(3200);
  await expect(toast).toHaveCount(0);
});

test('QF-NAV-07 Form fields support forward and reverse keyboard navigation', async ({
  users,
  userDialog: form,
  page,
}) => {
  await users.add();
  await form.name.focus();
  await page.keyboard.press('Tab');
  await expect(form.email).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(form.role).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(form.email).toBeFocused();
});

test('QF-NAV-08 Fresh browser reload restores disposable demo data', async ({
  users,
  userDialog: form,
  login,
  page,
}) => {
  await users.add();
  await form.create(newUser());
  await expect(users.rows).toHaveCount(7);
  await page.reload();
  await expect(login.form).toBeVisible();
  await login.signIn();
  await expect(users.rows).toHaveCount(6);
  await expect(users.row('Maya Chen')).toHaveCount(0);
});

test('QF-NAV-09 Mobile viewport supports login navigation table and dialog', async ({
  page,
  shell,
  users,
  userDialog: form,
  login,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await shell.signOut();
  await login.signIn();
  await expect(users.heading).toBeVisible();
  await users.add();
  await form.create(newUser());
  await expect(form.dialog).toBeHidden();
  await expect(users.row('Maya Chen')).toBeVisible();
  await shell.navigate('Audit log');
  await expect(page.getByRole('heading', { name: 'Audit log', exact: true })).toBeVisible();
});
