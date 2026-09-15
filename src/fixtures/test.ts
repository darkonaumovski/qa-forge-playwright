import { test as base, expect, type Route } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { SiteAccessClient } from '../api/site-access.client';
import { environment } from '../config/environment';
import { LoginPage } from '../pages/login.page';
import { ShellPage } from '../pages/shell.page';
import { UsersPage } from '../pages/users.page';
import { UserDialog } from '../pages/user-dialog.page';
import { AuditPage } from '../pages/audit.page';
import { ChallengesPage } from '../pages/challenges.page';
import { SolutionsPage } from '../pages/solutions.page';
import cases from '../../docs/test-cases.json';

const isLabRequest = (url: URL) => url.origin === environment.origin;

async function addPrivateAccess(route: Route): Promise<void> {
  await route.continue({
    headers: {
      ...route.request().headers(),
      'OAI-Sites-Authorization': `Bearer ${environment.siteToken}`,
    },
  });
}

type Fixtures = {
  privateAccess: void;
  metadata: void;
  runtimeErrors: void;
  anonymousSite: SiteAccessClient;
  login: LoginPage;
  shell: ShellPage;
  users: UsersPage;
  userDialog: UserDialog;
  audit: AuditPage;
  challenges: ChallengesPage;
  solutions: SolutionsPage;
  signedIn: void;
};

export const test = base.extend<Fixtures>({
  privateAccess: [
    async ({ context }, use) => {
      if (!environment.siteToken) {
        await use();
        return;
      }

      await context.route(isLabRequest, addPrivateAccess);
      try {
        await use();
      } finally {
        await context.unroute(isLabRequest, addPrivateAccess);
      }
    },
    { auto: true },
  ],
  anonymousSite: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: environment.baseURL,
      storageState: { cookies: [], origins: [] },
    });
    try {
      await use(new SiteAccessClient(request));
    } finally {
      await request.dispose();
    }
  },
  metadata: [
    async ({}, use, info) => {
      const id = info.title.match(/QF-[A-Z]+-\d+/)?.[0];
      const scenario = cases.find((item) => item.id === id);
      await allure.epic('QA Forge');
      await allure.feature(scenario?.file.replace('tests/', '').replace('.spec.ts', '') ?? 'Regression');
      if (id) {
        await allure.label('ALLURE_ID', id);
        await allure.tag(id);
      }
      await allure.severity(
        info.tags.some((tag) => tag.replace(/^@/, '') === 'smoke') ? 'critical' : 'normal',
      );
      if (scenario) {
        await allure.description(
          `Preconditions: ${scenario.preconditions}\n\nSteps:\n${scenario.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\nExpected: ${scenario.expected}\n\nFull plan: docs/test-plan.md`,
        );
      }
      await use();
    },
    { auto: true },
  ],
  runtimeErrors: [
    async ({ page }, use, info) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await use();
      if (errors.length)
        await info.attach('uncaught-browser-errors', { body: errors.join('\n'), contentType: 'text/plain' });
      expect(errors, 'Application must not throw uncaught browser errors').toEqual([]);
    },
    { auto: true },
  ],
  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  shell: async ({ page }, use) => {
    await use(new ShellPage(page));
  },
  users: async ({ page }, use) => {
    await use(new UsersPage(page));
  },
  userDialog: async ({ page }, use) => {
    await use(new UserDialog(page));
  },
  audit: async ({ page }, use) => {
    await use(new AuditPage(page));
  },
  challenges: async ({ page }, use) => {
    await use(new ChallengesPage(page));
  },
  solutions: async ({ page }, use) => {
    await use(new SolutionsPage(page));
  },
  signedIn: async ({ login, users }, use) => {
    await login.open();
    await login.signIn();
    await expect(users.heading).toBeVisible();
    await use();
  },
});

export const authenticatedTest = test.extend<{ authenticated: void }>({
  authenticated: [
    async ({ signedIn }, use) => {
      await use(signedIn);
    },
    { auto: true },
  ],
});
export { expect };
