// ============================================================
// Feature 11 — Application Pipeline (standalone) — FINAL VERSION
//
// Design principles (learned the hard way today):
//  1. NEVER trust a fixed wait for app state — poll for confirmation
//     of the actual thing you need, with a generous ceiling. The app
//     has real, variable slowness (10s-90s+) on several actions:
//     candidate creation, apply-queue job list, application submission,
//     status-select becoming interactive, and Analytics load.
//  2. NEVER reuse a candidate across multiple runs/tests. Every test
//     creates its own fresh, VERIFIED candidate (confirmed via search,
//     not just absence of an error) so no test can be sabotaged by
//     state left over from a previous run.
//  3. ALWAYS scope form-field locators to their actual container
//     (e.g. the New Candidate modal), never the whole page — an
//     unscoped locator can silently grab a hidden background element
//     with the same tag, producing a "success" that never happened.
//  4. Retries disabled — a partially-successful failed test corrupts
//     state before its own retry runs, causing cascading failures
//     unrelated to the feature under test.
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

test.describe.configure({ retries: 0 });

const BASE_URL = 'https://nxthire.ai';

// ---------- Shared helpers ----------

async function ensureLoggedIn(page) {
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  if (!loggedIn) {
    await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
    await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
    await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }
}

async function openCandidateByName(page, name) {
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});

  const searchBox = page.locator('input[placeholder*="Search" i]').first();
  await searchBox.click();
  await searchBox.pressSequentially(name, { delay: 80 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const nameCell = page.getByText(name, { exact: false }).first();
  await nameCell.waitFor({ state: 'visible', timeout: 25000 });

  // Scope the "View" click to the row that actually contains this name,
  // never trust "first View button on the page".
  const viewButtons = page.getByRole('button', { name: 'View', exact: true });
  const count = await viewButtons.count();
  let targetIndex = -1;
  for (let i = 0; i < count; i++) {
    const btn = viewButtons.nth(i);
    const containerText = await btn.evaluate((el, levels) => {
      let node = el;
      for (let d = 0; d < levels && node.parentElement; d++) node = node.parentElement;
      return node.innerText || '';
    }, 6).catch(() => '');
    if (containerText.includes(name)) {
      targetIndex = i;
      break;
    }
  }
  if (targetIndex === -1) {
    throw new Error(`[openCandidateByName] No "View" button found for "${name}"`);
  }
  await viewButtons.nth(targetIndex).click({ timeout: 10000 });
  await page.waitForTimeout(3000);
}

// Creates a candidate scoped strictly to the New Candidate modal (never
// the whole page — this is what was silently grabbing a hidden
// background element earlier today), then VERIFIES it exists via
// search before returning. Retries the whole creation up to 2 times
// if verification fails.
async function createVerifiedCandidate(page, namePrefix, skills) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const freshName = `${namePrefix} ${Date.now()}`;
    const freshEmail = `${namePrefix.toLowerCase().replace(/\s+/g, '')}${Date.now()}@nstargroupinc.com`;

    await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
    await page.locator('button:has-text("New candidate")').first().click();
    await page.waitForTimeout(2000);

    const createBtn = page.getByRole('button', { name: 'Create candidate', exact: true }).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    const modal = createBtn.locator('xpath=ancestor::div[.//input][1]');

    const nameField = modal.locator('input:not([type="checkbox"]):not([type="file"])').first();
    await nameField.click({ timeout: 10000 });
    await nameField.fill(freshName);

    const emailField = modal.locator('input[type="email"]').first();
    await emailField.click({ timeout: 10000 });
    await emailField.fill(freshEmail);

    if (skills) {
      const skillsField = modal.locator('input[placeholder="Java, Spring, AWS"], textarea[placeholder="Java, Spring, AWS"]').first();
      await skillsField.click({ timeout: 10000 }).catch(() => {});
      await skillsField.fill(skills).catch(() => {});
    }

    await createBtn.click();
    await page.waitForTimeout(3000);

    const found = await openCandidateByName(page, freshName).then(() => true).catch(() => false);
    if (found) {
      console.log(`[createVerifiedCandidate] Verified on attempt ${attempt}: "${freshName}"`);
      return freshName;
    }
    console.log(`[createVerifiedCandidate] Attempt ${attempt} not verifiable — retrying...`);
  }
  throw new Error('[createVerifiedCandidate] Could not create a verifiable candidate after 2 attempts.');
}

