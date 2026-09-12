import { authenticatedTest as test, expect } from '../src/fixtures/test';

for (const [id, name, from, to, active, pending] of [
  ['01', 'Sofia Anders', 'Suspended', 'Active', '5', '1'],
  ['02', 'Ava Rodriguez', 'Active', 'Suspended', '3', '1'],
  ['03', 'Mila Petrova', 'Pending', 'Active', '5', '0'],
] as const) {
  test(`QF-STATUS-${id} ${from} becomes ${to} with async feedback and metrics @smoke`, async ({ users, shell }) => {
    await users.status(name, from).click();
    await expect(users.status(name, 'Updating status')).toHaveText('Updating…');
    await expect(users.status(name, 'Updating status')).toBeDisabled();
    await expect(users.status(name, to)).toBeVisible();
    await expect(shell.toast(`${name} is now ${to}`)).toBeVisible();
    await expect(users.metric('Active')).toHaveText(active); await expect(users.metric('Pending')).toHaveText(pending);
    await expect(users.metric('Total users')).toHaveText('6');
  });
}

test('QF-STATUS-04 Status changes affect only the chosen user', async ({ users }) => {
  await users.status('Sofia Anders', 'Suspended').click(); await expect(users.status('Sofia Anders', 'Active')).toBeVisible();
  await expect(users.status('Mila Petrova', 'Pending')).toBeVisible(); await expect(users.status('Ava Rodriguez', 'Active')).toBeVisible();
});

test('QF-STATUS-05 Status changes can be reversed', async ({ users }) => {
  await users.status('Sofia Anders', 'Suspended').click(); await expect(users.status('Sofia Anders', 'Active')).toBeVisible();
  await users.status('Sofia Anders', 'Active').click(); await expect(users.status('Sofia Anders', 'Suspended')).toBeVisible();
  await expect(users.metric('Active')).toHaveText('4');
});

test('QF-STATUS-06 Mutation preserves active filters and selection', async ({ users }) => {
  await users.filter('Manager'); await users.search.fill('Sofia'); await users.select('Sofia Anders');
  await users.status('Sofia Anders', 'Suspended').click(); await expect(users.status('Sofia Anders', 'Active')).toBeVisible();
  await expect(users.roleFilter).toHaveValue('Manager'); await expect(users.search).toHaveValue('Sofia');
  await expect(users.rows).toHaveCount(1); await expect(users.row('Sofia Anders').getByRole('checkbox')).toBeChecked();
});
