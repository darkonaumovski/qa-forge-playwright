import { type Page } from '@playwright/test';
import { type NewUser } from '../data/users';

export class UserDialog {
  constructor(readonly page: Page) {}
  readonly dialog = this.page.getByRole('dialog', { name: 'Add a new user' });
  readonly name = this.dialog.getByTestId('full-name');
  readonly email = this.dialog.getByTestId('work-email');
  // Validation text is inside the label and changes its accessible name.
  readonly role = this.dialog.getByTestId('role-select');
  readonly timezone = this.dialog.getByRole('combobox', { name: 'Timezone' });
  readonly welcome = this.dialog.getByRole('checkbox', { name: /Send welcome email/ });
  readonly mfa = this.dialog.getByRole('checkbox', { name: /Require multi-factor/ });
  readonly save = this.dialog.getByTestId('save-user');
  readonly nameError = this.dialog.locator('#name-validation');
  readonly emailError = this.dialog.locator('#work-email-validation');
  readonly roleError = this.dialog.locator('[data-error="role"]');
  async fill(user: NewUser) {
    await this.name.fill(user.name);
    await this.email.fill(user.email);
    await this.role.selectOption(user.role);
    if (user.timezone) await this.timezone.selectOption(user.timezone);
    if (user.welcome !== undefined) await this.welcome.setChecked(user.welcome);
    if (user.mfa !== undefined) await this.mfa.setChecked(user.mfa);
  }
  async create(user: NewUser) {
    await this.fill(user);
    await this.save.click();
  }
  async cancel() {
    await this.dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  }
  async close() {
    await this.dialog.getByRole('button', { name: 'Close dialog' }).click();
  }
}
