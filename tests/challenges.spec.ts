import { authenticatedTest as test, expect } from '../src/fixtures/test';
import { exerciseTitles } from '../src/data/users';

test.beforeEach(async ({ shell }) => { await shell.navigate('Challenges'); });

test('QF-CHALLENGE-01 Nine exercise cards are grouped into three difficulty levels @smoke', async ({ challenges }) => {
  await expect(challenges.cards).toHaveCount(9); await expect(challenges.levels).toHaveCount(3);
  await expect(challenges.cards.getByRole('heading')).toHaveText(exerciseTitles);
  for (const level of await challenges.levels.all()) await expect(level.getByRole('article')).toHaveCount(3);
});

test('QF-CHALLENGE-02 Every exercise has a brief expected outcome and completion control', async ({ challenges }) => {
  for (let index = 0; index < exerciseTitles.length; index++) {
    const card = challenges.card(exerciseTitles[index]);
    await expect(card.locator('p')).not.toBeEmpty(); await expect(card.locator('.expected')).toContainText('EXPECTED OUTCOME');
    await expect(challenges.completion(String(index + 1).padStart(2, '0'))).not.toBeChecked();
  }
});

test('QF-CHALLENGE-03 Each exercise can independently be marked complete and undone', async ({ challenges }) => {
  for (let index = 0; index < exerciseTitles.length; index++) {
    const number = String(index + 1).padStart(2, '0');
    await challenges.completion(number).check(); await expect(challenges.card(exerciseTitles[index])).toHaveClass(/\bdone\b/);
    await challenges.completion(number).uncheck(); await expect(challenges.card(exerciseTitles[index])).not.toHaveClass(/\bdone\b/);
  }
});

test('QF-CHALLENGE-04 Completion persists when switching views', async ({ challenges, shell }) => {
  await challenges.completion('04').check(); await shell.navigate('Users'); await shell.navigate('Challenges');
  await expect(challenges.completion('04')).toBeChecked(); await expect(challenges.completion('05')).not.toBeChecked();
});

test('QF-CHALLENGE-05 Solutions stay hidden until the separate guide is opened', async ({ challenges, solutions, page, shell }) => {
  await expect(solutions.heading).toBeHidden(); await challenges.openSolutions(); await expect(solutions.heading).toBeVisible();
  await expect(challenges.heading).toBeHidden(); await expect(page).toHaveURL(/#solutions$/);
  await expect(shell.breadcrumb).toHaveText('Solution guide'); await expect(solutions.items).toHaveCount(9);
});

test('QF-CHALLENGE-06 All nine solution panels can expand and collapse', async ({ challenges, solutions }) => {
  await challenges.openSolutions();
  for (let index = 0; index < exerciseTitles.length; index++) {
    const number = String(index + 1).padStart(2, '0'); const item = solutions.item(number);
    await expect(item.locator('code')).toBeHidden(); await solutions.expand(number);
    await expect(item.locator('code')).toBeVisible(); await expect(item.locator('code')).toContainText('await');
    await solutions.expand(number); await expect(item.locator('code')).toBeHidden();
  }
});

test('QF-CHALLENGE-07 Back from solutions restores the challenge screen', async ({ challenges, solutions, page }) => {
  await challenges.openSolutions(); await solutions.back();
  await expect(challenges.heading).toBeVisible(); await expect(solutions.heading).toBeHidden(); await expect(page).toHaveURL(/#challenges$/);
});
