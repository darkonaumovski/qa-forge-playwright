import { type Page } from '@playwright/test';
import { environment } from '../config/environment';

export class LoginPage {
  constructor(readonly page: Page) {}
  readonly form = this.page.locator('#login-form');
  readonly email = this.page.getByTestId('login-email');
  readonly password = this.page.getByTestId('login-password');
  readonly submit = this.page.getByTestId('login-submit');
  readonly remember = this.page.getByLabel('Keep this lab session');
  readonly alert = this.form.getByRole('alert');
  readonly emailError = this.page.locator('#email-error');
  readonly passwordError = this.page.locator('#password-error');
  async open() { await this.page.goto('/', { waitUntil: 'domcontentloaded' }); }
  async fill(email = environment.email, password = environment.password) {
    await this.email.fill(email);
    await this.password.fill(password);
  }
  async signIn() { await this.fill(); await this.submit.click(); }
}
