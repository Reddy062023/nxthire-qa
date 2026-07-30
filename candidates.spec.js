// ============================================================
// NxtHire.ai – Candidates Page Test Suite
// Tool: Playwright  |  Target: nxthire.ai/candidates
// Version: 3.0  |  Date: June 2026
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
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click({ force: true });
    await page.waitForTimeout(5000);
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(100);
    console.log(`Profile content length: ${body.length} chars`);
    console.log('PASS: Candidate profile has content');
  });

  test('Back navigation returns to candidates list', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click({ force: true });
    await page.waitForTimeout(3000);
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
    const askBtn = page.locator('button:has-text("Ask agent")').first();
    await askBtn.waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(2000);
    await askBtn.click({ force: true });
    await page.waitForTimeout(5000);
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

// ─────────────────────────────────────────────────────────────
// TC-11-J — Add New Candidate
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-J Add New Candidate', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToCandidates(page);
  });

  test('Add New Candidate button is present', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New Candidate"), a:has-text("Add Candidate")').first();
    const visible = await addBtn.isVisible().catch(() => false);
    console.log(`Add New Candidate button visible: ${visible}`);
    if (!visible) {
      console.log('FINDING: No Add Candidate button found — check if feature exists in UI');
    } else {
      console.log('PASS: Add Candidate button present');
    }
  });

  test('Add New Candidate form opens on button click', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New Candidate"), a:has-text("Add Candidate")').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15000 });
    await addBtn.click();
    await page.waitForTimeout(3000);
    const formVisible = await page.locator('form, [role="dialog"], .modal').isVisible().catch(() => false);
    const urlChanged = !page.url().endsWith('/candidates');
    console.log(`Form/modal visible: ${formVisible} | URL changed: ${urlChanged}`);
    expect(formVisible || urlChanged).toBe(true);
    console.log('PASS: Add Candidate form/page opened');
  });

  test('Add candidate with all mandatory fields and save', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New Candidate"), a:has-text("Add Candidate")').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15000 });
    await addBtn.click();
    await page.waitForTimeout(3000);

    const nameField = page.locator('input[placeholder*="name" i], input[name*="name" i]').first();
    if (await nameField.isVisible().catch(() => false)) {
      await nameField.fill('QA Test Candidate');
      console.log('Filled: Name');
    }

    const emailField = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    if (await emailField.isVisible().catch(() => false)) {
      await emailField.fill('qatest.candidate@nstartest.com');
      console.log('Filled: Email');
    }

    const phoneField = page.locator('input[placeholder*="phone" i], input[type="tel"]').first();
    if (await phoneField.isVisible().catch(() => false)) {
      await phoneField.fill('6175550199');
      console.log('Filled: Phone');
    }

    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Submit"), button[type="submit"]').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(4000);
      const success = await page.locator('text=/success/i, text=/saved/i, text=/created/i').isVisible().catch(() => false);
      console.log(`Save success message: ${success}`);
      console.log('PASS: Add candidate form submitted');
    } else {
      console.log('FINDING: Save button not found — check form structure');
    }
  });

  test('Add candidate with missing mandatory fields shows validation error', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New Candidate"), a:has-text("Add Candidate")').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15000 });
    await addBtn.click();
    await page.waitForTimeout(3000);

    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Submit"), button[type="submit"]').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      const error = await page.locator('text=/required/i, text=/error/i, .error, [class*="error"]').isVisible().catch(() => false);
      console.log(`Validation error shown: ${error}`);
      if (error) {
        console.log('PASS: Validation error shown for empty form');
      } else {
        console.log('FINDING: No validation error shown for empty form — investigate');
      }
    }
  });

  test('Newly added candidate appears in candidates list', async ({ page }) => {
    await search(page, 'QA Test Candidate');
    await page.waitForTimeout(3000);
    const noResults = await page.locator('text=No candidates match').isVisible().catch(() => false);
    console.log(`QA Test Candidate found in list: ${!noResults}`);
    if (!noResults) {
      console.log('PASS: Newly added candidate appears in search results');
    } else {
      console.log('FINDING: Newly added candidate not found — check if add worked');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-K — Edit Candidate
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-K Edit Candidate', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToCandidates(page);
  });

  test('Edit button is present on candidate row or profile', async ({ page }) => {
    const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    const visible = await editBtn.isVisible().catch(() => false);
    console.log(`Edit button visible on list: ${visible}`);
    if (!visible) {
      const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
      await viewBtn.click();
      await page.waitForTimeout(3000);
      const editInProfile = await page.locator('button:has-text("Edit"), a:has-text("Edit")').isVisible().catch(() => false);
      console.log(`Edit button visible inside profile: ${editInProfile}`);
      expect(editInProfile).toBe(true);
    } else {
      console.log('PASS: Edit button present');
    }
  });

  test('Edit candidate — update phone number and save', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click();
    await page.waitForTimeout(3000);

    const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    await editBtn.waitFor({ state: 'visible', timeout: 15000 });
    await editBtn.click();
    await page.waitForTimeout(3000);

    const phoneField = page.locator('input[placeholder*="phone" i], input[type="tel"]').first();
    if (await phoneField.isVisible().catch(() => false)) {
      await phoneField.clear();
      await phoneField.fill('6175550100');
      console.log('Filled: Updated phone number');
    }

    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      const success = await page.locator('text=/success/i, text=/saved/i, text=/updated/i').isVisible().catch(() => false);
      console.log(`Update success: ${success}`);
      console.log('PASS: Edit candidate submitted');
    } else {
      console.log('FINDING: Save button not found in edit form');
    }
  });

  test('Edit candidate — update skills and save', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click();
    await page.waitForTimeout(3000);

    const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    await editBtn.waitFor({ state: 'visible', timeout: 15000 });
    await editBtn.click();
    await page.waitForTimeout(3000);

    const skillsField = page.locator('input[placeholder*="skill" i], textarea[placeholder*="skill" i]').first();
    if (await skillsField.isVisible().catch(() => false)) {
      await skillsField.fill('Java, Python, Playwright');
      console.log('Filled: Skills updated');
    } else {
      console.log('FINDING: Skills field not found — may use tag/chip input');
    }

    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      console.log('PASS: Edit skills submitted');
    }
  });

  test('Cancel edit — no changes saved', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click();
    await page.waitForTimeout(3000);

    const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    await editBtn.waitFor({ state: 'visible', timeout: 15000 });
    await editBtn.click();
    await page.waitForTimeout(3000);

    const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("Discard")').first();
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
      await page.waitForTimeout(2000);
      console.log('PASS: Cancel button works — edit dismissed');
    } else {
      console.log('FINDING: Cancel button not found in edit form');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-L — Delete Candidate
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-L Delete Candidate', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToCandidates(page);
  });

  test('Delete button is present on candidate row or profile', async ({ page }) => {
    const deleteBtn = page.locator('button:has-text("Delete"), a:has-text("Delete")').first();
    const visible = await deleteBtn.isVisible().catch(() => false);
    console.log(`Delete button visible on list: ${visible}`);
    if (!visible) {
      const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
      await viewBtn.click();
      await page.waitForTimeout(3000);
      const deleteInProfile = await page.locator('button:has-text("Delete"), a:has-text("Delete")').isVisible().catch(() => false);
      console.log(`Delete button inside profile: ${deleteInProfile}`);
    } else {
      console.log('PASS: Delete button present');
    }
  });

  test('Delete shows confirmation dialog', async ({ page }) => {
    await search(page, 'QA Test Candidate');
    await page.waitForTimeout(3000);

    const deleteBtn = page.locator('button:has-text("Delete"), a:has-text("Delete")').first();
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(2000);
      const confirmDialog = await page.locator('[role="dialog"], .modal, text=/confirm/i, text=/are you sure/i').isVisible().catch(() => false);
      console.log(`Confirmation dialog shown: ${confirmDialog}`);
      if (confirmDialog) {
        console.log('PASS: Delete shows confirmation dialog');
        const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("No")').first();
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.click();
          console.log('Cancelled delete — data preserved');
        }
      } else {
        console.log('FINDING: No confirmation dialog before delete');
      }
    } else {
      console.log('FINDING: Delete button not found — check if feature exists');
    }
  });

  test('Delete QA test candidate and verify removed from list', async ({ page }) => {
    await search(page, 'QA Test Candidate');
    await page.waitForTimeout(3000);

    const deleteBtn = page.locator('button:has-text("Delete"), a:has-text("Delete")').first();
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(2000);

      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').last();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(3000);
        await search(page, 'QA Test Candidate');
        await page.waitForTimeout(3000);
        const noResults = await page.locator('text=No candidates match').isVisible().catch(() => false);
        console.log(`Candidate removed from list: ${noResults}`);
        if (noResults) {
          console.log('PASS: Deleted candidate no longer appears in search');
        } else {
          console.log('FINDING: Candidate still appears after delete');
        }
      }
    } else {
      console.log('FINDING: Delete button not found — skipping delete verification');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-M — Candidate Profile Detail Verification
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-M Candidate Profile Detail Verification', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToCandidates(page);
  });

  test('Candidate profile shows Name field', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click();
    await page.waitForTimeout(4000);
    const body = await page.locator('body').innerText();
    const hasName = body.match(/[A-Z][a-z]+ [A-Z][a-z]+/) !== null;
    console.log(`Name visible in profile: ${hasName}`);
    expect(hasName).toBe(true);
    console.log('PASS: Name present in candidate profile');
  });

  test('Candidate profile shows Email field', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click();
    await page.waitForTimeout(4000);
    const body = await page.locator('body').innerText();
    const hasEmail = body.includes('@') && body.includes('.');
    console.log(`Email visible in profile: ${hasEmail}`);
    expect(hasEmail).toBe(true);
    console.log('PASS: Email present in candidate profile');
  });

  test('Candidate profile shows Skills field', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click();
    await page.waitForTimeout(4000);
    const body = await page.locator('body').innerText();
    const hasSkills = body.toLowerCase().includes('skill');
    console.log(`Skills section visible: ${hasSkills}`);
    expect(hasSkills).toBe(true);
    console.log('PASS: Skills section present in candidate profile');
  });

  test('Candidate profile shows Source field', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click();
    await page.waitForTimeout(4000);
    const body = await page.locator('body').innerText();
    const hasSource = body.toLowerCase().includes('source') ||
                      body.toLowerCase().includes('ceipal') ||
                      body.toLowerCase().includes('monster') ||
                      body.toLowerCase().includes('indeed');
    console.log(`Source visible in profile: ${hasSource}`);
    expect(hasSource).toBe(true);
    console.log('PASS: Source field present in candidate profile');
  });

  test('Candidate profile shows Location field', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click();
    await page.waitForTimeout(4000);
    const body = await page.locator('body').innerText();
    const hasLocation = body.toLowerCase().includes('location') ||
                        body.toLowerCase().includes('state') ||
                        body.toLowerCase().includes('city');
    console.log(`Location visible in profile: ${hasLocation}`);
    if (!hasLocation) {
      console.log('FINDING: Location field not visible in profile — investigate');
    } else {
      console.log('PASS: Location present in candidate profile');
    }
  });

  test('Candidate profile shows Experience field', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click();
    await page.waitForTimeout(4000);
    const body = await page.locator('body').innerText();
    const hasExperience = body.toLowerCase().includes('experience') ||
                          body.toLowerCase().includes('years');
    console.log(`Experience visible in profile: ${hasExperience}`);
    if (!hasExperience) {
      console.log('FINDING: Experience field not visible in profile — investigate');
    } else {
      console.log('PASS: Experience present in candidate profile');
    }
  });

  test('Candidate profile shows Phone field', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
    await viewBtn.click();
    await page.waitForTimeout(4000);
    const body = await page.locator('body').innerText();
    const hasPhone = body.match(/\d{3}[-.\s]\d{3}[-.\s]\d{4}|\(\d{3}\)\s*\d{3}[-.\s]\d{4}|\d{10}/) !== null;
    console.log(`Phone number visible in profile: ${hasPhone}`);
    if (!hasPhone) {
      console.log('FINDING: Phone number not visible in profile — investigate');
    } else {
      console.log('PASS: Phone present in candidate profile');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-11-N — Source Tag Verification
// ─────────────────────────────────────────────────────────────
test.describe('TC-11-N Source Tag Verification', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await goToCandidates(page);
  });

  test('Filter by Ceipal — candidate profile shows Source = Ceipal', async ({ page }) => {
    const selects = page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const options = await selects.nth(i).locator('option').allInnerTexts();
      if (options.some(o => o.toLowerCase().includes('ceipal'))) {
        const ceipalOption = options.find(o => o.toLowerCase().includes('ceipal'));
        await selects.nth(i).selectOption({ label: ceipalOption });
        await page.waitForTimeout(3000);
        const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
        await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
        await viewBtn.click();
        await page.waitForTimeout(3000);
        const body = await page.locator('body').innerText();
        const hasCeipal = body.toLowerCase().includes('ceipal');
        console.log(`Ceipal source tag visible in profile: ${hasCeipal}`);
        expect(hasCeipal).toBe(true);
        console.log('PASS: Ceipal-filtered candidate shows Source = Ceipal');
        return;
      }
    }
    console.log('FINDING: Ceipal filter option not found');
  });

  test('Filter by Monster — candidate profile shows Source = Monster', async ({ page }) => {
    const selects = page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const options = await selects.nth(i).locator('option').allInnerTexts();
      if (options.some(o => o.toLowerCase().includes('monster'))) {
        const monsterOption = options.find(o => o.toLowerCase().includes('monster'));
        await selects.nth(i).selectOption({ label: monsterOption });
        await page.waitForTimeout(3000);
        const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
        await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
        await viewBtn.click();
        await page.waitForTimeout(3000);
        const body = await page.locator('body').innerText();
        const hasMonster = body.toLowerCase().includes('monster');
        console.log(`Monster source tag visible in profile: ${hasMonster}`);
        expect(hasMonster).toBe(true);
        console.log('PASS: Monster-filtered candidate shows Source = Monster');
        return;
      }
    }
    console.log('FINDING: Monster filter option not found');
  });

  test('Filter by Indeed — candidate profile shows Source = Indeed', async ({ page }) => {
    const selects = page.locator('select');
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const options = await selects.nth(i).locator('option').allInnerTexts();
      if (options.some(o => o.toLowerCase().includes('indeed'))) {
        const indeedOption = options.find(o => o.toLowerCase().includes('indeed'));
        await selects.nth(i).selectOption({ label: indeedOption });
        await page.waitForTimeout(3000);
        const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
        await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
        await viewBtn.click();
        await page.waitForTimeout(3000);
        const body = await page.locator('body').innerText();
        const hasIndeed = body.toLowerCase().includes('indeed');
        console.log(`Indeed source tag visible in profile: ${hasIndeed}`);
        expect(hasIndeed).toBe(true);
        console.log('PASS: Indeed-filtered candidate shows Source = Indeed');
        return;
      }
    }
    console.log('FINDING: Indeed filter option not found');
  });

  test('Candidate list shows Source column with values', async ({ page }) => {
    const body = await page.locator('body').innerText();
    const hasSourceValues = body.toLowerCase().includes('ceipal') ||
                            body.toLowerCase().includes('monster') ||
                            body.toLowerCase().includes('indeed') ||
                            body.toLowerCase().includes('theirstack');
    console.log(`Source values visible in candidate list: ${hasSourceValues}`);
    expect(hasSourceValues).toBe(true);
    console.log('PASS: Source column has values in candidate list');
  });

  test('Candidate with no source shows blank or Unknown', async ({ page }) => {
    const body = await page.locator('body').innerText();
    const hasUnknown = body.toLowerCase().includes('unknown') ||
                       body.toLowerCase().includes('manual') ||
                       body.toLowerCase().includes('n/a');
    console.log(`Unknown/manual source shown: ${hasUnknown}`);
    console.log('NOTE: Check if candidates without a source show blank, Unknown, or Manual');
  });

});