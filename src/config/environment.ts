import 'dotenv/config';

const baseURL = process.env.BASE_URL ?? 'https://qa-forge-playwright-lab.darkonaumovski.chatgpt.site';
const parsedBaseURL = new URL(baseURL);
if (!/^https?:$/.test(parsedBaseURL.protocol)) throw new Error('BASE_URL must use HTTP or HTTPS');

function optionalPositiveInteger(name: string): number | undefined {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return undefined;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be a positive integer`);
  return value;
}

export const environment = {
  baseURL,
  origin: parsedBaseURL.origin,
  email: process.env.LAB_EMAIL ?? 'demo@qaforge.dev',
  password: process.env.LAB_PASSWORD ?? 'Playwright1!',
  siteToken: process.env.SITE_BYPASS_TOKEN,
  siteStorageState: process.env.SITE_STORAGE_STATE,
  workers: optionalPositiveInteger('PW_WORKERS') ?? 3,
};
