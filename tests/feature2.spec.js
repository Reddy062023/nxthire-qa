// ============================================================
// Feature 2 — Parse Resume (standalone)
// Uploads real resume files via the New Candidate flow and verifies
// fields auto-populate correctly. Two resumes used to confirm the
// parsing bug pattern is consistent, not a one-off.
//
// Ground truth — QA_Test2.docx:
//   Name: QA Test2 | Email: nstarqatest2@gmail.com | Phone: 222-222-2222
//   Most recent: Kroger, Cincinnati, OH (May 2023-Present) | Title: Test Lead
//   Experience: 15+ years
//
// Ground truth — AMAN_SINGH_AZURE_BD_USA.docx:
//   Name: Aman Singh | Email: amanss12345@gmail.com | Phone: (111) 222-0000
//   Most recent: Samson Software Solutions, Inc., Chandler, AZ (June 2018-Current)
//   Title: Senior Big Data Engineer | Experience: 12+ years
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');

const BASE_URL = 'https://nxthire.ai';
const QA_TEST2_PATH = path.join(__dirname, '..', 'test-data', 'QA_Test2.docx');
const AMAN_SINGH_PATH = path.join(__dirname, '..', 'test-data', 'AMAN_SINGH_AZURE_BD_USA.docx');

async function uploadResumeViaNewCandidate(page, resumePath) {
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});

  await page.locator('button:has-text("New candidate")').first().click();
  await page.waitForTimeout(2000);

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(resumePath);
  await page.waitForTimeout(8000);
}

async function getAllFieldValues(page) {
  const allInputs = await page.locator('input:not([type="checkbox"]):not([type="file"]), textarea').all();
  const values = [];
  for (const inp of allInputs) {
    values.push(await inp.inputValue().catch(() => ''));
  }
  return values;
}

test.describe('Feature 2 — Parse Resume (standalone)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
    const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
    if (!loggedIn) {
      await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
      await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
      await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
  });

  test('TC-F02-01: New candidate form accepts resume upload', async ({ page }) => {
    console.log('[TC-F02-01] Navigating to /candidates...');
    await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});

    console.log('[TC-F02-01] Clicking New candidate...');
    await page.locator('button:has-text("New candidate")').first().click();
    await page.waitForTimeout(2000);

    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toHaveCount(1);
    await fileInput.setInputFiles(QA_TEST2_PATH);
    await page.waitForTimeout(5000);
    console.log('[TC-F02-01] Current URL after upload:', page.url());
  });

  // -------------------- QA_Test2.docx --------------------

  test('TC-F02-02 [QA_Test2]: Email, phone, experience, location, skills auto-populate correctly', async ({ page }) => {
    await uploadResumeViaNewCandidate(page, QA_TEST2_PATH);

    const emailField = page.locator('input[type="email"]').first();
    await expect(emailField).toHaveValue('nstarqatest2@gmail.com');

    const values = await getAllFieldValues(page);
    const joined = values.join(' | ');

    expect(joined).toContain('222-222-2222');
    expect(joined).toContain('Cincinnati, OH');
    expect(joined).toContain('15'); // years of experience
    expect(joined.toLowerCase()).toContain('spring boot');
    expect(joined.toLowerCase()).toContain('docker');
  });

  test('TC-F02-03 [QA_Test2] [KNOWN BUG]: Name field should show "QA Test2", not "Unknown"', async ({ page }) => {
    await uploadResumeViaNewCandidate(page, QA_TEST2_PATH);
    const values = await getAllFieldValues(page);
    console.log('[TC-F02-03] All field values:', JSON.stringify(values));

    // Currently fails — resume clearly states "Name : QA Test2" but the
    // parser defaults to "Unknown". Kept as a failing assertion so the
    // bug stays visible in the suite rather than silently passing.
    expect(values).toContain('QA Test2');
  });

  test('TC-F02-04 [QA_Test2] [KNOWN BUG]: Title field should show "Test Lead", not "Kroger"', async ({ page }) => {
    await uploadResumeViaNewCandidate(page, QA_TEST2_PATH);
    const values = await getAllFieldValues(page);
    console.log('[TC-F02-04] All field values:', JSON.stringify(values));

    // Currently fails — parser put the employer name "Kroger" into the
    // Title field instead of the actual most-recent job title "Test Lead".
    expect(values).toContain('Test Lead');
  });

  // -------------------- AMAN_SINGH_AZURE_BD_USA.docx --------------------

  test('TC-F02-05 [Aman Singh]: Name, email, phone, experience auto-populate correctly', async ({ page }) => {
    await uploadResumeViaNewCandidate(page, AMAN_SINGH_PATH);

    const emailField = page.locator('input[type="email"]').first();
    await expect(emailField).toHaveValue('amanss12345@gmail.com');

    const values = await getAllFieldValues(page);
    const joined = values.join(' | ');

    expect(joined).toContain('Aman Singh');
    expect(joined).toContain('(111) 222-0000');
    expect(joined).toContain('12'); // years of experience
  });

  test('TC-F02-06 [Aman Singh] [KNOWN BUG]: Title should show "Senior Big Data Engineer", not "Samson Software Solutions"', async ({ page }) => {
    await uploadResumeViaNewCandidate(page, AMAN_SINGH_PATH);
    const values = await getAllFieldValues(page);
    console.log('[TC-F02-06] All field values:', JSON.stringify(values));

    // Currently fails — same bug pattern as QA_Test2: parser puts the
    // employer name into Title instead of the actual job title.
    expect(values).toContain('Senior Big Data Engineer');
  });

  test('TC-F02-07 [Aman Singh] [KNOWN BUG]: Location should show "Chandler, AZ", not "Inc."', async ({ page }) => {
    await uploadResumeViaNewCandidate(page, AMAN_SINGH_PATH);
    const values = await getAllFieldValues(page);
    console.log('[TC-F02-07] All field values:', JSON.stringify(values));

    // Currently fails — confirms the parser mis-splits the employer line
    // "Samson Software Solutions, Inc.  Chandler, AZ" across Title and
    // Location fields, landing "Inc." in Location instead of the city/state.
    expect(values).toContain('Chandler, AZ');
  });

});