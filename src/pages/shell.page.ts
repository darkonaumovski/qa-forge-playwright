import { type Page } from '@playwright/test';

export class ShellPage {
  constructor(readonly page: Page) {}
  readonly navigation = this.page.getByRole('navigation', { name: 'Primary navigation' });
  readonly breadcrumb = this.page.locator('#page-crumb');
  toast(message: string | RegExp) { return this.page.locator('#toast-region').getByRole('status').filter({ hasText: message }); }
  async navigate(view: 'Users' | 'Audit log' | 'Challenges') {
    await this.navigation.getByRole('button', { name: new RegExp(view) }).click();
  }
  async signOut() { await this.page.getByRole('button', { name: 'Sign out' }).click(); }
  async reset() { await this.page.getByRole('button', { name: /Reset lab data/ }).click(); }
}
