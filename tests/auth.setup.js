// ============================================================
// auth.setup.js — logs in ONCE and saves the authenticated
// session so every test in features.spec.js can reuse it
// instead of hitting the login form again.
//
// This runs automatically as a Playwright "setup" project
// (configured in playwright.config.js) before the main test
// project runs.
// ============================================================

require('dotenv').config();
const { test: setup, expect } = require('@playwright/test');

const BASE_URL = 'https://app.nxthire.ai';
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.NXTHIRE_EMAIL;
  const password = process.env.NXTHIRE_PASSWORD;

  if (!email || !password) {
    throw new Error('NXTHIRE_EMAIL / NXTHIRE_PASSWORD are not set — check your .env file (local) or repo Secrets (CI).');
  }

  await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Login redirects to /dashboard, not /candidates — the "New candidate"
  // button only exists on the Candidates page, so navigate there
  // explicitly before checking for it as our login-success signal.
  await page.waitForTimeout(3000);
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  await page.locator('button:has-text("New candidate")').first().waitFor({ state: 'visible', timeout: 60000 });

  // Save cookies + localStorage so every test project can start
  // already logged in, instead of submitting the form again.
  await page.context().storageState({ path: authFile });
  console.log(`[auth.setup] Saved authenticated session to ${authFile}`);
});
