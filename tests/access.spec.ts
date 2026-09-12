import { test, expect } from '../src/fixtures/test';
import { environment } from '../src/config/environment';

test('QF-ACCESS-01 Private hosting rejects requests without owner authentication', async ({ playwright }) => {
  const anonymous = await playwright.request.newContext({ storageState: { cookies: [], origins: [] } });
  try {
    const response = await anonymous.get(environment.baseURL);
    expect(response.status()).toBe(401);
    expect(await response.text()).toContain('Sign in required');
  } finally { await anonymous.dispose(); }
});

test('QF-ACCESS-02 Authorized browser can reach the deployed lab @smoke', async ({ page, login }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200); await expect(login.form).toBeVisible();
  await expect(page).toHaveTitle('QA Forge — Playwright Practice Lab');
});
