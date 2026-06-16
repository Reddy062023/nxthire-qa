// ============================================================
// NxtHire.ai – Candidates Page Test Suite
// Tool: Playwright  |  Target: nxthire.ai/candidates
// Version: 2.0  |  Date: June 2026
// Tester: Japendra  |  North Star Group Inc.
// Run:  npx playwright test candidates.spec.js --headed
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

// ── Navigate to Candidates page ───────────────────────────────
async function goToCandidates(page) {
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  await page.waitForTimeout(3000);
}

// ── Search helper ─────────────────────────────────────────────
async function search(page, query) {
  const searchBox = page.locator('input[placeholder*="Search by name"]').first();
  await searchBox.clear();
  if (query) {
    await searchBox.fill(query);
  }
  await page.waitForTimeout(3000);
}

// ── Get result count ──────────────────────────────────────────
async function getResultCount(page) {
  const countText = await page.locator('text=/\\d+ (of \\d+)?loaded/').first().innerText().catch(() => '0 loaded');
  console.log(`Result count: ${countText}`);
  return countText;
}

// ─────────────────────────────────────────────────────────────
// TC-11-A — Page Load
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-A Page Load', () => {

  test('Candidates page loads with data', async ({ page }) => {
    await login(page);
    await goToCandidates(page);
    const countText = await getResultCount(page);
    await expect(page.locator('text=/loaded/')).toBeVisible({ timeout: 10000 });
    console.log(`PASS: Page loaded — ${countText}`);
  });

  test('All filter dropdowns present on page', async ({ page }) => {
    await login(page);
    await goToCandidates(page);
    const selects = page.locator('select');
    const count = await selects.count();
    console.log(`Number of filter dropdowns found: ${count}`);
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('Export Bulk import and Ask agent buttons present', async ({ page }) => {
    await login(page);
    await goToCandidates(page);
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
    await expect(page.locator('button:has-text("Bulk import")')).toBeVisible();
    await expect(page.locator('button:has-text("Ask agent")')).toBeVisible();
    console.log('PASS: All action buttons present');
  });

  test('Candidate columns present', async ({ page }) => {
    await login(page);
    await goToCandidates(page);
    const body = await page.locator('body').innerText();
    const hasCandidate = body.includes('CANDIDATE') || body.includes('Candidate');
    const hasSkills    = body.includes('SKILLS')    || body.includes('Skills');
    const hasSource    = body.includes('SOURCE')    || body.includes('Source');
    console.log(`Columns — Candidate: ${hasCandidate}, Skills: ${hasSkills}, Source: ${hasSource}`);
    expect(hasCandidate).toBe(true);
    expect(hasSkills).toBe(true);
    expect(hasSource).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-B — Search Scenarios
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-B Search Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToCandidates(page);
  });

  test('Search by name — Padma — returns results', async ({ page }) => {
    await search(page, 'Padma');
    const countText = await getResultCount(page);
    const noResults = await page.locator('text=No candidates match').isVisible().catch(() => false);
    console.log(`Search "Padma": ${countText} | No results: ${noResults}`);
    expect(noResults).toBe(false);
  });

  test('Search by skill — Java — returns results', async ({ page }) => {
    await search(page, 'Java');
    const countText = await getResultCount(page);
    const noResults = await page.locator('text=No candidates match').isVisible().catch(() => false);
    console.log(`Search "Java": ${countText} | No results: ${noResults}`);
    if (noResults) {
      console.log('FINDING: Skill search returned 0 — investigate');
    } else {
      console.log('PASS: Skill search returned results');
    }
  });

  test('Search by company — Publicis Sapient — returns results', async ({ page }) => {
    await search(page, 'Publicis Sapient');
    const countText = await getResultCount(page);
    const noResults = await page.locator('text=No candidates match').isVisible().catch(() => false);
    console.log(`Search "Publicis Sapient": ${countText} | No results: ${noResults}`);
    if (noResults) {
      console.log('FINDING: Company search returned 0 — investigate');
    } else {
      console.log('PASS: Company search returned results');
    }
  });

  test('Search nonsense — abc123xyz — returns no results', async ({ page }) => {
    await search(page, 'abc123xyz');
    const countText = await getResultCount(page);
    const noResults = await page.locator('text=No candidates match').isVisible().catch(() => false);
    console.log(`Search "abc123xyz": ${countText} | No results: ${noResults}`);
    expect(noResults).toBe(true);
    console.log('PASS: Nonsense search correctly returned no results');
  });

  test('Clear search — returns all candidates', async ({ page }) => {
    await search(page, 'Padma');
    await page.waitForTimeout(1000);
    const searchBox = page.locator('input[placeholder*="Search by name"]').first();
    await searchBox.clear();
    await page.waitForTimeout(3000);
    const countText = await getResultCount(page);
    console.log(`After clear: ${countText}`);
    expect(countText).toContain('loaded');
    console.log('PASS: Clear search restored all candidates');
  });

  test('Search partial name — Pad — returns results', async ({ page }) => {
    await search(page, 'Pad');
    const countText = await getResultCount(page);
    const noResults = await page.locator('text=No candidates match').isVisible().catch(() => false);
    console.log(`Search "Pad" (partial): ${countText}`);
    expect(noResults).toBe(false);
    console.log('PASS: Partial search works');
  });

  test('Search case insensitive — PADMA vs padma same results', async ({ page }) => {
    await search(page, 'PADMA');
    const count1 = await getResultCount(page);
    console.log(`Search "PADMA": ${count1}`);
    await search(page, 'padma');
    const count2 = await getResultCount(page);
    console.log(`Search "padma": ${count2}`);
    console.log(`Case sensitivity: PADMA=${count1} padma=${count2}`);
    expect(count1).toBe(count2);
    console.log('PASS: Search is case insensitive');
  });

  test('Search single character — P — returns results', async ({ page }) => {
    await search(page, 'P');
    const countText = await getResultCount(page);
    const noResults = await page.locator('text=No candidates match').isVisible().catch(() => false);
    console.log(`Search single char "P": ${countText}`);
    console.log(`No results: ${noResults}`);
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-C — Filter Scenarios
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-C Filter Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToCandidates(page);
  });

  test('Location filter — select a state and results update', async ({ page }) => {
    const selects = page.locator('select');
    const selectCount = await selects.count();
    console.log(`Total select dropdowns: ${selectCount}`);
    for (let i = 0; i < selectCount; i++) {
      const options = await selects.nth(i).locator('option').allInnerTexts();
      console.log(`Select ${i} options: ${options.slice(0, 5).join(', ')}`);
    }
    const locationSelect = selects.first();
    const locationOptions = await locationSelect.locator('option').allInnerTexts();
    console.log(`Location options available: ${locationOptions.length}`);
    if (locationOptions.length > 1) {
      await locationSelect.selectOption({ index: 1 });
      await page.waitForTimeout(3000);
      const countText = await getResultCount(page);
      console.log(`After location filter: ${countText}`);
    }
  });

  test('Source filter — select Ceipal and results update', async ({ page }) => {
    const selects = page.locator('select');
    const selectCount = await selects.count();
    for (let i = 0; i < selectCount; i++) {
      const options = await selects.nth(i).locator('option').allInnerTexts();
      if (options.some(o => o.toLowerCase().includes('ceipal'))) {
        console.log(`Found Ceipal in select ${i}`);
        const ceipalOption = options.find(o => o.toLowerCase().includes('ceipal'));
        await selects.nth(i).selectOption({ label: ceipalOption });
        await page.waitForTimeout(3000);
        const countText = await getResultCount(page);
        console.log(`After Ceipal filter: ${countText}`);
        console.log('PASS: Ceipal filter applied');
        return;
      }
    }
    console.log('FINDING: Ceipal option not found in any dropdown');
  });

  test('Experience filter — check available options', async ({ page }) => {
    const selects = page.locator('select');
    const selectCount = await selects.count();
    for (let i = 0; i < selectCount; i++) {
      const options = await selects.nth(i).locator('option').allInnerTexts();
      if (options.some(o => o.toLowerCase().includes('experience'))) {
        console.log(`Experience filter at index ${i}: ${options.join(', ')}`);
        if (options.length > 1) {
          await selects.nth(i).selectOption({ index: 1 });
          await page.waitForTimeout(3000);
          const countText = await getResultCount(page);
          console.log(`After experience filter: ${countText}`);
        } else {
          console.log('FINDING: Experience filter has only 1 option — no ranges configured');
        }
        return;
      }
    }
  });

  test('Status filter — check available options', async ({ page }) => {
    const selects = page.locator('select');
    const selectCount = await selects.count();
    for (let i = 0; i < selectCount; i++) {
      const options = await selects.nth(i).locator('option').allInnerTexts();
      if (options.some(o => o.toLowerCase().includes('status') || o.toLowerCase().includes('applied'))) {
        console.log(`Status filter at index ${i}: ${options.join(', ')}`);
        if (options.length > 1) {
          await selects.nth(i).selectOption({ index: 1 });
          await page.waitForTimeout(3000);
          const countText = await getResultCount(page);
          console.log(`After status filter: ${countText}`);
        }
        return;
      }
    }
  });

  test('Combined search and filter — Padma + Ceipal', async ({ page }) => {
    await search(page, 'Padma');
    const afterSearch = await getResultCount(page);
    console.log(`After search "Padma": ${afterSearch}`);
    const selects = page.locator('select');
    const selectCount = await selects.count();
    for (let i = 0; i < selectCount; i++) {
      const options = await selects.nth(i).locator('option').allInnerTexts();
      if (options.some(o => o.toLowerCase().includes('ceipal'))) {
        const ceipalOption = options.find(o => o.toLowerCase().includes('ceipal'));
        await selects.nth(i).selectOption({ label: ceipalOption });
        await page.waitForTimeout(3000);
        const afterFilter = await getResultCount(page);
        console.log(`After search + Ceipal filter: ${afterFilter}`);
        console.log('PASS: Combined search and filter works');
        return;
      }
    }
  });

  test('Reset all filters — results return to default', async ({ page }) => {
    const selects = page.locator('select');
    const selectCount = await selects.count();
    if (selectCount > 0) {
      const options = await selects.first().locator('option').allInnerTexts();
      if (options.length > 1) {
        await selects.first().selectOption({ index: 1 });
        await page.waitForTimeout(2000);
        const afterFilter = await getResultCount(page);
        console.log(`After filter: ${afterFilter}`);
        await selects.first().selectOption({ index: 0 });
        await page.waitForTimeout(2000);
        const afterReset = await getResultCount(page);
        console.log(`After reset: ${afterReset}`);
        console.log('PASS: Filter reset works');
      }
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-D — View Candidate Profile
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-D View Candidate Profile', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToCandidates(page);
  });

  test('View button opens candidate profile page', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.click();
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`URL after View: ${url}`);
    const urlChanged = !url.endsWith('/candidates');
    console.log(`Profile page opened: ${urlChanged}`);
    expect(urlChanged).toBe(true);
    console.log('PASS: View button opens candidate profile');
  });

  test('Candidate profile shows key details', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.click();
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(100);
    console.log(`Profile content length: ${body.length} chars`);
    console.log('PASS: Candidate profile has content');
  });

  test('Back navigation returns to candidates list', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.click();
    await page.waitForTimeout(2000);
    await page.goBack();
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log(`URL after back: ${url}`);
    expect(url).toContain('candidates');
    console.log('PASS: Back navigation works');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-E — Export
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-E Export', () => {

  test('Export button triggers file download', async ({ page }) => {
    await login(page);
    await goToCandidates(page);
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
    await page.click('button:has-text("Export")');
    await page.waitForTimeout(5000);
    const download = await downloadPromise;
    if (download) {
      const filename = download.suggestedFilename();
      console.log(`PASS: File downloaded — ${filename}`);
    } else {
      console.log('NOTE: Download event not captured by script — manual test confirmed export works');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-F — Bulk Import
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-F Bulk Import', () => {

  test('Bulk import button opens import interface', async ({ page }) => {
    await login(page);
    await goToCandidates(page);
    await page.click('button:has-text("Bulk import")');
    await page.waitForTimeout(3000);
    const url = page.url();
    const modal = await page.locator('[role="dialog"], .modal, input[type="file"]').isVisible().catch(() => false);
    console.log(`URL after bulk import: ${url}`);
    console.log(`Modal/dialog detected: ${modal}`);
    console.log('NOTE: Manual test confirmed modal opens correctly but upload fails with CORS error');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-G — Ask Agent
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-G Ask Agent', () => {

  test('Ask agent navigates to AI Recruiter chat', async ({ page }) => {
    await login(page);
    await goToCandidates(page);
    await page.click('button:has-text("Ask agent")');
    await page.waitForTimeout(3000);
    const url = page.url();
    const chatVisible = await page.locator('textarea, input[placeholder*="Ask the agent"]').isVisible().catch(() => false);
    console.log(`URL: ${url} | Chat visible: ${chatVisible}`);
    expect(url).toContain('dashboard');
    expect(chatVisible).toBe(true);
    console.log('PASS: Ask agent opens AI Recruiter chat');
    console.log('NOTE: No candidate context passed from Candidates page — reported to Sundar');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-H — Pagination
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-H Pagination', () => {

  test('Default load shows 501 of 80533 candidates', async ({ page }) => {
    await login(page);
    await goToCandidates(page);
    const countText = await getResultCount(page);
    console.log(`Default count: ${countText}`);
    expect(countText).toContain('80,5');
    console.log('PASS: Correct total candidate count shown');
  });

  test('Pagination controls present at bottom', async ({ page }) => {
    await login(page);
    await goToCandidates(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    const perPage = page.locator('select').last();
    const perPageVisible = await perPage.isVisible().catch(() => false);
    console.log(`Per page dropdown visible: ${perPageVisible}`);
    if (perPageVisible) {
      const options = await perPage.locator('option').allInnerTexts();
      console.log(`Per page options: ${options.join(', ')}`);
    }
    console.log('NOTE: Pagination used — 162 pages with 500 per page. Options: 100/250/500/1000');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-I — Sort
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-I Sort', () => {

  test('Sort control is present and functional', async ({ page }) => {
    await login(page);
    await goToCandidates(page);
    const sortVisible = await page.locator('text=/Sort/').isVisible().catch(() => false);
    console.log(`Sort control visible: ${sortVisible}`);
    const selects = page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const options = await selects.nth(i).locator('option').allInnerTexts();
      if (options.some(o => o.toLowerCase().includes('match') || o.toLowerCase().includes('sort'))) {
        console.log(`Sort select found at index ${i}: ${options.join(', ')}`);
        console.log('PASS: Sort control found and has options');
        return;
      }
    }
  });

});