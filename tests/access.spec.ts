import { test, expect } from '../src/fixtures/test';

test('QF-ACCESS-01 Private hosting rejects requests without owner authentication', async ({
  anonymousSite,
}) => {
  const response = await anonymousSite.getLandingPage();

  expect(response.status()).toBe(401);
  expect(response.headers()['content-type']).toContain('text/html');
  expect(await response.text()).toContain('Sign in required');
});

test('QF-ACCESS-02 Authorized browser can reach the deployed lab @smoke', async ({ page, login }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(login.form).toBeVisible();
  await expect(page).toHaveTitle('QA Forge — Playwright Practice Lab');
});
