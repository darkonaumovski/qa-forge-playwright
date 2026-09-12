import { type Page } from '@playwright/test';

export class AuditPage {
  constructor(readonly page: Page) {}
  readonly heading = this.page.getByRole('heading', { name: 'Audit log', exact: true });
  readonly search = this.page.getByRole('searchbox', { name: 'Search events' });
  readonly state = this.page.locator('#debounce-state');
  readonly events = this.page.locator('#audit-list').getByRole('article');
  readonly details = this.events.locator('p');
  readonly loadMore = this.page.getByRole('button', { name: /Load more events|Loading…/ });
  readonly export = this.page.getByRole('button', { name: 'Export CSV' });
  readonly empty = this.page.getByText('No matching events', { exact: true });
}
