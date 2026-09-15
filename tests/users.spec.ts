import { authenticatedTest as test, expect } from '../src/fixtures/test';
import { seedUsers } from '../src/data/users';

test('QF-USERS-01 Seed rows and metrics match the baseline @smoke', async ({ users }) => {
  await expect(users.rows).toHaveCount(6);
  await expect(users.summary).toHaveText('Showing 6 of 6 users');
  for (const user of seedUsers) {
    for (const value of [user.name, user.email, user.role, user.status, user.lastActive])
      await expect(users.row(user.name)).toContainText(value);
  }
  for (const [metric, value] of [
    ['Total users', '6'],
    ['Active', '4'],
    ['Pending', '1'],
    ['Admins', '2'],
  ] as const) {
    await expect(users.metric(metric)).toHaveText(value);
  }
});

for (const [id, role, names] of [
  ['02', 'Admin', ['Ava Rodriguez', 'Liam Chen']],
  ['03', 'Manager', ['Noah Williams', 'Sofia Anders']],
  ['04', 'Viewer', ['Mila Petrova', 'Ethan Brooks']],
] as const) {
  test(`QF-USERS-${id} Role filter shows only ${role} accounts`, async ({ users }) => {
    await users.filter(role);
    await expect(users.rows).toHaveCount(2);
    for (const name of names) await expect(users.row(name)).toBeVisible();
    await expect(users.summary).toHaveText('Showing 2 of 6 users');
    await expect(users.metric('Total users')).toHaveText('6');
  });
}

test('QF-USERS-05 All roles restores all users', async ({ users }) => {
  await users.filter('Admin');
  await users.filter('all');
  await expect(users.rows).toHaveCount(6);
  await expect(users.summary).toHaveText('Showing 6 of 6 users');
});

for (const [id, query, name, label] of [
  ['06', 'Mila Petrova', 'Mila Petrova', 'full name'],
  ['07', 'Rodri', 'Ava Rodriguez', 'partial name'],
  ['08', 'liam@qaforge.dev', 'Liam Chen', 'email'],
  ['09', 'sOFIA', 'Sofia Anders', 'case-insensitive text'],
  ['10', '  Ethan  ', 'Ethan Brooks', 'trimmed text'],
]) {
  test(`QF-USERS-${id} Search matches ${label}`, async ({ users }) => {
    await users.search.fill(query);
    await expect(users.rows).toHaveCount(1);
    await expect(users.row(name)).toBeVisible();
    await expect(users.summary).toHaveText('Showing 1 of 6 users');
  });
}

test('QF-USERS-11 Search and role filters intersect', async ({ users }) => {
  await users.filter('Manager');
  await users.search.fill('Sofia');
  await expect(users.rows).toHaveCount(1);
  await expect(users.row('Sofia Anders')).toBeVisible();
  await users.filter('Viewer');
  await expect(users.rows).toHaveCount(0);
  await expect(users.empty).toBeVisible();
});

test('QF-USERS-12 No matches has a zero summary and recovers on clear', async ({ users }) => {
  await users.search.fill('does-not-exist');
  await expect(users.empty).toBeVisible();
  await expect(users.summary).toHaveText('Showing 0 of 6 users');
  await expect(users.selectAll).not.toBeChecked();
  await users.search.clear();
  await expect(users.rows).toHaveCount(6);
});

test('QF-USERS-13 Whitespace-only search is unfiltered', async ({ users }) => {
  await users.search.fill('   ');
  await expect(users.rows).toHaveCount(6);
});

test('QF-USERS-14 Duplicate Edit actions are scoped to the target row @smoke', async ({ users, shell }) => {
  await expect(users.rows.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(6);
  await users.edit('Mila Petrova');
  await expect(shell.toast('Editing Mila Petrova — practice target reached')).toBeVisible();
  await expect(users.rows).toHaveCount(6);
  await expect(users.status('Mila Petrova', 'Pending')).toBeVisible();
});

test('QF-USERS-15 Delete menu is a scoped notification target', async ({ users, shell }) => {
  await users.deleteMenu('Noah Williams');
  await expect(shell.toast('Delete menu opened for Noah Williams')).toBeVisible();
  await expect(users.row('Noah Williams')).toBeVisible();
  await expect(users.rows).toHaveCount(6);
});

test('QF-USERS-16 Semantic locators survive rerender and full reload', async ({ users, login, page }) => {
  const ava = users.row('Ava Rodriguez');
  await expect(ava).toHaveAttribute('id', /^user-row-\d{4}$/);
  await users.filter('Admin');
  await expect(ava).toBeVisible();
  await users.filter('all');
  await expect(ava.getByText('Admin', { exact: true })).toBeVisible();
  await page.reload();
  await login.signIn();
  await expect(ava.getByRole('button', { name: 'Active', exact: true })).toBeVisible();
});
