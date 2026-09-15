import { type Page } from '@playwright/test';
import { type UserRole, type UserStatus } from '../data/users';

export class UsersPage {
  constructor(readonly page: Page) {}
  readonly section = this.page.getByRole('region', { name: 'User management', exact: true });
  readonly heading = this.page.getByRole('heading', { name: 'User management', exact: true });
  readonly rows = this.page.getByTestId('user-row');
  readonly search = this.page.getByRole('searchbox', { name: 'Search users' });
  readonly roleFilter = this.page.getByRole('combobox', { name: 'Filter by role' });
  readonly summary = this.page.locator('#results-summary');
  readonly selectAll = this.page.getByRole('checkbox', { name: 'Select all visible users' });
  readonly invite = this.page.getByRole('button', { name: /Invite selected|Sending…/ });
  readonly selectedCount = this.page.locator('#selected-count');
  readonly empty = this.page.getByText('No users found', { exact: true });
  row(name: string) {
    return this.rows.filter({ has: this.page.getByText(name, { exact: true }) });
  }
  status(name: string, status: UserStatus | 'Updating status') {
    return this.row(name).getByRole('button', { name: status, exact: true });
  }
  metric(name: 'Total users' | 'Active' | 'Pending' | 'Admins') {
    return this.page
      .locator('.metric-row article')
      .filter({ has: this.page.getByText(name, { exact: true }) })
      .locator('strong');
  }
  async filter(role: UserRole | 'all') {
    await this.roleFilter.selectOption(role);
  }
  async select(name: string, checked = true) {
    await this.row(name).getByRole('checkbox').setChecked(checked);
  }
  async add() {
    await this.page.getByTestId('add-user-button').click();
  }
  async edit(name: string) {
    await this.row(name).getByRole('button', { name: 'Edit', exact: true }).click();
  }
  async deleteMenu(name: string) {
    await this.row(name)
      .getByRole('button', { name: `Delete ${name}`, exact: true })
      .click();
  }
}
