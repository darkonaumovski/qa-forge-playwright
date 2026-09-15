import { type APIRequestContext, type APIResponse } from '@playwright/test';

/** HTTP-level client for the private hosting boundary, separate from the lab UI login. */
export class SiteAccessClient {
  constructor(private readonly request: APIRequestContext) {}

  async getLandingPage(): Promise<APIResponse> {
    return this.request.get('/');
  }
}
