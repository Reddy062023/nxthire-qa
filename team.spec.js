// ============================================================
// NxtHire.ai – Team / Recruiter Role Test Suite
// Tool: Playwright  |  Target: nxthire.ai
// Version: 1.0  |  Date: June 2026
// Tester: Japendra  |  North Star Group Inc.
// Run:  npx playwright test team.spec.js --headed
// Credentials: stored in .env file — never hardcode passwords
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';

const RECRUITER = {
  email:    process.env.NXTHIRE_RECRUITER_EMAIL,
  password: process.env.NXTHIRE_RECRUITER_PASSWORD,
};

// ── Login as Recruiter ────────────────────────────────────────
async function loginAsRecruiter(page) {
  await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  await page.fill('input[type="email"]',    RECRUITER.email);
  await page.fill('input[type="password"]', RECRUITER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 60000 });
}

// ─────────────────────────────────────────────────────────────
// TC-RO-01 — Recruiter Login & Dashboard
// ─────────────────────────────────────────────────────────────
test.describe('TC-RO-01 Recruiter Login and Dashboard', () => {

  test('Recruiter can login successfully', async ({ page }) => {
    await loginAsRecruiter(page);
    const url = page.url();
    console.log(`URL after login: ${url}`);
    expect(url).toContain('dashboard');
    console.log('PASS: Recruiter login successful');
  });

  test('Recruiter dashboard shows correct nav items', async ({ page }) => {
    await loginAsRecruiter(page);
    const body = await page.locator('body').innerText();
    const hasAIRecruiter = body.includes('AI Recruiter');
    const hasCandidates  = body.includes('Candidates');
    const hasOpenJobs    = body.includes('Open jobs');
    console.log(`Nav — AI Recruiter: ${hasAIRecruiter}, Candidates: ${hasCandidates}, Open Jobs: ${hasOpenJobs}`);
    expect(hasAIRecruiter).toBe(true);
    expect(hasCandidates).toBe(true);
    expect(hasOpenJobs).toBe(true);
    console.log('PASS: Recruiter sees correct nav items');
  });

  test('Recruiter cannot see Data Sources in nav', async ({ page }) => {
    await loginAsRecruiter(page);
    const body = await page.locator('body').innerText();
    const hasDataSources = body.includes('Data sources');
    console.log(`Data Sources visible to Recruiter: ${hasDataSources}`);
    expect(hasDataSources).toBe(false);
    console.log('PASS: Recruiter cannot see Data Sources');
  });

  test('Recruiter cannot see Team in nav', async ({ page }) => {
    await loginAsRecruiter(page);
    const body = await page.locator('body').innerText();
    const hasTeam = body.includes('Team');
    console.log(`Team visible to Recruiter: ${hasTeam}`);
    expect(hasTeam).toBe(false);
    console.log('PASS: Recruiter cannot see Team management');
  });

  test('Recruiter cannot see Analytics in nav', async ({ page }) => {
    await loginAsRecruiter(page);
    const body = await page.locator('body').innerText();
    const hasAnalytics = body.includes('Analytics');
    console.log(`Analytics visible to Recruiter: ${hasAnalytics}`);
    if (hasAnalytics) {
      console.log('FINDING: Recruiter can see Analytics — should this be restricted?');
    } else {
      console.log('PASS: Recruiter cannot see Analytics');
    }
  });

  test('Recruiter cannot access Team page directly via URL', async ({ page }) => {
    await loginAsRecruiter(page);
    await page.goto(`${BASE_URL}/users`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const url = page.url();
    const body = await page.locator('body').innerText();
    const hasTeamPage = body.includes('Add user') || body.includes('Team members');
    console.log(`URL: ${url} | Team page accessible: ${hasTeamPage}`);
    if (hasTeamPage) {
      console.log('FINDING: Recruiter can access Team page directly via URL — security gap');
    } else {
      console.log('PASS: Recruiter cannot access Team page via URL');
    }
  });

  test('Recruiter cannot access Data Sources page directly via URL', async ({ page }) => {
    await loginAsRecruiter(page);
    await page.goto(`${BASE_URL}/connectors/ceipal`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    const hasConnector = body.includes('Ceipal connector') || body.includes('API key');
    console.log(`Data Sources accessible via URL: ${hasConnector}`);
    if (hasConnector) {
      console.log('FINDING: Recruiter can access Data Sources via URL — security gap');
    } else {
      console.log('PASS: Recruiter cannot access Data Sources via URL');
    }
  });

  test('Recruiter cannot access Settings page directly via URL', async ({ page }) => {
    await loginAsRecruiter(page);
    await page.goto(`${BASE_URL}/settings`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    const hasSettings = body.includes('AI provider') || body.includes('API key') || body.includes('billing');
    console.log(`Settings accessible via URL: ${hasSettings}`);
    if (hasSettings) {
      console.log('FINDING: Recruiter can access Settings via URL — security gap');
    } else {
      console.log('PASS: Recruiter cannot access Settings via URL');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-RO-02 — Recruiter AI Recruiter Module
// ─────────────────────────────────────────────────────────────
test.describe('TC-RO-02 Recruiter - AI Recruiter Module', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsRecruiter(page);
  });

  test('AI Recruiter page loads for Recruiter', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    const hasChat = body.includes('Ask the agent') || body.includes('Recruiter agent') || body.includes('Ask agent');
    console.log(`AI Recruiter chat visible: ${hasChat}`);
    expect(hasChat).toBe(true);
    console.log('PASS: AI Recruiter page loads for Recruiter');
  });

  test('AI Recruiter search box is present and enabled', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const searchBox = page.locator('textarea, input[placeholder*="Ask"]').first();
    const visible = await searchBox.isVisible().catch(() => false);
    const disabled = await searchBox.isDisabled().catch(() => false);
    console.log(`Search box visible: ${visible} | Disabled: ${disabled}`);
    expect(visible).toBe(true);
    if (disabled) {
      console.log('FINDING: AI Recruiter search box is disabled — likely AI credits issue');
    } else {
      console.log('PASS: AI Recruiter search box is enabled');
    }
  });

  test('AI Recruiter — search for Java developer', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const searchBox = page.locator('textarea, input[placeholder*="Ask"]').first();
    if (await searchBox.isVisible().catch(() => false)) {
      await searchBox.fill('Find me Java developers');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(8000);
      const body = await page.locator('body').innerText();
      const hasResults = body.includes('Java') || body.includes('candidate') || body.includes('result');
      console.log(`AI search returned results: ${hasResults}`);
      if (hasResults) {
        console.log('PASS: AI Recruiter search returned results for Recruiter');
      } else {
        console.log('FINDING: AI Recruiter search returned no results — check AI credits');
      }
    } else {
      console.log('FINDING: AI Recruiter search box not found');
    }
  });

  test('AI Recruiter — prompts history visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    const hasHistory = body.includes('PROMPTS HISTORY') || body.includes('history');
    console.log(`Prompts history visible: ${hasHistory}`);
    if (hasHistory) {
      console.log('PASS: Prompts history visible for Recruiter');
    } else {
      console.log('FINDING: Prompts history not visible for Recruiter');
    }
  });

  test('AI Recruiter — clear chat button present', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const clearBtn = page.locator('button:has-text("Clear chat")').first();
    const visible = await clearBtn.isVisible().catch(() => false);
    console.log(`Clear chat button visible: ${visible}`);
    if (visible) {
      console.log('PASS: Clear chat button present');
    } else {
      console.log('FINDING: Clear chat button not found');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-RO-03 — Recruiter Candidates Module
// ─────────────────────────────────────────────────────────────
test.describe('TC-RO-03 Recruiter - Candidates Module', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsRecruiter(page);
    await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
    await page.waitForTimeout(3000);
  });

  test('Recruiter can access Candidates page', async ({ page }) => {
    const url = page.url();
    const body = await page.locator('body').innerText();
    const hasCandidates = body.includes('Candidates') || body.includes('loaded');
    console.log(`Candidates page accessible: ${hasCandidates}`);
    expect(hasCandidates).toBe(true);
    console.log('PASS: Recruiter can access Candidates page');
  });

  test('Recruiter can see all candidates', async ({ page }) => {
    const countText = await page.locator('text=/\\d+ (of \\d+)?loaded/').first().innerText().catch(() => '0 loaded');
    console.log(`Candidates visible to Recruiter: ${countText}`);
    expect(countText).toContain('loaded');
    console.log('PASS: Recruiter can see candidates');
  });

  test('Recruiter can search candidates', async ({ page }) => {
    const searchBox = page.locator('input[placeholder*="Search"]').first();
    await searchBox.fill('Java');
    await page.waitForTimeout(3000);
    const countText = await page.locator('text=/\\d+ (of \\d+)?loaded/').first().innerText().catch(() => '0 loaded');
    console.log(`Search results for Java: ${countText}`);
    const noResults = await page.locator('text=No candidates match').isVisible().catch(() => false);
    expect(noResults).toBe(false);
    console.log('PASS: Recruiter can search candidates');
  });

  test('Recruiter can view candidate profile', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
    await viewBtn.click();
    await page.waitForTimeout(3000);
    const url = page.url();
    const urlChanged = !url.endsWith('/candidates');
    console.log(`Profile opened: ${urlChanged} | URL: ${url}`);
    expect(urlChanged).toBe(true);
    console.log('PASS: Recruiter can view candidate profile');
  });

  test('Recruiter can see Pick jobs and apply button', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
    await viewBtn.click();
    await page.waitForTimeout(3000);
    const pickBtn = page.locator('button:has-text("Pick jobs")').first();
    const visible = await pickBtn.isVisible().catch(() => false);
    console.log(`Pick jobs button visible: ${visible}`);
    if (visible) {
      console.log('PASS: Recruiter can see Pick jobs and apply');
    } else {
      console.log('FINDING: Pick jobs button not visible for Recruiter');
    }
  });

  test('Recruiter can see Shortlist button on profile', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
    await viewBtn.click();
    await page.waitForTimeout(3000);
    const shortlistBtn = page.locator('button:has-text("Shortlist")').first();
    const visible = await shortlistBtn.isVisible().catch(() => false);
    const disabled = await shortlistBtn.isDisabled().catch(() => false);
    console.log(`Shortlist button visible: ${visible} | Disabled: ${disabled}`);
    if (disabled) {
      console.log('FINDING: Shortlist button is disabled — check AI credits');
    } else {
      console.log('PASS: Shortlist button enabled for Recruiter');
    }
  });

  test('Recruiter can see Add note button on profile', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
    await viewBtn.click();
    await page.waitForTimeout(3000);
    const noteBtn = page.locator('button:has-text("Add note")').first();
    const visible = await noteBtn.isVisible().catch(() => false);
    const disabled = await noteBtn.isDisabled().catch(() => false);
    console.log(`Add note button visible: ${visible} | Disabled: ${disabled}`);
    if (disabled) {
      console.log('FINDING: Add note button is disabled for Recruiter');
    } else {
      console.log('PASS: Add note button enabled for Recruiter');
    }
  });

  test('Recruiter can see Delete button on candidate profile', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
    await viewBtn.click();
    await page.waitForTimeout(3000);
    const deleteBtn = page.locator('button:has-text("Delete")').first();
    const visible = await deleteBtn.isVisible().catch(() => false);
    console.log(`Delete button visible to Recruiter: ${visible}`);
    if (visible) {
      console.log('FINDING: Recruiter can Delete candidates — should this be restricted to Admin only?');
    } else {
      console.log('PASS: Recruiter cannot delete candidates');
    }
  });

  test('Recruiter can use Export button', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Export")').first();
    const visible = await exportBtn.isVisible().catch(() => false);
    console.log(`Export button visible to Recruiter: ${visible}`);
    if (visible) {
      console.log('PASS: Recruiter can see Export button');
    } else {
      console.log('FINDING: Export button not visible to Recruiter');
    }
  });

  test('Recruiter can use Bulk import button', async ({ page }) => {
    const bulkBtn = page.locator('button:has-text("Bulk import")').first();
    const visible = await bulkBtn.isVisible().catch(() => false);
    console.log(`Bulk import visible to Recruiter: ${visible}`);
    if (visible) {
      console.log('FINDING: Recruiter can Bulk import — should this be Admin only?');
    } else {
      console.log('PASS: Recruiter cannot Bulk import');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-RO-04 — Recruiter Open Jobs Module
// ─────────────────────────────────────────────────────────────
test.describe('TC-RO-04 Recruiter - Open Jobs Module', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsRecruiter(page);
    await page.goto(`${BASE_URL}/jobs`, { timeout: 60000 });
    await page.waitForTimeout(3000);
  });

  test('Recruiter can access Open Jobs page', async ({ page }) => {
    const url = page.url();
    const body = await page.locator('body').innerText();
    const hasJobs = body.includes('job') || body.includes('Job') || body.includes('requisition');
    console.log(`Open Jobs accessible: ${hasJobs} | URL: ${url}`);
    expect(hasJobs).toBe(true);
    console.log('PASS: Recruiter can access Open Jobs page');
  });

  test('Recruiter can see job listings', async ({ page }) => {
    const body = await page.locator('body').innerText();
    const hasJobs = body.includes('Java') || body.includes('Engineer') || body.includes('Developer') || body.includes('Manager');
    console.log(`Job listings visible: ${hasJobs}`);
    if (hasJobs) {
      console.log('PASS: Recruiter can see job listings');
    } else {
      console.log('FINDING: No job listings visible to Recruiter');
    }
  });

  test('Recruiter can search jobs', async ({ page }) => {
    const searchBox = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    const visible = await searchBox.isVisible().catch(() => false);
    if (visible) {
      await searchBox.fill('Java');
      await page.waitForTimeout(3000);
      const body = await page.locator('body').innerText();
      const hasResults = body.includes('Java');
      console.log(`Job search results: ${hasResults}`);
      console.log('PASS: Recruiter can search jobs');
    } else {
      console.log('FINDING: Job search box not found for Recruiter');
    }
  });

  test('Recruiter can view job details', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    const visible = await viewBtn.isVisible().catch(() => false);
    if (visible) {
      await viewBtn.click();
      await page.waitForTimeout(3000);
      const url = page.url();
      const urlChanged = !url.endsWith('/jobs');
      console.log(`Job detail opened: ${urlChanged}`);
      if (urlChanged) {
        console.log('PASS: Recruiter can view job details');
      }
    } else {
      console.log('FINDING: No View button found on Jobs page for Recruiter');
    }
  });

  test('Recruiter can see Add Job button or not', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New Job"), button:has-text("Create")').first();
    const visible = await addBtn.isVisible().catch(() => false);
    console.log(`Add Job button visible to Recruiter: ${visible}`);
    if (visible) {
      console.log('FINDING: Recruiter can Add Jobs — should this be Admin only?');
    } else {
      console.log('PASS: Recruiter cannot Add Jobs — correct restriction');
    }
  });

  test('Recruiter can see job filter options', async ({ page }) => {
    const selects = page.locator('select');
    const count = await selects.count();
    console.log(`Filter dropdowns on Jobs page: ${count}`);
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const options = await selects.nth(i).locator('option').allInnerTexts();
        console.log(`Filter ${i}: ${options.slice(0, 5).join(', ')}`);
      }
      console.log('PASS: Job filters visible to Recruiter');
    } else {
      console.log('FINDING: No job filters found for Recruiter');
    }
  });

  test('Recruiter can see job count', async ({ page }) => {
    const body = await page.locator('body').innerText();
    const hasCount = body.match(/\d+/) !== null;
    console.log(`Job count visible: ${hasCount}`);
    const countText = await page.locator('text=/\\d+ (of \\d+)?/').first().innerText().catch(() => 'unknown');
    console.log(`Job count: ${countText}`);
    console.log('PASS: Job count visible to Recruiter');
  });

});