import 'dotenv/config';

const baseURL = process.env.BASE_URL ?? 'https://qa-forge-playwright-lab.darkonaumovski.chatgpt.site';
if (!/^https?:$/.test(new URL(baseURL).protocol)) throw new Error('BASE_URL must be HTTP(S)');

export const environment = {
  baseURL,
  origin: new URL(baseURL).origin,
  email: process.env.LAB_EMAIL ?? 'demo@qaforge.dev',
  password: process.env.LAB_PASSWORD ?? 'Playwright1!',
  siteToken: process.env.SITE_BYPASS_TOKEN,
  siteStorageState: process.env.SITE_STORAGE_STATE,
};
