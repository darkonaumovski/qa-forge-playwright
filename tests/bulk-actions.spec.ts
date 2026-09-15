import { authenticatedTest as test, expect } from '../src/fixtures/test';

test('QF-BULK-01 Invitation action starts disabled with no selection', async ({ users }) => {
  await expect(users.invite).toBeDisabled();
  await expect(users.selectedCount).toHaveText('0');
  await expect(users.selectAll).not.toBeChecked();
});

test('QF-BULK-02 Selecting and deselecting one user updates count and action', async ({ users }) => {
  await users.select('Mila Petrova');
  await expect(users.selectedCount).toHaveText('1');
  await expect(users.invite).toBeEnabled();
  await expect(users.selectAll).toHaveJSProperty('indeterminate', true);
  await users.select('Mila Petrova', false);
  await expect(users.selectedCount).toHaveText('0');
  await expect(users.invite).toBeDisabled();
  await expect(users.selectAll).toHaveJSProperty('indeterminate', false);
});

test('QF-BULK-03 Select all selects six rows and can clear them', async ({ users }) => {
  await users.selectAll.check();
  await expect(users.selectedCount).toHaveText('6');
  for (const checkbox of await users.rows.getByRole('checkbox').all()) await expect(checkbox).toBeChecked();
  await users.selectAll.uncheck();
  await expect(users.selectedCount).toHaveText('0');
  for (const checkbox of await users.rows.getByRole('checkbox').all())
    await expect(checkbox).not.toBeChecked();
});

test('QF-BULK-04 Select all applies only to visible filtered users', async ({ users }) => {
  await users.filter('Viewer');
  await users.selectAll.check();
  await expect(users.selectedCount).toHaveText('2');
  await users.filter('all');
  await expect(users.row('Mila Petrova').getByRole('checkbox')).toBeChecked();
  await expect(users.row('Ethan Brooks').getByRole('checkbox')).toBeChecked();
  await expect(users.row('Ava Rodriguez').getByRole('checkbox')).not.toBeChecked();
  await expect(users.selectAll).toHaveJSProperty('indeterminate', true);
});

test('QF-BULK-05 Selection persists when a selected row is filtered out', async ({ users }) => {
  await users.select('Sofia Anders');
  await users.filter('Viewer');
  await expect(users.selectedCount).toHaveText('1');
  await expect(users.selectAll).not.toBeChecked();
  await users.filter('all');
  await expect(users.row('Sofia Anders').getByRole('checkbox')).toBeChecked();
});

test('QF-BULK-06 Clearing visible selections preserves a hidden selection', async ({ users }) => {
  await users.select('Ava Rodriguez');
  await users.filter('Viewer');
  await users.selectAll.check();
  await expect(users.selectedCount).toHaveText('3');
  await users.selectAll.uncheck();
  await expect(users.selectedCount).toHaveText('1');
  await users.filter('all');
  await expect(users.row('Ava Rodriguez').getByRole('checkbox')).toBeChecked();
});

test('QF-BULK-07 Two invitations show Sending then clear selection @smoke', async ({ users, shell }) => {
  await users.select('Mila Petrova');
  await users.select('Sofia Anders');
  await expect(users.invite).toHaveText('Invite selected 2');
  await users.invite.click();
  await expect(users.invite).toHaveText('Sending… 2');
  await expect(users.invite).toBeDisabled();
  await expect(shell.toast('Invitations sent to 2 users')).toBeVisible();
  await expect(users.invite).toHaveText('Invite selected 0');
  await expect(users.invite).toBeDisabled();
  for (const checkbox of await users.rows.getByRole('checkbox').all())
    await expect(checkbox).not.toBeChecked();
  await expect(users.status('Mila Petrova', 'Pending')).toBeVisible();
  await expect(users.status('Sofia Anders', 'Suspended')).toBeVisible();
});

test('QF-BULK-08 All-user invitation reports the selected count', async ({ users, shell }) => {
  await users.selectAll.check();
  await users.invite.click();
  await expect(shell.toast('Invitations sent to 6 users')).toBeVisible();
  await expect(users.selectedCount).toHaveText('0');
  await expect(users.selectAll).not.toBeChecked();
});

test('QF-BULK-09 Invitations can be sent again after a completed batch', async ({ users, shell }) => {
  await users.select('Mila Petrova');
  await users.invite.click();
  await expect(shell.toast('Invitations sent to 1 users')).toBeVisible();
  await users.select('Ava Rodriguez');
  await users.select('Liam Chen');
  await users.invite.click();
  await expect(shell.toast('Invitations sent to 2 users')).toBeVisible();
  await expect(users.invite).toBeDisabled();
});

test('QF-BULK-10 Empty results cannot add users to a selection', async ({ users }) => {
  await users.search.fill('missing-user');
  await expect(users.rows).toHaveCount(0);
  await users.selectAll.click();
  await expect(users.selectedCount).toHaveText('0');
  await expect(users.invite).toBeDisabled();
});
