import { type Page } from '@playwright/test';

export class SolutionsPage {
  constructor(readonly page: Page) {}
  readonly heading = this.page.getByRole('heading', { name: 'Solution guide', exact: true });
  readonly items = this.page.locator('#solutions-list details');
  item(number: string) { return this.items.filter({ has: this.page.locator('summary').filter({ hasText: new RegExp(`^${number} ·`) }) }); }
  async expand(number: string) { await this.item(number).locator('summary').click(); }
  async back() { await this.page.getByRole('button', { name: /Back to challenges/ }).click(); }
}
