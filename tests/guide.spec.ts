import { authenticatedTest as test, expect } from '../src/fixtures/test';

test('QF-GUIDE-01 Exercise 07 Active metric locator resolves the expected value', async ({ shell, challenges, solutions, users, page }) => {
  await shell.navigate('Challenges'); await challenges.openSolutions(); await solutions.expand('07');
  const code = await solutions.item('07').locator('code').innerText();
  await shell.navigate('Users'); await users.status('Sofia Anders', 'Suspended').click();
  await expect(users.status('Sofia Anders', 'Active')).toBeVisible();
  const metric = code.includes("page.locator('#active-users')")
    ? page.locator('#active-users')
    : page.getByText('Active').locator('..').getByRole('strong');
  await expect(metric, 'The published metric locator must identify the number 5').toHaveText('5');
});
