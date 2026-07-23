// ============================================================
// NxtHire.ai – Team Page Capture (nav-click version)
// Tool: Playwright  |  Target: nxthire.ai
// Run:  npx playwright test team-capture.spec.js
// Credentials: stored in .env file — never hardcode passwords
//
// Fixes the earlier direct-URL approach (page.goto('/team')),
// which bounced to /login. This version logs in, then clicks
// "Team" in the sidebar like a real user would.
// ============================================================

require('dotenv').config();
const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://nxthire.ai';
const CREDS = {
  email:    process.env.NXTHIRE_EMAIL,
  password: process.env.NXTHIRE_PASSWORD,
};
const OUTPUT_DIR = path.join(__dirname, 'audit-output');

async function login(page, timeout = 60000) {
  await page.goto(`${BASE_URL}/login`, { timeout });
  await page.fill('input[type="email"]',    CREDS.email);
  await page.fill('input[type="password"]', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout });
}

test('Click Team in sidebar and capture the page', async ({ page }) => {
  test.setTimeout(60000);
  await login(page);

  // Go somewhere with the sidebar visible first (dashboard already has it)
  await page.waitForTimeout(1000);

  const teamLink = page.locator('text=Team').first();
  await teamLink.waitFor({ state: 'visible', timeout: 15000 });
  await teamLink.click();

  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2500);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'team.png'), fullPage: true });

  const buttons = [...new Set((await page.locator("button, a[role='button'], [class*='btn']").allInnerTexts()).map(t => t.trim()).filter(Boolean))];
  const bodyText = await page.locator('body').innerText();

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'team.json'),
    JSON.stringify({ name: 'team', url: page.url(), buttons, bodyText }, null, 2)
  );

  console.log(`Landed on: ${page.url()}`);
  console.log(`Captured "team": ${buttons.length} buttons, ${bodyText.length} chars body text`);
});