import { type Page } from '@playwright/test';

export class ChallengesPage {
  constructor(readonly page: Page) {}
  readonly heading = this.page.getByRole('heading', { name: 'Nine tests. Three levels.' });
  readonly cards = this.page.locator('#challenge-board').getByRole('article');
  readonly levels = this.page.locator('.level-column');
  card(title: string) {
    return this.cards.filter({ has: this.page.getByRole('heading', { name: title, exact: true }) });
  }
  completion(number: string) {
    return this.page.getByRole('checkbox', { name: `Mark exercise ${number} complete`, exact: true });
  }
  async openSolutions() {
    await this.page.getByRole('button', { name: /Open solution guide/ }).click();
  }
}