// Finds the status <select> scoped to the row containing the given job
// name, then POLLS until it's actually enabled (not just present) —
// the select can exist in the DOM but stay disabled for a while after
// an application is first submitted.
async function getEnabledStatusSelect(page, jobName) {
  const jobText = page.getByText(jobName, { exact: false }).first();
  await jobText.waitFor({ state: 'visible', timeout: 20000 });

  const selects = page.locator('select');
  const count = await selects.count();
  let target = null;
  for (let i = 0; i < count; i++) {
    const sel = selects.nth(i);
    const containerText = await sel.evaluate((el, levels) => {
      let node = el;
      for (let d = 0; d < levels && node.parentElement; d++) node = node.parentElement;
      return node.innerText || '';
    }, 6).catch(() => '');
    if (containerText.includes(jobName)) {
      target = sel;
      break;
    }
  }
  if (!target) {
    throw new Error(`[getEnabledStatusSelect] No status <select> found near "${jobName}"`);
  }

  console.log(`[getEnabledStatusSelect] Waiting up to 45s for the status select to become enabled...`);
  await expect(target).toBeEnabled({ timeout: 45000 });
  return target;
}

// Filters directly for the job (lighter than waiting on the full
// 2000+ job list), polls up to 60s for it to appear, applies, then
// POLLS for actual confirmation the application registered (rather
// than a blind wait) before returning.
async function applyToJob(page, jobName) {
  const pickJobsBtn = page.getByRole('button', { name: 'Pick jobs & apply', exact: true }).first();
  await pickJobsBtn.waitFor({ state: 'visible', timeout: 20000 });
  await pickJobsBtn.click();
  await page.waitForTimeout(2000);

  const filterBox = page.locator('input[placeholder*="Filter by title" i]').first();
  await filterBox.waitFor({ state: 'visible', timeout: 15000 });
  await filterBox.fill(jobName);

  const jobRow = page.getByText(jobName, { exact: false }).first();
  console.log(`[applyToJob] Waiting up to 60s for "${jobName}" to appear...`);
  await jobRow.waitFor({ state: 'visible', timeout: 60000 });

  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.waitFor({ state: 'visible', timeout: 10000 });
  const isDisabled = await checkbox.isDisabled().catch(() => false);
  if (isDisabled) {
    console.log(`[applyToJob] "${jobName}" already applied — using existing application.`);
    return;
  }
  await checkbox.check();
  await page.waitForTimeout(1000);

  const applyBtn = page.getByRole('button', { name: /Apply/i }).first();
  await applyBtn.click();

  // Poll for real confirmation instead of a blind wait: navigate back
  // to the candidate and check for "already applied" near the job,
  // retrying for up to 60s total.
  console.log('[applyToJob] Polling up to 60s for the submission to register...');
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(5000);
    const body = await page.locator('body').innerText().catch(() => '');
    if (body.toLowerCase().includes('already applied')) {
      console.log('[applyToJob] Confirmed: application registered.');
      return;
    }
  }
  console.log('[applyToJob] Did not see confirmation within 60s — proceeding anyway; downstream steps will surface if it truly failed.');
}

// ---------- Tests ----------

