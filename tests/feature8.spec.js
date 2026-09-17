// ============================================================
// Feature 8 — Requirements/Sales (standalone)
//   TC-F08-01: Send requirement, urgent badge + submitter shown
//   TC-F08-02: Status new -> working
//   TC-F08-03: Convert requirement to job (KNOWN BUG — salary and
//              description/notes don't carry over to the new job)
//   TC-F08-04: Cannot convert twice
//
// Note: converting a requirement navigates AWAY to the new job's own
// detail page — need to explicitly navigate back to /requirements
// before checking the requirement card's state afterward.
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';

test.describe.configure({ retries: 0 });

async function goToRequirements(page) {
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  if (!loggedIn) {
    await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
    await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
    await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  await page.goto(`${BASE_URL}/requirements`, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

async function sendRequirement(page, roleTitle, rate, description, skills) {
  const sendReqBtn = page.getByRole('button', { name: 'Send requirement', exact: true }).first();
  await sendReqBtn.click();
  await page.waitForTimeout(2000);

  const submitBtn = page.getByRole('button', { name: 'Send requirement', exact: true }).last();
  const modal = submitBtn.locator('xpath=ancestor::div[.//input][1]');

  const inputs = modal.locator('input');
  await inputs.nth(0).fill(roleTitle);
  await inputs.nth(1).fill('QA Test Client');
  await inputs.nth(2).fill(rate);

  const textareas = modal.locator('textarea');
  await textareas.nth(0).fill(description);
  await textareas.nth(1).fill(skills);

  const urgencySelect = modal.locator('select').first();
  await urgencySelect.selectOption({ label: 'High' });

  await submitBtn.click();
  await page.waitForTimeout(3000);
}

test.describe('Feature 8 — Requirements/Sales (standalone)', () => {

  test('TC-F08-01: Send requirement, urgent badge + submitter shown', async ({ page }) => {
    test.setTimeout(60000);

    await goToRequirements(page);

    const uniqueRole = `QA Test Requirement ${Date.now()}`;
    await sendRequirement(page, uniqueRole, '$95/hr', 'QA automated test requirement description.', 'Python, AWS, Terraform');

    const body = await page.locator('body').innerText();
    const reqIndex = body.indexOf(uniqueRole);
    const reqSnippet = reqIndex >= 0 ? body.slice(reqIndex, reqIndex + 300) : '(requirement not found)';
    console.log('[TC-F08-01] New requirement card text:', reqSnippet.replace(/[\r\n]+/g, ' ~ '));

    const hasUrgentBadge = reqSnippet.toLowerCase().includes('urgent');
    const hasSubmitter = reqSnippet.includes('Sundar N') || reqSnippet.includes('Japendra');
    console.log('[TC-F08-01] Shows urgent badge:', hasUrgentBadge);
    console.log('[TC-F08-01] Shows submitter name:', hasSubmitter);

    expect(reqIndex).toBeGreaterThan(-1);
    expect(hasUrgentBadge).toBeTruthy();
    expect(hasSubmitter).toBeTruthy();
  });

  test('TC-F08-02: Status new -> working', async ({ page }) => {
    test.setTimeout(60000);

    await goToRequirements(page);

    const uniqueRole = `QA Status Test ${Date.now()}`;
    await sendRequirement(page, uniqueRole, '$100/hr', 'QA status change test requirement.', 'Java, Kubernetes');

    const selects = page.locator('select');
    const selectCount = await selects.count();
    let statusSelect = null;
    for (let i = 0; i < selectCount; i++) {
      const opts = await selects.nth(i).locator('option').allInnerTexts().catch(() => []);
      const normalized = opts.map(o => o.trim());
      if (normalized.includes('new') && normalized.includes('working') && normalized.includes('closed')) {
        const nearbyText = await selects.nth(i).evaluate((el, levels) => {
          let node = el;
          for (let d = 0; d < levels && node.parentElement; d++) node = node.parentElement;
          return node.innerText || '';
        }, 6).catch(() => '');
        if (nearbyText.includes(uniqueRole)) {
          statusSelect = selects.nth(i);
          break;
        }
      }
    }

    if (!statusSelect) {
      throw new Error('[TC-F08-02] Could not find the status select for the new requirement.');
    }

    const before = await statusSelect.inputValue();
    console.log('[TC-F08-02] Status before:', before);

    await statusSelect.selectOption({ label: 'working' });
    await page.waitForTimeout(2000);

    const after = await statusSelect.inputValue();
    console.log('[TC-F08-02] Status after:', after);

    expect(after.toLowerCase()).toContain('working');
  });

  test('TC-F08-03 [KNOWN BUG]: Convert requirement to job — salary/description do not carry over', async ({ page }) => {
    test.setTimeout(90000);

    await goToRequirements(page);

    const uniqueRole = `QA Convert Test ${Date.now()}`;
    const uniqueRate = '$137/hr';
    const uniqueDescription = 'QA_CONVERT_MARKER unique description text for carryover check.';
    await sendRequirement(page, uniqueRole, uniqueRate, uniqueDescription, 'Go, Docker, PostgreSQL');

    const convertBtns = page.getByRole('button', { name: 'Convert to job', exact: true });
    const convertCount = await convertBtns.count();
    let targetConvertBtn = null;
    for (let i = 0; i < convertCount; i++) {
      const nearbyText = await convertBtns.nth(i).evaluate((el, levels) => {
        let node = el;
        for (let d = 0; d < levels && node.parentElement; d++) node = node.parentElement;
        return node.innerText || '';
      }, 6).catch(() => '');
      if (nearbyText.includes(uniqueRole)) {
        targetConvertBtn = convertBtns.nth(i);
        break;
      }
    }

    if (!targetConvertBtn) {
      throw new Error('[TC-F08-03] Could not find "Convert to job" button for the new requirement.');
    }

    await targetConvertBtn.click();
    await page.waitForTimeout(3000);

    // Converting navigates AWAY to the new job's own detail page.
    console.log('[TC-F08-03] URL after convert (should be a job detail page):', page.url());

    const jobBody = await page.locator('body').innerText();
    const rateCarriedOver = jobBody.includes(uniqueRate) || jobBody.includes('137');
    const descriptionCarriedOver = jobBody.includes('QA_CONVERT_MARKER');
    console.log('[TC-F08-03] Salary/rate carried over to job page:', rateCarriedOver);
    console.log('[TC-F08-03] Description/notes carried over to job page:', descriptionCarriedOver);

    // Documents the known bug — expected to fail.
    expect(rateCarriedOver && descriptionCarriedOver).toBeTruthy();
  });

  test('TC-F08-04: Cannot convert twice', async ({ page }) => {
    test.setTimeout(90000);

    await goToRequirements(page);

    const uniqueRole = `QA NoDouble Convert Test ${Date.now()}`;
    await sendRequirement(page, uniqueRole, '$120/hr', 'QA double-convert prevention test.', 'Ruby, Rails');

    const convertBtns = page.getByRole('button', { name: 'Convert to job', exact: true });
    const convertCount = await convertBtns.count();
    let targetConvertBtn = null;
    for (let i = 0; i < convertCount; i++) {
      const nearbyText = await convertBtns.nth(i).evaluate((el, levels) => {
        let node = el;
        for (let d = 0; d < levels && node.parentElement; d++) node = node.parentElement;
        return node.innerText || '';
      }, 6).catch(() => '');
      if (nearbyText.includes(uniqueRole)) {
        targetConvertBtn = convertBtns.nth(i);
        break;
      }
    }

    if (!targetConvertBtn) {
      throw new Error('[TC-F08-04] Could not find "Convert to job" button.');
    }

    await targetConvertBtn.click();
    await page.waitForTimeout(3000);

    // Converting navigates AWAY to the new job's own detail page —
    // navigate back to Requirements explicitly before checking the
    // requirement card's state.
    console.log('[TC-F08-04] URL after convert:', page.url());

    await page.goto(`${BASE_URL}/requirements`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const bodyAfter = await page.locator('body').innerText();
    const roleIndex = bodyAfter.indexOf(uniqueRole);
    const cardSnippet = roleIndex >= 0 ? bodyAfter.slice(roleIndex, roleIndex + 300) : '';
    console.log('[TC-F08-04] Card text after first convert (back on Requirements list):', cardSnippet.replace(/[\r\n]+/g, ' ~ '));

    const stillHasConvertOption = cardSnippet.includes('Convert to job');
    const nowHasViewJob = cardSnippet.includes('View job');
    console.log('[TC-F08-04] "Convert to job" still present (should be false):', stillHasConvertOption);
    console.log('[TC-F08-04] "View job" now present (should be true):', nowHasViewJob);

    expect(stillHasConvertOption).toBeFalsy();
    expect(nowHasViewJob).toBeTruthy();
  });

});