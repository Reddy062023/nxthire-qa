// ============================================================
// Performance timing — Login, Candidates, Open Jobs
// Measures real load times across 3 runs each, to give the dev
// actual numbers instead of a subjective "feels slow" report.
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';

test.describe.configure({ retries: 0 });

test('PERF: Login timing', async ({ page }) => {
  test.setTimeout(60000);

  const start = Date.now();
  await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
  await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
  await page.click('button[type="submit"]');

  await page.locator('button:has-text("New candidate")').first().waitFor({ state: 'visible', timeout: 60000 });
  const elapsed = Date.now() - start;

  console.log(`PERF_LOGIN ${elapsed}ms PERF_END`);
});

test('PERF: Candidates page load timing', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  if (!loggedIn) {
    await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
    await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
    await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  const start = Date.now();
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  await page.locator('text=/\\d+ of [\\d,]+ loaded/i').first().waitFor({ state: 'visible', timeout: 60000 });
  const elapsed = Date.now() - start;

  console.log(`PERF_CANDIDATES ${elapsed}ms PERF_END`);
});

test('PERF: Open Jobs page load timing', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  if (!loggedIn) {
    await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
    await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
    await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  const start = Date.now();
  await page.goto(`${BASE_URL}/jobs`, { timeout: 60000 });
  await page.locator('text=/\\d+ of [\\d,]+ active requisitions loaded/i').first().waitFor({ state: 'visible', timeout: 60000 });
  const elapsed = Date.now() - start;

  console.log(`PERF_OPENJOBS ${elapsed}ms PERF_END`);
});