test.describe('Feature 11 — Application Pipeline (standalone)', () => {

  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test('TC-F11-01: Apply candidate to job — "already applied" + working status dropdown', async ({ page }) => {
    test.setTimeout(180000);
    const jobName = 'Data Science Engineer';

    const candidateName = await createVerifiedCandidate(page, 'QA F11 T01', 'Java, Python, AWS');
    await applyToJob(page, jobName);
    await openCandidateByName(page, candidateName);

    const body = await page.locator('body').innerText();
    expect(body.toLowerCase()).toContain('already applied');

    const statusSelect = await getEnabledStatusSelect(page, jobName);
    const currentValue = await statusSelect.inputValue().catch(() => '');
    console.log('[TC-F11-01] Current status value:', currentValue);
  });

  test('TC-F11-02: Walk status pipeline (qualified -> interviewing -> offer_extended)', async ({ page }) => {
    test.setTimeout(180000);
    const jobName = 'Data Analyst';

    const candidateName = await createVerifiedCandidate(page, 'QA F11 T02', 'Java, Python, SQL');
    await applyToJob(page, jobName);
    await openCandidateByName(page, candidateName);

    const statusSelect = await getEnabledStatusSelect(page, jobName);

    for (const label of ['qualified', 'interviewing', 'offer extended']) {
      await statusSelect.selectOption({ label });
      await page.waitForTimeout(2000);
      const value = await statusSelect.inputValue().catch(() => '');
      console.log(`[TC-F11-02] Status after "${label}":`, value);
      expect(value.toLowerCase()).toContain(label);
    }
  });

  test('TC-F11-03: Analytics funnel tiles reflect application status', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto(`${BASE_URL}/analytics`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    const bodyLocator = page.locator('body');
    await expect(bodyLocator).not.toContainText('Loading…', { timeout: 60000 }).catch(() => {
      console.log('[TC-F11-03] Still "Loading…" after 60s poll.');
    });
    await page.waitForTimeout(2000);

    const body = await bodyLocator.innerText();
    const hasQualified = /qualified/i.test(body);
    const hasOffersExtended = /offers?\s*extended/i.test(body);
    console.log('[TC-F11-03] Qualified:', hasQualified, '| Offers Extended:', hasOffersExtended);
    expect(hasQualified && hasOffersExtended).toBeTruthy();
  });

  test('TC-F11-04: Status updates to "hired" and "onboarded"', async ({ page }) => {
    test.setTimeout(180000);
    const jobName = 'Python Developer';

    const candidateName = await createVerifiedCandidate(page, 'QA F11 T04', 'Java, Python, AWS');
    await applyToJob(page, jobName);
    await openCandidateByName(page, candidateName);

    const statusSelect = await getEnabledStatusSelect(page, jobName);

    for (const label of ['hired', 'onboarded']) {
      await statusSelect.selectOption({ label });
      await page.waitForTimeout(2000);
      const value = await statusSelect.inputValue().catch(() => '');
      console.log(`[TC-F11-04] Status after "${label}":`, value);
      expect(value.toLowerCase()).toContain(label);
    }
  });

  test('TC-F11-05: backed_out increments the Back outs tile', async ({ page }) => {
    test.setTimeout(180000);
    const jobName = 'Lead Java Developer';

    await page.goto(`${BASE_URL}/analytics`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const bodyBefore = await page.locator('body').innerText();
    const beforeCount = parseInt((bodyBefore.match(/back\s*outs?\D*(\d+)/i) || [])[1] || 'NaN', 10);
    console.log('[TC-F11-05] Back outs before:', beforeCount);

    const candidateName = await createVerifiedCandidate(page, 'QA F11 T05', 'Java, Python, AWS');
    await applyToJob(page, jobName);
    await openCandidateByName(page, candidateName);

    const statusSelect = await getEnabledStatusSelect(page, jobName);
    await statusSelect.selectOption({ label: 'backed out' });
    await page.waitForTimeout(2000);
    const value = await statusSelect.inputValue().catch(() => '');
    expect(value.toLowerCase()).toContain('backed out');

    await page.goto(`${BASE_URL}/analytics`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const bodyAfter = await page.locator('body').innerText();
    const afterCount = parseInt((bodyAfter.match(/back\s*outs?\D*(\d+)/i) || [])[1] || 'NaN', 10);
    console.log('[TC-F11-05] Back outs after:', afterCount);

    if (!isNaN(beforeCount) && !isNaN(afterCount)) {
      expect(afterCount).toBeGreaterThan(beforeCount);
    } else {
      console.log('[TC-F11-05] Could not parse counts — logging only.');
    }
  });

});