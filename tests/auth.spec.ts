import { test, expect } from '../src/fixtures/test';
import { environment } from '../src/config/environment';

test('QF-AUTH-01 Login screen exposes accessible controls and demo credentials @smoke', async ({ login, page }) => {
  await login.open();
  await expect(page).toHaveTitle('QA Forge — Playwright Practice Lab');
  await expect(page.getByRole('heading', { name: 'Sign in to the lab' })).toBeVisible();
  await expect(page.getByTestId('demo-credentials')).toContainText(environment.email);
  await expect(page.getByTestId('demo-credentials')).toContainText(environment.password);
  await expect(login.email).toHaveAccessibleName('Email address');
  await expect(login.password).toHaveAttribute('type', 'password');
  await expect(login.remember).not.toBeChecked();
  await expect(page.getByRole('heading', { name: 'User management' })).toBeHidden();
});

test('QF-AUTH-02 Empty login reports both required fields', async ({ login }) => {
  await login.open(); await login.submit.click();
  await expect(login.emailError).toHaveText('Email is required');
  await expect(login.passwordError).toHaveText('Password is required');
  await expect(login.email).toHaveAttribute('aria-invalid', 'true');
  await expect(login.password).toHaveAttribute('aria-invalid', 'true');
  await expect(login.submit).toBeEnabled();
});

for (const [id, email, password, emailError, passwordError] of [
  ['03', '', environment.password, 'Email is required', ''],
  ['04', environment.email, '', '', 'Password is required'],
]) {
  test(`QF-AUTH-${id} Login validates an individually missing ${id === '03' ? 'email' : 'password'}`, async ({ login }) => {
    await login.open(); await login.fill(email, password); await login.submit.click();
    await expect(login.emailError).toHaveText(emailError);
    await expect(login.passwordError).toHaveText(passwordError);
  });
}

for (const [id, email, password, label] of [
  ['05', environment.email, 'wrong-password', 'wrong password'],
  ['06', 'unknown@example.com', environment.password, 'unknown account'],
  ['07', 'invalid-email', environment.password, 'malformed email'],
]) {
  test(`QF-AUTH-${id} Login rejects ${label}`, async ({ login, users }) => {
    await login.open(); await login.fill(email, password); await login.submit.click();
    await expect(login.alert).toHaveText('The email or password is incorrect. Use the demo credentials above.');
    await expect(login.submit).toBeEnabled(); await expect(users.heading).toBeHidden();
  });
}

test('QF-AUTH-08 Valid login shows a disabled pending state then Users @smoke', async ({ login, users, page }) => {
  await login.open(); await login.fill(); await login.submit.click();
  await expect(login.submit).toHaveText('Checking access…');
  await expect(login.submit).toBeDisabled();
  await expect(users.heading).toBeVisible(); await expect(page).toHaveURL(/#users$/);
});

test('QF-AUTH-09 Correcting invalid credentials recovers login', async ({ login, users }) => {
  await login.open(); await login.fill(environment.email, 'incorrect'); await login.submit.click();
  await expect(login.alert).toBeVisible(); await login.signIn();
  await expect(users.heading).toBeVisible(); await expect(login.alert).toBeHidden();
});

test('QF-AUTH-10 Password visibility toggles without changing its value', async ({ login, page }) => {
  await login.open(); await login.password.fill('Example-123!');
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  await expect(login.password).toHaveAttribute('type', 'text');
  await expect(login.password).toHaveValue('Example-123!');
  await page.getByRole('button', { name: 'Hide password', exact: true }).click();
  await expect(login.password).toHaveAttribute('type', 'password');
  await expect(login.password).toHaveValue('Example-123!');
});

test('QF-AUTH-11 Remember checkbox can be checked and unchecked', async ({ login }) => {
  await login.open(); await login.remember.check(); await expect(login.remember).toBeChecked();
  await login.remember.uncheck(); await expect(login.remember).not.toBeChecked();
});

test('QF-AUTH-12 Enter submits the login form', async ({ login, users }) => {
  await login.open(); await login.fill(); await login.password.press('Enter');
  await expect(users.heading).toBeVisible();
});

test('QF-AUTH-13 Sign out hides the application and allows a new login', async ({ login, users, shell, page }) => {
  await login.open(); await login.signIn(); await expect(users.heading).toBeVisible();
  await shell.signOut(); await expect(login.form).toBeVisible(); await expect(users.heading).toBeHidden();
  await expect(page).not.toHaveURL(/#users$/); await expect(shell.toast('Signed out')).toBeVisible();
  await login.signIn(); await expect(users.heading).toBeVisible();
});

test('QF-AUTH-14 Hash navigation alone does not reveal the demo application', async ({ page, login, users }) => {
  await page.goto('/#users'); await expect(login.form).toBeVisible(); await expect(users.heading).toBeHidden();
});

test('QF-AUTH-15 Credential copy failure offers an observable fallback', async ({ page, login, shell }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: async () => { throw new Error('Clipboard permission denied'); } },
  }));
  await login.open(); await page.getByRole('button', { name: environment.email, exact: true }).click();
  await expect(shell.toast('Select and copy the value manually')).toBeVisible();
});

test('QF-AUTH-16 Credential copy sends the selected value to the clipboard API', async ({ page, login, shell }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: async (text: string) => { document.documentElement.dataset.copiedValue = text; } },
  }));
  await login.open();
  for (const value of [environment.email, environment.password]) {
    await page.getByRole('button', { name: value, exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-copied-value', value);
  }
  await expect(shell.toast('Copied to clipboard')).toHaveCount(2);
});
