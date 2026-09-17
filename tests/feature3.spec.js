// ============================================================
// Feature 3 — Edit Candidate (standalone)
// Uses the exact manual test steps and the known real candidate
// "Arjun Mehta" — the same one your manual testing confirmed
// works — instead of the shared openFirstCandidate() helper that
// has been unreliable today. Kept deliberately simple: no retry
// loops, no popup handling, no URL-pattern guessing — just the
// same steps a human would take, one at a time.
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';

// Opens the Candidates page, searches for a specific named candidate,
// and clicks View — mirrors exactly what a human tester does manually.
async function openCandidateByName(page, name) {
  console.log(`[openCandidateByName] Navigating to /candidates...`);
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });

  // Wait for the network to actually settle and the "X loaded" count to
  // appear — large virtualized lists can render placeholder rows first,
  // then swap in real data a moment later. Clicking too early could hit
  // a row that's about to be replaced.
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('text=/\\d+ (of \\d+ )?loaded/i').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});

  console.log(`[openCandidateByName] Typing "${name}" into search box...`);
  const searchBox = page.locator('input[placeholder*="Search" i]').first();
  await searchBox.click();
  await searchBox.pressSequentially(name, { delay: 80 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2500);
  console.log(`[openCandidateByName] Search typed. Checking if results rendered...`);

  const nameCell = page.getByText(name, { exact: false }).first();
  await nameCell.waitFor({ state: 'visible', timeout: 15000 });
  console.log(`[openCandidateByName] Candidate name "${name}" confirmed visible in results.`);

  // TEMP DEBUG: inspect the structure around the matched name so we can
  // build a correct row/container locator instead of guessing tr/role=row.
  const outerHtml = await nameCell.evaluate(el => {
    let node = el;
    for (let i = 0; i < 5 && node.parentElement; i++) node = node.parentElement;
    return node.outerHTML.slice(0, 1500);
  });
  console.log('[DEBUG] Ancestor HTML (5 levels up, truncated):', outerHtml);

  const viewBtn = page.getByRole('button', { name: 'View', exact: true })
    .or(page.getByRole('link', { name: 'View', exact: true })).first();
  await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
  console.log(`[openCandidateByName] Clicking View...`);
  await viewBtn.click({ force: false, timeout: 10000 });
  await page.waitForTimeout(3000);
  console.log(`[openCandidateByName] Done. Current URL: ${page.url()}`);
}

test.describe('Feature 3 — Edit Candidate (standalone)', () => {

  test.beforeEach(async ({ page }) => {
    // Reuses the shared session file if it already exists from an
    // earlier auth.setup run today; if not, logs in directly here.
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

  test('TC-F03-01: Edit button present on candidate detail', async ({ page }) => {
    await openCandidateByName(page, 'Arjun Mehta');
    const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit")').first();
    await expect(editBtn).toBeVisible({ timeout: 15000 });
  });

  test('TC-F03-02: Edit candidate — change name', async ({ page }) => {
    await openCandidateByName(page, 'Arjun Mehta');
    const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit")').first();
    await editBtn.click();
    await page.waitForTimeout(2000);

    // The Name field has no label/placeholder/name attribute — it's the
    // first non-checkbox input on the edit form (Title is second, right
    // after it, confirmed by its "e.g. Senior Java Developer" placeholder).
    const nameField = page.locator('input:not([type="checkbox"])').first();
    console.log('[TC-F03-02] Name field current value:', await nameField.inputValue().catch(() => '(could not read)'));
    await nameField.fill('Arjun Mehta Updated');

    const saveBtn = page.getByRole('button', { name: 'Save changes', exact: true })
      .or(page.getByRole('button', { name: 'Save', exact: true }))
      .or(page.getByRole('button', { name: 'Update', exact: true })).first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await page.waitForTimeout(3000);

    const body = await page.locator('body').innerText();
    expect(body).toContain('Arjun Mehta Updated');
  });

  test('TC-F03-03: Edit candidate — add skill', async ({ page }) => {
    await openCandidateByName(page, 'Arjun Mehta');
    const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit")').first();
    await editBtn.click();
    await page.waitForTimeout(2000);

    // Skills field has no label/name and its placeholder is an example
    // string ("Java, Spring, AWS"), not the word "skill" — so match on
    // that placeholder directly instead of *="skill".
    const skillsField = page.locator('input[placeholder="Java, Spring, AWS"], textarea[placeholder="Java, Spring, AWS"]').first();
    console.log('[TC-F03-03] Skills field current value:', await skillsField.inputValue().catch(() => '(could not read)'));
    const current = await skillsField.inputValue().catch(() => '');
    if (!current.toLowerCase().includes('playwright')) {
      await skillsField.fill(`${current}${current ? ', ' : ''}Playwright`);
    }

    const saveBtn = page.getByRole('button', { name: 'Save changes', exact: true })
      .or(page.getByRole('button', { name: 'Save', exact: true }))
      .or(page.getByRole('button', { name: 'Update', exact: true })).first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await page.waitForTimeout(3000);

    const body = await page.locator('body').innerText();
    expect(body).toContain('Playwright');
  });

  test('TC-F03-04: Changes persist after page reload', async ({ page }) => {
    await openCandidateByName(page, 'Arjun Mehta Updated');
    await page.reload();
    await page.waitForTimeout(3000);

    const body = await page.locator('body').innerText();
    expect(body).toContain('Playwright');
  });

});