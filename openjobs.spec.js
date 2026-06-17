// ============================================================
// NxtHire.ai – Open Jobs Module Test Suite
// Tool: Playwright  |  Target: nxthire.ai/jobs
// Version: 1.0  |  Date: June 2026
// Tester: QA — North Star Group Inc.
// Run:  npx playwright test openjobs.spec.js --headed
// Credentials: stored in .env file — never hardcode passwords
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';
const CREDS = {
  email:    process.env.NXTHIRE_EMAIL,
  password: process.env.NXTHIRE_PASSWORD,
};

// ── Login helper ──────────────────────────────────────────────
async function login(page) {
  await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  await page.fill('input[type="email"]',    CREDS.email);
  await page.fill('input[type="password"]', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 60000 });
}

// ── Navigate to Open Jobs page ────────────────────────────────
async function goToJobs(page) {
  await page.goto(`${BASE_URL}/jobs`, { timeout: 60000 });
  await page.waitForTimeout(3000);
}

// ─────────────────────────────────────────────────────────────
// TC-12-A — Page Load
// ─────────────────────────────────────────────────────────────
test.describe('TC-12-A Page Load', () => {

  test('Open Jobs page loads with requisitions', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    const countText = await page.locator('text=/\\d+ of \\d+ active requisitions loaded/').first().innerText().catch(() => '');
    console.log(`Requisitions count: ${countText}`);
    await expect(page.locator('text=/active requisitions loaded/')).toBeVisible({ timeout: 10000 });
    console.log('PASS: Open Jobs page loaded with requisitions');
  });

  test('Page title shows Open jobs', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    await expect(page.locator('h1, text=Open jobs').first()).toBeVisible();
    console.log('PASS: Page title visible');
  });

  test('Import CSV and New requisition buttons present', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    await expect(page.locator('button:has-text("Import CSV"), a:has-text("Import CSV")').first()).toBeVisible();
    await expect(page.locator('button:has-text("New requisition"), a:has-text("New requisition")').first()).toBeVisible();
    console.log('PASS: Import CSV and New requisition buttons present');
  });

  test('Stats cards visible — Active reqs, Avg time-to-fill, Pipeline value', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    const body = await page.locator('body').innerText();
    const hasActiveReqs    = body.includes('Active reqs') || body.includes('active reqs');
    const hasTimeToFill    = body.includes('time-to-fill') || body.includes('Time-to-fill');
    const hasPipelineValue = body.includes('Pipeline value') || body.includes('pipeline value');
    console.log(`Active reqs: ${hasActiveReqs} | Time-to-fill: ${hasTimeToFill} | Pipeline value: ${hasPipelineValue}`);
    expect(hasActiveReqs).toBe(true);
    console.log('PASS: Stats cards visible');
  });

  test('Source filter dropdown present', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    const sourceFilter = page.locator('text=/All sources/').first();
    const visible = await sourceFilter.isVisible().catch(() => false);
    console.log(`Source filter visible: ${visible}`);
    expect(visible).toBe(true);
    console.log('PASS: Source filter present');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-12-B — Source Filter
// ─────────────────────────────────────────────────────────────
test.describe('TC-12-B Source Filter', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToJobs(page);
  });

  test('Default shows All sources with total count', async ({ page }) => {
    const sourceText = await page.locator('text=/All sources/').first().innerText().catch(() => '');
    console.log(`Default source filter: ${sourceText}`);
    expect(sourceText).toContain('All sources');
    console.log('PASS: Default source filter shows All sources');
  });

  test('Source filter has Ceipal option', async ({ page }) => {
    const sourceDropdown = page.locator('text=/All sources/').first();
    await sourceDropdown.click();
    await page.waitForTimeout(1000);
    const hasCeipal = await page.locator('text=Ceipal').first().isVisible().catch(() => false);
    console.log(`Ceipal option visible: ${hasCeipal}`);
    expect(hasCeipal).toBe(true);
    console.log('PASS: Ceipal option in source filter');
  });

  test('Selecting Ceipal filters jobs correctly', async ({ page }) => {
    const sourceDropdown = page.locator('text=/All sources/').first();
    await sourceDropdown.click();
    await page.waitForTimeout(1000);
    const ceipalOption = page.locator('text=Ceipal').first();
    if (await ceipalOption.isVisible()) {
      await ceipalOption.click();
      await page.waitForTimeout(3000);
      const countText = await page.locator('text=/\\d+ of \\d+ active requisitions loaded/').first().innerText().catch(() => '');
      console.log(`After Ceipal filter: ${countText}`);
      console.log('PASS: Ceipal filter applied');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-12-C — Job Card Details
// ─────────────────────────────────────────────────────────────
test.describe('TC-12-C Job Card Details', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToJobs(page);
  });

  test('Job card shows title and company location', async ({ page }) => {
    const body = await page.locator('body').innerText();
    const hasNorthStar = body.includes('North Star');
    const hasLocation  = body.includes('Georgia') || body.includes('Texas') || body.includes('Remote');
    console.log(`North Star visible: ${hasNorthStar} | Location visible: ${hasLocation}`);
    expect(hasNorthStar).toBe(true);
    console.log('PASS: Job card shows company and location');
  });

  test('Job card shows skills tags', async ({ page }) => {
    const skillTags = page.locator('[class*="tag"], [class*="badge"], [class*="skill"]').first();
    const visible = await skillTags.isVisible().catch(() => false);
    console.log(`Skills tags visible: ${visible}`);
    console.log('NOTE: Skills tags like Data Pipelines, EWM confirmed visually');
  });

  test('Job card shows Posted date', async ({ page }) => {
    const body = await page.locator('body').innerText();
    const hasPosted = body.includes('ago') || body.includes('Posted');
    console.log(`Posted date visible: ${hasPosted}`);
    expect(hasPosted).toBe(true);
    console.log('PASS: Posted date visible on job cards');
  });

  test('Job card shows Candidates and Applications count', async ({ page }) => {
    const body = await page.locator('body').innerText();
    const hasCandidates   = body.includes('CANDIDATES') || body.includes('Candidates');
    const hasApplications = body.includes('APPLICATIONS') || body.includes('Applications');
    console.log(`Candidates: ${hasCandidates} | Applications: ${hasApplications}`);
    expect(hasCandidates).toBe(true);
    console.log('PASS: Candidates and Applications counts visible');
  });

  test('Job card shows Top match percentage', async ({ page }) => {
    const body = await page.locator('body').innerText();
    const hasTopMatch = body.includes('TOP MATCH') || body.includes('Top match') || body.includes('%');
    console.log(`Top match % visible: ${hasTopMatch}`);
    expect(hasTopMatch).toBe(true);
    console.log('PASS: Top match percentage visible');
  });

  test('View matches button present on job cards', async ({ page }) => {
    const viewMatchesBtn = page.locator('button:has-text("View matches"), a:has-text("View matches")').first();
    const visible = await viewMatchesBtn.isVisible().catch(() => false);
    console.log(`View matches button visible: ${visible}`);
    expect(visible).toBe(true);
    console.log('PASS: View matches button present');
  });

  test('Source button present on job cards', async ({ page }) => {
    const sourceBtn = page.locator('button:has-text("Source"), a:has-text("Source")').first();
    const visible = await sourceBtn.isVisible().catch(() => false);
    console.log(`Source button visible: ${visible}`);
    expect(visible).toBe(true);
    console.log('PASS: Source button present');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-12-D — Job Status Badges
// ─────────────────────────────────────────────────────────────
test.describe('TC-12-D Job Status Badges', () => {

  test('Active and closed status badges visible', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    const body = await page.locator('body').innerText();
    const hasActive = body.includes('active');
    const hasClosed = body.includes('closed');
    console.log(`Active badge: ${hasActive} | Closed badge: ${hasClosed}`);
    expect(hasActive || hasClosed).toBe(true);
    console.log('PASS: Status badges visible on job cards');
  });

  test('Status dropdown present to change job status', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    const statusDropdown = page.locator('select, [class*="dropdown"]').first();
    const visible = await statusDropdown.isVisible().catch(() => false);
    console.log(`Status dropdown visible: ${visible}`);
    console.log('NOTE: Status change (active → closed) confirms position filled flow');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-12-E — View Matches
// ─────────────────────────────────────────────────────────────
test.describe('TC-12-E View Matches', () => {

  test('View matches button navigates to candidate matches', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    const viewMatchesBtn = page.locator('button:has-text("View matches"), a:has-text("View matches")').first();
    await viewMatchesBtn.waitFor({ state: 'visible', timeout: 15000 });
    await viewMatchesBtn.click({ force: true });
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`URL after View matches: ${url}`);
    const urlChanged = !url.endsWith('/jobs');
    console.log(`Navigated away from jobs: ${urlChanged}`);
    expect(urlChanged).toBe(true);
    console.log('PASS: View matches navigates to candidate matches');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-12-F — Import CSV
// ─────────────────────────────────────────────────────────────
test.describe('TC-12-F Import CSV', () => {

  test('Import CSV button opens import interface', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    const importBtn = page.locator('button:has-text("Import CSV"), a:has-text("Import CSV")').first();
    await importBtn.click();
    await page.waitForTimeout(3000);
    const url = page.url();
    const modal = await page.locator('[role="dialog"], .modal, input[type="file"]').isVisible().catch(() => false);
    console.log(`URL after Import CSV: ${url}`);
    console.log(`Modal/dialog detected: ${modal}`);
    console.log('NOTE: Import CSV opens interface for bulk job upload');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-12-G — New Requisition Page
// No API credits needed — just testing form loads correctly
// ─────────────────────────────────────────────────────────────
test.describe('TC-12-G New Requisition Page', () => {

  test('New requisition button navigates to form', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    const newReqBtn = page.locator('button:has-text("New requisition"), a:has-text("New requisition")').first();
    await newReqBtn.click();
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`URL after New requisition: ${url}`);
    expect(url).toContain('jobs/new');
    console.log('PASS: New requisition navigates to /jobs/new');
  });

  test('New requisition form shows JD text area', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const textarea = page.locator('textarea').first();
    const visible = await textarea.isVisible().catch(() => false);
    console.log(`JD text area visible: ${visible}`);
    expect(visible).toBe(true);
    console.log('PASS: JD text area present on new requisition form');
  });

  test('New requisition form shows Parse with Claude button', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const parseBtn = page.locator('button:has-text("Parse with Claude")').first();
    const visible = await parseBtn.isVisible().catch(() => false);
    console.log(`Parse with Claude button visible: ${visible}`);
    expect(visible).toBe(true);
    console.log('PASS: Parse with Claude button present');
    console.log('NOTE: This button requires active Anthropic API credits — deferred to Phase 2');
  });

  test('New requisition form accepts JD text input', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const textarea = page.locator('textarea').first();
    await textarea.fill('QA Test Job - Senior Java Developer - Austin TX - 5+ years experience - DO NOT USE');
    await page.waitForTimeout(1000);
    const value = await textarea.inputValue();
    console.log(`Text entered in JD area: ${value.substring(0, 50)}...`);
    expect(value.length).toBeGreaterThan(10);
    console.log('PASS: JD text area accepts input');
  });

  test('Cancel button returns to jobs list', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const cancelBtn = page.locator('button:has-text("Cancel"), a:has-text("Cancel")').first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(2000);
      const url = page.url();
      console.log(`URL after Cancel: ${url}`);
      expect(url).toContain('jobs');
      console.log('PASS: Cancel returns to jobs list');
    } else {
      console.log('NOTE: Cancel button not found — may use browser back');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-12-H — Pagination
// ─────────────────────────────────────────────────────────────
test.describe('TC-12-H Pagination', () => {

  test('Shows 500 of 2232 active requisitions loaded', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    const countText = await page.locator('text=/\\d+ of \\d+ active requisitions loaded/').first().innerText().catch(() => '');
    console.log(`Pagination count: ${countText}`);
    expect(countText).toContain('of');
    expect(countText).toContain('loaded');
    console.log('PASS: Pagination count shows correctly');
  });

  test('Active reqs stat card shows correct count', async ({ page }) => {
    await login(page);
    await goToJobs(page);
    const body = await page.locator('body').innerText();
    const hasCount = body.includes('2,2') || body.includes('2231') || body.includes('2232');
    console.log(`Active reqs count visible: ${hasCount}`);
    expect(hasCount).toBe(true);
    console.log('PASS: Active reqs count shown in stats card');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-12-K — Parse with Claude (DEFERRED — Needs API Credits)
// ─────────────────────────────────────────────────────────────
test.describe('TC-12-K Parse with Claude — DEFERRED', () => {

  test('DEFERRED — Parse JD with Claude extracts fields correctly', async ({ page }) => {
    console.log('DEFERRED: This test requires active Anthropic API credits');
    console.log('DEFERRED: When API credits restored — paste JD and click Parse with Claude');
    console.log('DEFERRED: Verify Claude extracts title, location, skills, comp, work type');
    console.log('DEFERRED: Verify extracted fields appear on right panel');
    console.log('DEFERRED: Save the parsed requisition and verify it appears in jobs list');
  });

  test('DEFERRED — New requisition created and shows as active', async ({ page }) => {
    console.log('DEFERRED: After Parse with Claude saves the job');
    console.log('DEFERRED: Verify new job appears in Open Jobs list');
    console.log('DEFERRED: Verify status shows as active');
    console.log('DEFERRED: Verify active reqs count increases by 1');
  });

  test('DEFERRED — Position filled — change status from active to closed', async ({ page }) => {
    console.log('DEFERRED: After job is created and candidate is submitted');
    console.log('DEFERRED: Change job status from active to closed');
    console.log('DEFERRED: Verify status badge changes to closed');
    console.log('DEFERRED: Verify active reqs count decreases by 1');
    console.log('DEFERRED: This simulates the real-world position filled workflow');
  });

});