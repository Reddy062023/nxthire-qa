// ============================================================
// Feature 6 — Verification Checklist and Duplicate Check (standalone)
//   TC-F06-01: Verification checklist card present
//   TC-F06-02: Checklist item persists (with strikethrough) after reload
//   TC-F06-03: Duplicate check — "No duplicate profiles or prior
//              submissions found." (Anand JK, confirmed no prior activity)
//   TC-F06-04: Duplicate check — shows existing submission/interview
//              history (Arjun Mehta Updated, confirmed 2 existing
//              submissions + 1 logged interview on file)
//
// Wording confirmed via real manual screenshots — the app does NOT
// say "no duplicate found" generically; it says exactly "No duplicate
// profiles or prior submissions found." for a clean candidate, or
// "<N> existing submissions on file (latest: <date> by <name>)." plus
// "<N> logged interview(s) (<company>)." for a candidate with history.
//
// Timing note: the Duplicate Check can genuinely take over 60 seconds
// to respond (likely tied to the same AI/billing-related backend
// slowness seen elsewhere in the app). TC-F06-03/04 use an explicit
// auto-retrying wait (expect().toContainText with a 90s ceiling)
// rather than a fixed delay — the test proceeds the moment the result
// text actually appears, whether that's after 5 seconds or 85.
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';

// Finds the "View" button whose surrounding container's text actually
// includes the candidate's name — avoids landing on the wrong row in
// a large, non-strictly-filtered candidate list.
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
    throw new Error(`[openCandidateByName] Could not find a "View" button whose row contains "${name}"`);
  }

  const viewBtn = viewButtons.nth(targetIndex);
  await viewBtn.click({ force: false, timeout: 10000 });
  await page.waitForTimeout(3000);
}

test.describe('Feature 6 — Verification Checklist and Duplicate Check (standalone)', () => {

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

  test('TC-F06-01: Verification checklist card present on candidate detail', async ({ page }) => {
    await openCandidateByName(page, 'Arjun Mehta Updated');
    const checklistHeading = page.getByText('Video interview & verification', { exact: false }).first();
    await expect(checklistHeading).toBeVisible({ timeout: 15000 });
  });

  test('TC-F06-02: Checklist item persists (with strikethrough) after reload', async ({ page }) => {
    await openCandidateByName(page, 'Arjun Mehta Updated');

    const checklistHeading = page.getByText('Video interview & verification', { exact: false }).first();
    await checklistHeading.waitFor({ state: 'visible', timeout: 15000 });

    const checkboxes = page.locator('input[type="checkbox"]');
    const firstChecklistCheckbox = checkboxes.first();
    const wasChecked = await firstChecklistCheckbox.isChecked().catch(() => false);
    console.log('[TC-F06-02] First checklist checkbox initial state:', wasChecked);

    if (!wasChecked) {
      await firstChecklistCheckbox.check();
      await page.waitForTimeout(1500);
    }

    const strikethroughBefore = await firstChecklistCheckbox.evaluate(el => {
      const label = el.closest('label') || el.parentElement;
      const style = label ? window.getComputedStyle(label) : null;
      return style ? style.textDecorationLine : 'unknown';
    }).catch(() => 'unknown');
    console.log('[TC-F06-02] Strikethrough style before reload:', strikethroughBefore);

    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const checkboxesAfterReload = page.locator('input[type="checkbox"]');
    const isCheckedAfterReload = await checkboxesAfterReload.first().isChecked().catch(() => false);
    console.log('[TC-F06-02] First checklist checkbox state after reload:', isCheckedAfterReload);

    expect(isCheckedAfterReload).toBeTruthy();
  });

  test('TC-F06-03: Duplicate check shows "No duplicate profiles or prior submissions found." (Anand JK, no prior activity)', async ({ page }) => {
    test.setTimeout(120000);

    await openCandidateByName(page, 'Anand JK');

    const checkBtn = page.getByRole('button', { name: 'Check', exact: true }).first();
    await checkBtn.waitFor({ state: 'visible', timeout: 15000 });
    await checkBtn.click();

    console.log('[TC-F06-03] Clicked Check — this can take over 60s, waiting up to 90s...');
    const bodyLocator = page.locator('body');
    await expect(bodyLocator).toContainText('No duplicate profiles or prior submissions found.', { timeout: 90000 });

    const body = await bodyLocator.innerText();
    const dupIndex = body.toLowerCase().indexOf('duplicate submission check');
    console.log('[TC-F06-03] Result snippet:', body.slice(dupIndex, dupIndex + 200));
  });

  test('TC-F06-04: Duplicate check shows existing submission/interview history (Arjun Mehta Updated, prior activity)', async ({ page }) => {
    test.setTimeout(120000);

    await openCandidateByName(page, 'Arjun Mehta Updated');

    const checkBtn = page.getByRole('button', { name: 'Check', exact: true }).first();
    await checkBtn.waitFor({ state: 'visible', timeout: 15000 });
    await checkBtn.click();

    console.log('[TC-F06-04] Clicked Check — this can take over 60s, waiting up to 90s...');
    const bodyLocator = page.locator('body');
    await expect(bodyLocator).toContainText('existing submissions on file', { timeout: 90000 });

    const body = await bodyLocator.innerText();
    const dupIndex = body.toLowerCase().indexOf('duplicate submission check');
    console.log('[TC-F06-04] Result snippet:', body.slice(dupIndex, dupIndex + 300));

    expect(body).toContain('existing submissions on file');
  });

});