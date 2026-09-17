// ============================================================
// Feature 7 — Jobs: Templates, Assignment, On-Hold (standalone)
//   TC-F07-01: AI JD parsing — confirmed FIXED
//   TC-F07-02: Save as template (checkbox + name field + Publish) — PASS
//   TC-F07-03: Start from template — CONFIRMED STILL A REAL BUG
//              (COMP field shows "—" instead of prefilling)
//   TC-F07-04: Recruiter assignment persists after reload — PASS
//   TC-F07-05: Status change to on_hold — PASS
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

test.describe.configure({ retries: 0 });

const BASE_URL = 'https://nxthire.ai';

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

async function goToNewRequisition(page) {
  await ensureLoggedIn(page);
  await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

async function goToJobsList(page) {
  await ensureLoggedIn(page);
  await page.goto(`${BASE_URL}/jobs`, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

test.describe('Feature 7 — Jobs: Templates, Assignment, On-Hold (standalone)', () => {

  test('TC-F07-01: AI JD parsing correctly reflects pasted JD text', async ({ page }) => {
    test.setTimeout(90000);

    await goToNewRequisition(page);

    const uniqueMarker = `QAMARKER${Date.now()}`;
    const uniqueJdText = `Unique QA Test Role ${uniqueMarker} — we need a Senior Rust Backend Engineer with experience in blockchain infrastructure, distributed systems, and Kubernetes. Location: Austin, TX. Comp: $180,000-$220,000.`;

    const jdTextarea = page.locator('textarea').first();
    await jdTextarea.fill(uniqueJdText);

    const parseBtn = page.getByRole('button', { name: 'Parse with Claude', exact: true }).first();
    await parseBtn.click();

    console.log('[TC-F07-01] Waiting up to 30s for parsing to complete...');
    const bodyLocator = page.locator('body');
    await expect(bodyLocator).not.toContainText('Awaiting JD', { timeout: 30000 }).catch(() => {
      console.log('[TC-F07-01] Still showing "Awaiting JD" after 30s.');
    });
    await page.waitForTimeout(2000);

    const fullBody = await bodyLocator.innerText();
    const extractedIndex = fullBody.search(/claude'?s extracted fields/i);
    const extractedSection = extractedIndex >= 0 ? fullBody.slice(extractedIndex, extractedIndex + 1500) : '';
    console.log('[TC-F07-01] Extracted fields section:', extractedSection.replace(/[\r\n]+/g, ' ~ '));

    const reflectsRealJd = extractedSection.includes('Rust')
      || extractedSection.includes('Austin')
      || extractedSection.includes('blockchain')
      || extractedSection.includes(uniqueMarker);
    console.log('[TC-F07-01] Extracted fields section reflects the real pasted JD:', reflectsRealJd);

    expect(reflectsRealJd).toBeTruthy();
  });

  test('TC-F07-02: Save as template (checkbox + name field + Publish)', async ({ page }) => {
    test.setTimeout(90000);

    await goToNewRequisition(page);

    const uniqueTemplateName = `QA Test Template ${Date.now()}`;
    const uniqueJdText = `QA Save Template Test — Senior Node.js Developer needed, Chicago IL, hybrid, $150k-$170k, Node.js/AWS/PostgreSQL.`;

    const jdTextarea = page.locator('textarea').first();
    await jdTextarea.fill(uniqueJdText);

    const parseBtn = page.getByRole('button', { name: 'Parse with Claude', exact: true }).first();
    await parseBtn.click();

    console.log('[TC-F07-02] Waiting up to 30s for parsing...');
    const bodyLocator = page.locator('body');
    await expect(bodyLocator).not.toContainText('Awaiting JD', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // "Save as template" is a checkbox that reveals a "Template name"
    // text field once checked — not a separate button.
    const saveTemplateCheckbox = page.locator('input[type="checkbox"]').first();
    const checkboxVisible = await saveTemplateCheckbox.isVisible({ timeout: 10000 }).catch(() => false);
    console.log('[TC-F07-02] Save as template checkbox visible:', checkboxVisible);

    if (checkboxVisible) {
      await saveTemplateCheckbox.check();
      await page.waitForTimeout(1000);
    }

    const templateNameField = page.getByPlaceholder('Template name', { exact: false }).first();
    const nameFieldVisible = await templateNameField.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('[TC-F07-02] Template name field visible after checking box:', nameFieldVisible);

    if (nameFieldVisible) {
      await templateNameField.fill(uniqueTemplateName);
    }

    const publishBtn = page.getByRole('button', { name: 'Publish requisition', exact: true }).first();
    await publishBtn.click();
    await page.waitForTimeout(3000);

    // Verify the new template now appears in the "Start from template"
    // dropdown on a fresh visit to the New Requisition form.
    await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const templateSelect = page.locator('select').first();
    const options = await templateSelect.locator('option').allInnerTexts();
    console.log('[TC-F07-02] Templates available after save:', options.join(' | '));

    const newTemplateFound = options.some(o => o.includes(uniqueTemplateName));
    console.log('[TC-F07-02] New template found in dropdown:', newTemplateFound);

    expect(newTemplateFound).toBeTruthy();
  });

  test('TC-F07-03 [KNOWN BUG]: Start from template does not prefill the COMP field', async ({ page }) => {
    test.setTimeout(60000);

    await goToNewRequisition(page);

    const templateSelect = page.locator('select').first();
    const options = await templateSelect.locator('option').allInnerTexts();
    const match = options.find(o => o.toLowerCase().includes('java dev'));
    console.log('[TC-F07-03] Available templates:', options.join(' | '));

    if (match) {
      await templateSelect.selectOption({ label: match });
      await page.waitForTimeout(2500);
    }

    const body = await page.locator('body').innerText();
    const compMatch = body.match(/\bCOMP\b\s*\n?\s*([^\n]*)/);
    const compValue = compMatch ? compMatch[1].trim() : '(not found)';
    console.log('[TC-F07-03] COMP field value:', JSON.stringify(compValue));

    const compIsEmpty = compValue === '—' || compValue === '' || compValue === '(not found)';
    console.log('[TC-F07-03] COMP field is empty:', compIsEmpty);

    expect(compIsEmpty).toBeFalsy();
  });

  test('TC-F07-04: Recruiter assignment persists after reload', async ({ page }) => {
    test.setTimeout(90000);

    await ensureLoggedIn(page);

    // Known job detail page (confirmed via manual screenshot). The
    // Open Jobs list itself has confirmed intermittent loading issues
    // (same pattern seen elsewhere in this app), so we navigate
    // straight to the URL rather than clicking through the list.
    await page.goto(`${BASE_URL}/jobs/01KSKN04B8K3JWM4CWC27HTG18`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const selects = page.locator('select');
    const selectCount = await selects.count();
    let assignSelect = null;
    for (let i = 0; i < selectCount; i++) {
      const opts = await selects.nth(i).locator('option').allInnerTexts().catch(() => []);
      if (opts.some(o => o.includes('Unassigned')) && opts.some(o => o.includes('Sundar'))) {
        assignSelect = selects.nth(i);
        break;
      }
    }

    if (!assignSelect) {
      throw new Error('[TC-F07-04] Could not find the "Assigned to" select.');
    }

    // Select "Sundar N" by its visible label, but the underlying
    // stored value is an opaque user ID, not the name text — so
    // compare IDs directly, not check the ID string for "sundar".
    await assignSelect.selectOption({ label: 'Sundar N' });
    await page.waitForTimeout(2000);

    const assignedIdBeforeReload = await assignSelect.inputValue();
    console.log('[TC-F07-04] Assigned ID before reload:', assignedIdBeforeReload);

    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const selectsAfterReload = page.locator('select');
    const reloadSelectCount = await selectsAfterReload.count();
    let assignSelectAfterReload = null;
    for (let i = 0; i < reloadSelectCount; i++) {
      const opts = await selectsAfterReload.nth(i).locator('option').allInnerTexts().catch(() => []);
      if (opts.some(o => o.includes('Unassigned')) && opts.some(o => o.includes('Sundar'))) {
        assignSelectAfterReload = selectsAfterReload.nth(i);
        break;
      }
    }

    const assignedIdAfterReload = assignSelectAfterReload ? await assignSelectAfterReload.inputValue() : null;
    console.log('[TC-F07-04] Assigned ID after reload:', assignedIdAfterReload);

    const selectedLabel = await assignSelectAfterReload.evaluate(el => {
      const opt = el.querySelector(`option[value="${el.value}"]`);
      return opt ? opt.textContent : null;
    }).catch(() => null);
    console.log('[TC-F07-04] Selected option label after reload:', selectedLabel);

    expect(assignedIdAfterReload).toBe(assignedIdBeforeReload);
    expect(selectedLabel).toContain('Sundar N');
  });

  test('TC-F07-05: Change job status to on_hold, verify Analytics count', async ({ page }) => {
    test.setTimeout(90000);

    await goToJobsList(page);

    const selects = page.locator('select');
    const selectCount = await selects.count();
    let statusSelect = null;
    for (let i = 0; i < selectCount; i++) {
      const opts = await selects.nth(i).locator('option').allInnerTexts();
      const normalized = opts.map(o => o.trim());
      if (normalized.length === 4 && normalized.includes('active') && normalized.includes('on_hold')
          && normalized.includes('filled') && normalized.includes('closed')
          && !normalized.some(o => o.toLowerCase().includes('all'))) {
        statusSelect = selects.nth(i);
        break;
      }
    }

    if (!statusSelect) {
      throw new Error('[TC-F07-05] Could not find a per-row job status select.');
    }

    const currentStatus = await statusSelect.inputValue();
    console.log('[TC-F07-05] First "active/on_hold/filled/closed" select current value:', currentStatus);

    await statusSelect.selectOption({ label: 'on_hold' });
    await page.waitForTimeout(2000);

    const newStatus = await statusSelect.inputValue();
    console.log('[TC-F07-05] Status after selecting on_hold:', newStatus);
    expect(newStatus.toLowerCase()).toContain('on_hold');

    await page.goto(`${BASE_URL}/analytics`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const analyticsBody = await page.locator('body').innerText();
    const onHoldMatch = analyticsBody.match(/on\s*hold\D*(\d+)/i);
    const onHoldCount = onHoldMatch ? parseInt(onHoldMatch[1], 10) : null;
    console.log('[TC-F07-05] Jobs ON HOLD count on Analytics:', onHoldCount);

    expect(onHoldCount).toBeGreaterThan(0);
  });

});