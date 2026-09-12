import { authenticatedTest as test, expect } from '../src/fixtures/test';
import { newUser, type UserRole } from '../src/data/users';

test.beforeEach(async ({ users }) => { await users.add(); });

test('QF-FORM-01 New-user dialog has correct defaults and options', async ({ userDialog: form }) => {
  await expect(form.dialog).toBeVisible(); await expect(form.dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await expect(form.name).toHaveValue(''); await expect(form.email).toHaveValue('');
  await expect(form.role).toHaveValue('');
  await expect(form.role.locator('option')).toHaveText(['Choose a role', 'Admin', 'Manager', 'Viewer']);
  await expect(form.timezone).toHaveValue('Europe/Skopje');
  await expect(form.timezone.locator('option')).toHaveText(['Europe/Skopje', 'Europe/London', 'America/New_York', 'Asia/Singapore']);
  await expect(form.welcome).toBeChecked(); await expect(form.mfa).not.toBeChecked();
});

test('QF-FORM-02 Empty submit reports three errors and focuses the first invalid field @smoke', async ({ userDialog: form, users }) => {
  await form.save.click();
  await expect(form.nameError).toHaveText('Enter a full name');
  await expect(form.emailError).toHaveText('Enter a valid work email');
  await expect(form.roleError).toHaveText('Choose a role');
  for (const field of [form.name, form.email, form.role]) await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(form.name).toBeFocused(); await expect(form.dialog).toBeVisible(); await expect(users.rows).toHaveCount(6);
});

for (const [id, name, label] of [['03', 'Al', 'two-character name'], ['04', '   ', 'whitespace name'], ['05', ' A ', 'trimmed short name']]) {
  test(`QF-FORM-${id} Rejects ${label}`, async ({ userDialog: form }) => {
    await form.create(newUser({ name })); await expect(form.nameError).toHaveText('Enter a full name');
    await expect(form.name).toBeFocused(); await expect(form.dialog).toBeVisible();
  });
}

for (const [id, email, label] of [['06', '', 'empty email'], ['07', 'maya.example.com', 'missing at sign'], ['08', 'maya@example', 'missing domain suffix'], ['09', 'maya chen@example.com', 'internal whitespace']]) {
  test(`QF-FORM-${id} Rejects ${label}`, async ({ userDialog: form }) => {
    await form.create(newUser({ email })); await expect(form.emailError).toHaveText('Enter a valid work email');
    await expect(form.email).toBeFocused(); await expect(form.dialog).toBeVisible();
  });
}

test('QF-FORM-10 Role is mandatory', async ({ userDialog: form }) => {
  await form.name.fill('Maya Chen'); await form.email.fill('maya@example.com'); await form.save.click();
  await expect(form.roleError).toHaveText('Choose a role'); await expect(form.role).toBeFocused();
});

for (const [id, email, label] of [['11', 'ava@qaforge.dev', 'existing email'], ['12', '  AVA@QAFORGE.DEV  ', 'case and whitespace duplicate']]) {
  test(`QF-FORM-${id} Rejects ${label}`, async ({ userDialog: form, users }) => {
    await form.create(newUser({ email })); await expect(form.emailError).toHaveText('A user with this email already exists');
    await expect(users.rows).toHaveCount(6);
  });
}

for (const [id, role] of [['13', 'Admin'], ['14', 'Manager'], ['15', 'Viewer']] as const) {
  test(`QF-FORM-${id} Creates a Pending ${role} with updated metrics @smoke`, async ({ userDialog: form, users, shell }) => {
    await form.create(newUser({ role: role as UserRole }));
    await expect(form.save).toHaveText('Creating user…'); await expect(form.save).toBeDisabled();
    await expect(form.dialog).toBeHidden(); await expect(shell.toast('User created: Maya Chen')).toBeVisible();
    await expect(users.row('Maya Chen')).toContainText('maya@example.com');
    await expect(users.row('Maya Chen').getByText(role, { exact: true })).toBeVisible();
    await expect(users.status('Maya Chen', 'Pending')).toBeVisible();
    await expect(users.row('Maya Chen')).toContainText('Never');
    await expect(users.metric('Total users')).toHaveText('7'); await expect(users.metric('Pending')).toHaveText('2');
    await expect(users.metric('Admins')).toHaveText(role === 'Admin' ? '3' : '2');
    await expect(users.summary).toHaveText('Showing 7 of 7 users');
  });
}

test('QF-FORM-16 Accepts the three-character boundary and trims input', async ({ userDialog: form, users }) => {
  await form.create(newUser({ name: '  Ana  ', email: '  ana@example.com  ' }));
  await expect(users.row('Ana')).toBeVisible(); await expect(users.row('Ana')).toContainText('ana@example.com');
});

test('QF-FORM-17 Correcting validation errors permits submission', async ({ userDialog: form, users }) => {
  await form.save.click(); await expect(form.nameError).toBeVisible(); await form.create(newUser());
  await expect(form.dialog).toBeHidden(); await expect(users.row('Maya Chen')).toBeVisible();
});

test('QF-FORM-18 All timezones and account checkboxes can be selected', async ({ userDialog: form, users }) => {
  for (const timezone of ['Europe/London', 'America/New_York', 'Asia/Singapore', 'Europe/Skopje']) {
    await form.timezone.selectOption(timezone); await expect(form.timezone).toHaveValue(timezone);
  }
  await form.welcome.uncheck(); await form.mfa.check();
  await expect(form.welcome).not.toBeChecked(); await expect(form.mfa).toBeChecked();
  await form.create(newUser()); await expect(users.row('Maya Chen')).toBeVisible();
});

for (const [id, action] of [['19', 'Cancel'], ['20', 'Close'], ['21', 'Escape']] as const) {
  test(`QF-FORM-${id} ${action} discards an unsaved user`, async ({ userDialog: form, users, page }) => {
    await form.fill(newUser());
    if (action === 'Cancel') await form.cancel();
    else if (action === 'Close') await form.close();
    else await page.keyboard.press('Escape');
    await expect(form.dialog).toBeHidden(); await expect(users.rows).toHaveCount(6);
    await expect(users.row('Maya Chen')).toHaveCount(0);
  });
}

test('QF-FORM-22 Reopening clears errors and restores form defaults', async ({ userDialog: form, users }) => {
  await form.save.click(); await form.welcome.uncheck(); await form.mfa.check();
  await form.timezone.selectOption('Asia/Singapore'); await form.cancel(); await users.add();
  await expect(form.nameError).toBeEmpty(); await expect(form.emailError).toBeEmpty(); await expect(form.roleError).toBeEmpty();
  await expect(form.name).not.toHaveAttribute('aria-invalid'); await expect(form.welcome).toBeChecked();
  await expect(form.mfa).not.toBeChecked(); await expect(form.timezone).toHaveValue('Europe/Skopje');
});

test('QF-FORM-23 Creating a user clears active user filters', async ({ userDialog: form, users }) => {
  await form.cancel(); await users.filter('Viewer'); await users.search.fill('Mila'); await users.add();
  await form.create(newUser()); await expect(form.dialog).toBeHidden();
  await expect(users.search).toHaveValue(''); await expect(users.roleFilter).toHaveValue('all');
  await expect(users.rows).toHaveCount(7);
});

test('QF-FORM-24 User-supplied markup is displayed as text', async ({ userDialog: form, users, page }) => {
  const name = '<img src=x onerror="document.title=123">';
  await form.create(newUser({ name, email: 'literal@example.com' }));
  await expect(users.row(name)).toBeVisible(); await expect(users.row(name).locator('img')).toHaveCount(0);
  await expect(page).toHaveTitle('QA Forge — Playwright Practice Lab');
});
