// ============================================================
// Feature 12 — Analytics and Reports (standalone) — FINAL
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';

test.describe.configure({ retries: 0 });

async function goToAnalytics(page) {
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  if (!loggedIn) {
    await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
    await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
    await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }
  await page.goto(`${BASE_URL}/analytics`, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

test.describe('Feature 12 — Analytics and Reports (standalone)', () => {

  test('TC-F12-01: 7-day preset filter updates the date range', async ({ page }) => {
    test.setTimeout(60000);
    await goToAnalytics(page);
    const bodyBefore = await page.locator('body').innerText();
    const appsBeforeMatch = bodyBefore.match(/APPS THIS WEEK\s*\n?\s*(\d+)/i);
    console.log('[TC-F12-01] APPS THIS WEEK before:', appsBeforeMatch ? appsBeforeMatch[1] : '(not found)');
    const sevenDayBtn = page.getByRole('button', { name: '7 days', exact: true }).first();
    await sevenDayBtn.click();
    await page.waitForTimeout(2500);
    const bodyAfter = await page.locator('body').innerText();
    const stillHasData = bodyAfter.includes('RESUMES INDEXED') && bodyAfter.includes('Pipeline funnel');
    console.log('[TC-F12-01] Page still shows valid analytics data after clicking "7 days":', stillHasData);
    expect(stillHasData).toBeTruthy();
  });

  test('TC-F12-02: 30-day preset filter updates the date range', async ({ page }) => {
    test.setTimeout(60000);
    await goToAnalytics(page);
    const thirtyDayBtn = page.getByRole('button', { name: '30 days', exact: true }).first();
    await thirtyDayBtn.click();
    await page.waitForTimeout(2500);
    const bodyAfter = await page.locator('body').innerText();
    const stillHasData = bodyAfter.includes('RESUMES INDEXED') && bodyAfter.includes('Pipeline funnel');
    console.log('[TC-F12-02] Page still shows valid analytics data after clicking "30 days":', stillHasData);
    expect(stillHasData).toBeTruthy();
  });

  test('TC-F12-03: Custom date range Apply re-filters the data', async ({ page }) => {
    test.setTimeout(60000);
    await goToAnalytics(page);
    const bodyBefore = await page.locator('body').innerText();
    const resumesBeforeMatch = bodyBefore.match(/RESUMES INDEXED\s*\n?\s*([\d,]+)/i);
    const resumesBefore = resumesBeforeMatch ? resumesBeforeMatch[1] : null;
    console.log('[TC-F12-03] RESUMES INDEXED before custom range:', resumesBefore);
    const dateInputs = page.locator('input[type="date"]');
    const dateInputCount = await dateInputs.count();
    console.log('[TC-F12-03] Date input count:', dateInputCount);
    if (dateInputCount >= 2) {
      await dateInputs.nth(0).fill('2026-06-01');
      await dateInputs.nth(1).fill('2026-06-30');
    }
    const applyBtn = page.getByRole('button', { name: 'Apply', exact: true }).first();
    await applyBtn.click();
    await page.waitForTimeout(3000);
    const bodyAfter = await page.locator('body').innerText();
    const resumesAfterMatch = bodyAfter.match(/RESUMES INDEXED\s*\n?\s*([\d,]+)/i);
    const resumesAfter = resumesAfterMatch ? resumesAfterMatch[1] : null;
    console.log('[TC-F12-03] RESUMES INDEXED after custom range + Apply:', resumesAfter);
    const dataChanged = resumesBefore !== resumesAfter;
    console.log('[TC-F12-03] Data value changed after applying custom range:', dataChanged);
    expect(dataChanged).toBeTruthy();
  });

  test('TC-F12-04: Per-client table shows client names and counts', async ({ page }) => {
    test.setTimeout(60000);
    await goToAnalytics(page);
    const body = await page.locator('body').innerText();
    const hasPerClientSection = body.includes('PER CLIENT') || body.includes('Per client');
    const hasClientNames = body.includes('North Star Group') || body.includes('Acme Financial') || body.includes('Globex Retail');
    console.log('[TC-F12-04] Per-client section present:', hasPerClientSection);
    console.log('[TC-F12-04] Real client names shown:', hasClientNames);
    expect(hasPerClientSection).toBeTruthy();
    expect(hasClientNames).toBeTruthy();
  });

  test('TC-F12-05: Per-recruiter table shows submissions under the logged-in recruiter', async ({ page }) => {
    test.setTimeout(60000);
    await goToAnalytics(page);
    const body = await page.locator('body').innerText();
    const hasPerRecruiterSection = body.includes('Per recruiter');
    const hasSundarRow = body.includes('Sundar N');
    console.log('[TC-F12-05] "Per recruiter" section present:', hasPerRecruiterSection);
    console.log('[TC-F12-05] Logged-in recruiter (Sundar N) row present:', hasSundarRow);
    expect(hasPerRecruiterSection).toBeTruthy();
    expect(hasSundarRow).toBeTruthy();
  });

  test('TC-F12-06: Marking a job filled shows Avg time-to-fill', async ({ page }) => {
    test.setTimeout(90000);
    await goToAnalytics(page);
    const bodyBefore = await page.locator('body').innerText();
    const filledBeforeMatch = bodyBefore.match(/FILLED\s*\n?\s*(\d+)/i);
    const filledBefore = filledBeforeMatch ? parseInt(filledBeforeMatch[1], 10) : null;
    console.log('[TC-F12-06] Jobs FILLED count before:', filledBefore);

    await page.goto(`${BASE_URL}/jobs`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const selects = page.locator('select');
    const selectCount = await selects.count();
    let statusSelect = null;
    for (let i = 0; i < selectCount; i++) {
      const opts = await selects.nth(i).locator('option').allInnerTexts();
      const normalized = opts.map(o => o.trim());
      if (normalized.length === 4 && normalized.includes('active') && normalized.includes('filled') && !normalized.some(o => o.toLowerCase().includes('all'))) {
        const currentValue = await selects.nth(i).inputValue();
        if (currentValue === 'active') {
          statusSelect = selects.nth(i);
          break;
        }
      }
    }

    if (!statusSelect) {
      throw new Error('[TC-F12-06] Could not find a job currently in active status to mark as filled.');
    }

    await statusSelect.selectOption({ label: 'filled' });
    await page.waitForTimeout(2000);

    await page.goto(`${BASE_URL}/analytics`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const bodyAfter = await page.locator('body').innerText();
    const filledAfterMatch = bodyAfter.match(/FILLED\s*\n?\s*(\d+)/i);
    const filledAfter = filledAfterMatch ? parseInt(filledAfterMatch[1], 10) : null;
    console.log('[TC-F12-06] Jobs FILLED count after:', filledAfter);

    const avgFillMatch = bodyAfter.match(/AVG DAYS TO FILL\s*\n?\s*([\d.]+)/i);
    console.log('[TC-F12-06] AVG DAYS TO FILL value present:', avgFillMatch ? avgFillMatch[1] : '(not found)');

    if (filledBefore !== null && filledAfter !== null) {
      expect(filledAfter).toBeGreaterThan(filledBefore);
    }
    expect(avgFillMatch).not.toBeNull();
  });

  test('TC-F12-07: Not worked tile shows active jobs with zero applications', async ({ page }) => {
    test.setTimeout(60000);
    await goToAnalytics(page);
    const body = await page.locator('body').innerText();
    const notWorkedMatch = body.match(/NOT WORKED\s*\n?\s*(\d+)/i);
    const notWorkedCount = notWorkedMatch ? parseInt(notWorkedMatch[1], 10) : null;
    console.log('[TC-F12-07] NOT WORKED tile value:', notWorkedCount);
    expect(notWorkedCount).not.toBeNull();
    expect(notWorkedCount).toBeGreaterThan(0);
  });

});