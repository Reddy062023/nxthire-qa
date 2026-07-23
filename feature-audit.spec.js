// ============================================================
// NxtHire.ai – Feature Inventory / Workbook Audit
// Tool: Playwright  |  Target: nxthire.ai
// Version: 1.0  |  Date: July 2026
// Tester: Japendra  |  North Star Group Inc.
// Run:  npx playwright test feature-audit.spec.js
// Credentials: stored in .env file — never hardcode passwords
//
// PURPOSE:
//   Walks every module in the app and records what's actually on
//   screen (headings, buttons, links, form inputs) so it can be
//   compared against NxtHire_AI_Features_workbook.xlsx by hand,
//   or fed back to Claude to fill in a Developed/Not Developed
//   column.
//
// OUTPUT:
//   ./audit-output/<module>.json   - structured element inventory
//   ./audit-output/<module>.png    - full-page screenshot
//   ./audit-output/summary.json    - one entry per module
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://nxthire.ai';
const CREDS = {
  email:    process.env.NXTHIRE_EMAIL,
  password: process.env.NXTHIRE_PASSWORD,
};
const OUTPUT_DIR = path.join(__dirname, 'audit-output');

// Map each module to the NxtHire nav label AND the workbook's
// Major Feature category it should be compared against.
// EDIT THIS LIST if module URLs differ from the guesses below.
const MODULES = [
  { name: 'candidates',   navText: 'Candidates',   urlPattern: /candidates/, workbookCategory: 'Candidate Tracking and Archival' },
  { name: 'open_jobs',    navText: 'Open jobs',    urlPattern: /jobs/,       workbookCategory: 'Job Postings' },
  { name: 'analytics',    navText: 'Analytics',    urlPattern: /analytics/, workbookCategory: 'Reports' },
  { name: 'data_sources', navText: 'Data sources', urlPattern: /data-?sources/, workbookCategory: 'Talent Bench / Vendor Management' },
  { name: 'ai_recruiter', navText: 'AI Recruiter',  urlPattern: /dashboard/, workbookCategory: 'Talent Bench (AI search)' },
];

async function login(page, timeout = 60000) {
  await page.goto(`${BASE_URL}/login`, { timeout });
  await page.fill('input[type="email"]',    CREDS.email);
  await page.fill('input[type="password"]', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout });
}

async function inventoryCurrentPage(page, moduleInfo) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1500);

  const headings = (await page.locator('h1, h2, h3').allInnerTexts())
    .map(t => t.trim()).filter(Boolean);
  const buttons = (await page.locator("button, a[role='button'], [class*='btn']").allInnerTexts())
    .map(t => t.trim()).filter(Boolean);
  const links = (await page.locator('a').allInnerTexts())
    .map(t => t.trim()).filter(Boolean);
  const inputCount = await page.locator('input, textarea, select').count();
  const bodyText = await page.locator('body').innerText();

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(OUTPUT_DIR, `${moduleInfo.name}.png`),
    fullPage: true,
  }).catch(() => {});

  const record = {
    module: moduleInfo.name,
    workbookCategory: moduleInfo.workbookCategory,
    url: page.url(),
    headings: [...new Set(headings)],
    buttons: [...new Set(buttons)],
    links: [...new Set(links)],
    inputFieldCount: inputCount,
    bodyTextLength: bodyText.length,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${moduleInfo.name}.json`),
    JSON.stringify(record, null, 2)
  );

  return record;
}

test.describe('Feature Inventory Audit', () => {
  test('Walk every module and record what exists', async ({ page }) => {
    test.setTimeout(180000); // this test visits multiple pages, give it room

    await login(page);
    const results = [];

    for (const moduleInfo of MODULES) {
      try {
        // Try clicking the nav item first (more realistic than a raw URL guess)
        const navLink = page.locator(`text=${moduleInfo.navText}`).first();
        if (await navLink.isVisible().catch(() => false)) {
          await navLink.click();
        } else {
          console.log(`NOTE: Nav item "${moduleInfo.navText}" not found — skipping click, staying on current page`);
        }
        await page.waitForTimeout(2000);

        const record = await inventoryCurrentPage(page, moduleInfo);
        results.push(record);
        console.log(`Audited "${moduleInfo.name}": ${record.headings.length} headings, ${record.buttons.length} buttons, ${record.inputFieldCount} inputs`);
      } catch (err) {
        console.log(`FINDING: Could not audit "${moduleInfo.name}" — ${err.message}`);
        results.push({ module: moduleInfo.name, error: err.message });
      }
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'summary.json'),
      JSON.stringify(results, null, 2)
    );

    console.log(`\nDone. See ./audit-output/ for per-module JSON, screenshots, and summary.json`);
  });
});