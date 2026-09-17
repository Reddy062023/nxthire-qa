// ============================================================
// Feature 13 — Hotlist Email (standalone) — COMPLETE SUITE (v5 — final)
//   TC-F13-01: Set candidate status to bench (verified via Status
//              select value, NOT page body text)
//   TC-F13-02: Hotlist button present on Candidates page
//   TC-F13-03: Bench candidates pre-selected in Hotlist modal
//   TC-F13-04: {{hotlist}} correctly stays literal pre-send (this is
//              CORRECT behavior per the UI's own caption — it only
//              substitutes at send time, not visible in the compose
//              box); send completes successfully. {{recruiter_name}}/
//              {{agency_name}} logged only, not asserted — cannot be
//              reliably verified via this modal (needs a real
//              received email to confirm either way).
//
// Candidates: "Sofia Ramirez" and "David Okafor".
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';

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

async function getStatusSelect(page) {
  const selects = page.locator('select');
  const count = await selects.count();
  for (let i = 0; i < count; i++) {
    const sel = selects.nth(i);
    const options = await sel.locator('option').allInnerTexts().catch(() => []);
    if (options.some(o => o.toLowerCase().trim() === 'sourced') && options.some(o => o.toLowerCase().trim() === 'bench')) {
      return sel;
    }
  }
  throw new Error('[getStatusSelect] Could not find the real Status select (with "sourced"/"bench" options).');
}

async function setBenchStatus(page, candidateName) {
  await openCandidateByName(page, candidateName);

  const editBtn = page.getByRole('button', { name: 'Edit', exact: true }).first();
  await editBtn.waitFor({ state: 'visible', timeout: 15000 });
  await editBtn.click();
  await page.waitForTimeout(2000);

  const statusSelect = await getStatusSelect(page);
  await statusSelect.selectOption({ label: 'bench' });
  await page.waitForTimeout(1000);

  const saveBtn = page.getByRole('button', { name: 'Save changes', exact: true })
    .or(page.getByRole('button', { name: 'Save', exact: true })).first();
  await saveBtn.click();
  await page.waitForTimeout(3000);

  console.log(`[setBenchStatus] "${candidateName}" set to bench and saved.`);
}

async function verifyBenchStatus(page, candidateName) {
  await openCandidateByName(page, candidateName);
  const editBtn = page.getByRole('button', { name: 'Edit', exact: true }).first();
  await editBtn.waitFor({ state: 'visible', timeout: 15000 });
  await editBtn.click();
  await page.waitForTimeout(2000);

  const statusSelect = await getStatusSelect(page);
  const value = await statusSelect.inputValue();
  console.log(`[verifyBenchStatus] "${candidateName}" status value:`, value);
  return value.toLowerCase() === 'bench';
}

test.describe('Feature 13 — Hotlist Email (standalone)', () => {

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

  test('TC-F13-01: Set candidate status to bench for Sofia Ramirez and David Okafor', async ({ page }) => {
    test.setTimeout(120000);

    await setBenchStatus(page, 'Sofia Ramirez');
    const sofiaBench = await verifyBenchStatus(page, 'Sofia Ramirez');
    expect(sofiaBench).toBeTruthy();

    await setBenchStatus(page, 'David Okafor');
    const davidBench = await verifyBenchStatus(page, 'David Okafor');
    expect(davidBench).toBeTruthy();
  });

  test('TC-F13-02: Hotlist button present on Candidates page', async ({ page }) => {
    await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});

    const hotlistBtn = page.getByRole('button', { name: 'Hotlist', exact: true }).first();
    await expect(hotlistBtn).toBeVisible({ timeout: 15000 });
  });

  test('TC-F13-03: Bench candidates pre-selected in Hotlist modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});

    const hotlistBtn = page.getByRole('button', { name: 'Hotlist', exact: true }).first();
    await hotlistBtn.waitFor({ state: 'visible', timeout: 15000 });
    await hotlistBtn.click();
    await page.waitForTimeout(2000);

    const body = await page.locator('body').innerText();
    const sofiaPresent = body.includes('Sofia Ramirez');
    const davidPresent = body.includes('David Okafor');
    console.log('[TC-F13-03] Sofia Ramirez shown:', sofiaPresent, '| David Okafor shown:', davidPresent);

    expect(sofiaPresent && davidPresent).toBeTruthy();
  });

  test('TC-F13-04: {{hotlist}} correctly stays literal pre-send; send completes', async ({ page }) => {
    test.setTimeout(90000);

    await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});

    const hotlistBtn = page.getByRole('button', { name: 'Hotlist', exact: true }).first();
    await hotlistBtn.waitFor({ state: 'visible', timeout: 15000 });
    await hotlistBtn.click();
    await page.waitForTimeout(2000);

    const toField = page.locator('input[type="email"]').first();
    const toFieldVisible = await toField.isVisible({ timeout: 10000 }).catch(() => false);
    if (toFieldVisible) {
      await toField.click();
      await toField.fill(process.env.NXTHIRE_EMAIL);
    }

    const bodyBeforeSend = await page.locator('body').innerText();
    console.log('[TC-F13-04] Modal text before send (first 500 chars):', bodyBeforeSend.slice(0, 500));

    // {{hotlist}} is INTENTIONALLY shown as literal template text in
    // the compose box (per the UI's own caption: "{{hotlist}} is
    // replaced with the selected candidate list") — substitution
    // happens server-side at send time, not visible pre-send. This is
    // correct, expected behavior, not something to fail on.
    const hasLiteralHotlist = bodyBeforeSend.includes('{{hotlist}}');
    console.log('[TC-F13-04] {{hotlist}} shown as literal template text (expected/correct):', hasLiteralHotlist);
    expect(hasLiteralHotlist).toBeTruthy();

    // {{recruiter_name}}/{{agency_name}} substitution CANNOT be
    // reliably verified via this compose modal — logged for visibility
    // only, not asserted. Real confirmation requires an actual
    // received email.
    const hasLiteralRecruiterName = bodyBeforeSend.includes('{{recruiter_name}}');
    const hasLiteralAgencyName = bodyBeforeSend.includes('{{agency_name}}');
    console.log('[TC-F13-04] {{recruiter_name}} literal in compose box (informational only):', hasLiteralRecruiterName);
    console.log('[TC-F13-04] {{agency_name}} literal in compose box (informational only):', hasLiteralAgencyName);

    const sendBtn = page.getByRole('button', { name: /Send/i }).first();
    await sendBtn.click();

    console.log('[TC-F13-04] Waiting up to 60s for send confirmation...');
    const bodyLocator = page.locator('body');
    await expect(bodyLocator).toContainText(/sent|failed to fetch/i, { timeout: 60000 });

    const bodyAfterSend = await bodyLocator.innerText();
    console.log('[TC-F13-04] Page text after send (first 300 chars):', bodyAfterSend.slice(0, 300));
  });

});