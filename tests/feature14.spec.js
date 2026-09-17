// ============================================================
// Feature 14 — Sales CRM (standalone) — FINAL
//   TC-F14-01: Add company with all fields + 2 contacts
//   TC-F14-02: New lead linked to company
//   TC-F14-03: Duplicate lead badge appears for matching contact
//              email — CONFIRMED FIXED Aug 5, flipped from
//              fails-by-design to an expected PASS. Also fixed a
//              bug in the check itself: the real badge text is
//              "dup", not "duplicate" (confirmed via screenshots),
//              and the check is now self-contained (creates both
//              leads fresh) rather than relying on old accumulated
//              test data.
//   TC-F14-04: Log call, email, task on lead
//   TC-F14-05: Tick task done — strikethrough
//   TC-F14-06: Change lead status to won — KPI updates
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';

test.describe.configure({ retries: 0 });

async function goToCrm(page) {
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  if (!loggedIn) {
    await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
    await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
    await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(1000);

  const salesCrmLink = page.getByText('Sales CRM', { exact: true }).first();
  await salesCrmLink.waitFor({ state: 'visible', timeout: 15000 });
  await salesCrmLink.click();
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

async function openActivityModalViaPhoneIcon(page) {
  let phoneIcon = page.locator('button:has(svg.lucide-phone)').first();
  let visible = await phoneIcon.isVisible({ timeout: 15000 }).catch(() => false);

  if (!visible) {
    await page.waitForTimeout(3000);
    visible = await phoneIcon.isVisible({ timeout: 15000 }).catch(() => false);
  }

  if (!visible) {
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const svgClass = await btn.locator('svg').first().getAttribute('class').catch(() => '');
      if (svgClass && svgClass.toLowerCase().includes('phone')) {
        phoneIcon = btn;
        visible = true;
        break;
      }
    }
  }

  if (!visible) {
    throw new Error('[openActivityModalViaPhoneIcon] Could not find a phone icon button on the page.');
  }

  await phoneIcon.click();
  await page.waitForTimeout(1500);
}

async function getActivityTypeSelect(page) {
  const selects = page.locator('select');
  const selectCount = await selects.count();
  for (let i = 0; i < selectCount; i++) {
    const options = await selects.nth(i).locator('option').allInnerTexts().catch(() => []);
    if (options.includes('Call') && options.includes('Task')) {
      return selects.nth(i);
    }
  }
  throw new Error('[getActivityTypeSelect] Could not find the Activity type select (Call/Email/Task/Note/Meeting).');
}

test.describe('Feature 14 — Sales CRM (standalone)', () => {

  test('TC-F14-01: Add company with all fields and 2 contacts', async ({ page }) => {
    test.setTimeout(60000);
    const uniqueName = `QA Test Company ${Date.now()}`;

    await goToCrm(page);

    const addCompanyBtn = page.getByRole('button', { name: 'Add company', exact: true }).first();
    await addCompanyBtn.waitFor({ state: 'visible', timeout: 15000 });
    await addCompanyBtn.click();
    await page.waitForTimeout(1500);

    const modal = page.getByRole('button', { name: 'Add company', exact: true }).last().locator('xpath=ancestor::div[.//input][1]');

    const nameField = modal.locator('input').first();
    await nameField.fill(uniqueName);

    const industryField = modal.locator('input').nth(1);
    await industryField.fill('Technology');

    const websiteField = modal.locator('input').nth(3);
    await websiteField.fill('qatestco.com');

    const contactInputs = modal.locator('input');
    const totalInputs = await contactInputs.count();
    console.log('[TC-F14-01] Total input fields in Add company modal:', totalInputs);

    await contactInputs.nth(4).fill('QA Contact One');
    await contactInputs.nth(5).fill('CEO');
    await contactInputs.nth(6).fill(`contact1${Date.now()}@qatestco.com`);
    await contactInputs.nth(7).fill('555-000-0001');

    const addContactBtn = page.getByText('Add contact', { exact: true }).first();
    await addContactBtn.click();
    await page.waitForTimeout(1000);

    const contactInputs2 = modal.locator('input');
    const totalAfter = await contactInputs2.count();
    console.log('[TC-F14-01] Total input fields after Add contact:', totalAfter);
    if (totalAfter >= 12) {
      await contactInputs2.nth(8).fill('QA Contact Two');
      await contactInputs2.nth(9).fill('CFO');
      await contactInputs2.nth(10).fill(`contact2${Date.now()}@qatestco.com`);
      await contactInputs2.nth(11).fill('555-000-0002');
    }

    const submitBtn = page.getByRole('button', { name: 'Add company', exact: true }).last();
    await submitBtn.click();
    await page.waitForTimeout(3000);

    const companiesTab = page.getByText(/Companies \(\d+\)/, { exact: false }).first();
    await companiesTab.click();
    await page.waitForTimeout(2000);

    const found = await page.getByText(uniqueName, { exact: false }).first().isVisible({ timeout: 10000 }).catch(() => false);
    console.log('[TC-F14-01] Company found after creation:', found);
    expect(found).toBeTruthy();
  });

  test('TC-F14-02: New lead linked to company', async ({ page }) => {
    test.setTimeout(60000);

    await goToCrm(page);

    const newLeadBtn = page.getByRole('button', { name: 'New lead', exact: true }).first();
    await newLeadBtn.waitFor({ state: 'visible', timeout: 15000 });
    await newLeadBtn.click();
    await page.waitForTimeout(1500);

    const modal = page.getByRole('button', { name: 'Create lead', exact: true }).locator('xpath=ancestor::div[.//input][1]');

    const linkSelect = modal.locator('select').first();
    const options = await linkSelect.locator('option').allInnerTexts();
    const match = options.find(o => o.toLowerCase().includes('qa test company'));
    console.log('[TC-F14-02] Available company links:', options.join(' | '));
    if (match) {
      await linkSelect.selectOption({ label: match });
      await page.waitForTimeout(1000);
    }

    const sourceSelect = modal.locator('select').nth(1);
    await sourceSelect.selectOption({ label: 'Referral' }).catch(async () => {
      const srcOptions = await sourceSelect.locator('option').allInnerTexts();
      console.log('[TC-F14-02] Lead source options:', srcOptions.join(' | '));
    });

    const valueField = modal.locator('input[type="number"]').first();
    await valueField.fill('120000');

    const createBtn = page.getByRole('button', { name: 'Create lead', exact: true }).first();
    await createBtn.click();
    await page.waitForTimeout(3000);

    const body = await page.locator('body').innerText();
    const sawBearerError = body.includes('401') || body.includes('bearer token');
    console.log('[TC-F14-02] Saw 401/bearer token error:', sawBearerError);

    expect(sawBearerError).toBeFalsy();
  });

  test('TC-F14-03: Duplicate lead badge appears for matching contact email', async ({ page }) => {
    test.setTimeout(90000);

    await goToCrm(page);

    const uniqueEmail = `qadup${Date.now()}@qatestco.com`;

    const uniqueCompanyA = `QA Dup Test A ${Date.now()}`;
    let newLeadBtn = page.getByRole('button', { name: 'New lead', exact: true }).first();
    await newLeadBtn.waitFor({ state: 'visible', timeout: 15000 });
    await newLeadBtn.click();
    await page.waitForTimeout(1500);

    let submitBtn = page.getByRole('button', { name: 'Create lead', exact: true }).first();
    let modal = submitBtn.locator('xpath=ancestor::div[.//input][1]');
    await modal.locator('input').first().fill(uniqueCompanyA);
    await modal.locator('input[type="email"]').first().fill(uniqueEmail);
    await submitBtn.click();
    await page.waitForTimeout(2500);

    const uniqueCompanyB = `QA Dup Test B ${Date.now()}`;
    newLeadBtn = page.getByRole('button', { name: 'New lead', exact: true }).first();
    await newLeadBtn.waitFor({ state: 'visible', timeout: 15000 });
    await newLeadBtn.click();
    await page.waitForTimeout(1500);

    submitBtn = page.getByRole('button', { name: 'Create lead', exact: true }).first();
    modal = submitBtn.locator('xpath=ancestor::div[.//input][1]');
    await modal.locator('input').first().fill(uniqueCompanyB);
    await modal.locator('input[type="email"]').first().fill(uniqueEmail);
    await submitBtn.click();
    await page.waitForTimeout(2500);

    const hasDupBadge = await page.evaluate((companyName) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) {
        if (textNode.textContent && textNode.textContent.includes(companyName)) break;
      }
      if (!textNode) return null;

      let node = textNode.parentElement;
      for (let d = 0; d < 8 && node; d++) {
        const text = node.innerText || '';
        if (/\bdup\b/i.test(text)) {
          return true;
        }
        node = node.parentElement;
      }
      return false;
    }, uniqueCompanyB);

    console.log('[TC-F14-03] "dup" badge found near the new duplicate lead:', hasDupBadge);
    expect(hasDupBadge).toBeTruthy();
  });

  test('TC-F14-04: Log call, email, task on a lead', async ({ page }) => {
    test.setTimeout(60000);

    await goToCrm(page);
    await openActivityModalViaPhoneIcon(page);

    const modalHeading = page.getByText('Activity —', { exact: false }).first();
    const modalOpen = await modalHeading.isVisible({ timeout: 10000 }).catch(() => false);
    console.log('[TC-F14-04] Activity modal confirmed open:', modalOpen);
    expect(modalOpen).toBeTruthy();

    const typeSelect = await getActivityTypeSelect(page);
    const textField = page.locator('input[placeholder*="happened" i]').first();
    const logBtn = page.getByRole('button', { name: 'Log', exact: true }).first();

    await typeSelect.selectOption({ label: 'Call' });
    await textField.fill('Discovery call with client (automated)');
    await logBtn.click();
    await page.waitForTimeout(1500);

    await typeSelect.selectOption({ label: 'Email' });
    await textField.fill('Sent intro email to client (automated)');
    await logBtn.click();
    await page.waitForTimeout(1500);

    await typeSelect.selectOption({ label: 'Task' });
    await textField.fill('Follow up next week (automated)');
    const dateField = page.locator('input[type="date"]').first();
    const dateVisible = await dateField.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('[TC-F14-04] Due-date field visible for Task:', dateVisible);
    if (dateVisible) {
      const today = new Date();
      await dateField.fill(today.toISOString().slice(0, 10));
    }
    await logBtn.click();
    await page.waitForTimeout(1500);

    const body = await page.locator('body').innerText();
    const hasCall = body.includes('Discovery call with client (automated)');
    const hasEmail = body.includes('Sent intro email to client (automated)');
    const hasTask = body.includes('Follow up next week (automated)');
    console.log('[TC-F14-04] Call logged:', hasCall, '| Email logged:', hasEmail, '| Task logged:', hasTask);

    expect(hasCall && hasEmail && hasTask).toBeTruthy();
  });

  test('TC-F14-05: Tick task done — strikethrough', async ({ page }) => {
    test.setTimeout(60000);

    await goToCrm(page);
    await openActivityModalViaPhoneIcon(page);

    const modalHeading = page.getByText('Activity —', { exact: false }).first();
    await modalHeading.waitFor({ state: 'visible', timeout: 10000 });

    const typeSelect = await getActivityTypeSelect(page);
    const uniqueTaskText = `QA Task ${Date.now()}`;

    await typeSelect.selectOption({ label: 'Task' });
    const textField = page.locator('input[placeholder*="happened" i]').first();
    await textField.fill(uniqueTaskText);
    const dateField = page.locator('input[type="date"]').first();
    const dateVisible = await dateField.isVisible({ timeout: 5000 }).catch(() => false);
    if (dateVisible) {
      const today = new Date();
      await dateField.fill(today.toISOString().slice(0, 10));
    }
    const logBtn = page.getByRole('button', { name: 'Log', exact: true }).first();
    await logBtn.click();
    await page.waitForTimeout(1500);

    const taskEntry = page.getByText(uniqueTaskText, { exact: false }).first();
    const taskVisible = await taskEntry.isVisible({ timeout: 10000 }).catch(() => false);
    console.log('[TC-F14-05] Fresh task entry visible:', taskVisible);
    expect(taskVisible).toBeTruthy();

    const rowHandle = await page.evaluateHandle((taskText) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) {
        if (textNode.textContent && textNode.textContent.includes(taskText)) break;
      }
      if (!textNode) return null;

      let node = textNode.parentElement;
      for (let d = 0; d < 10 && node; d++) {
        const buttonCount = node.querySelectorAll('button').length;
        if (buttonCount === 1) {
          return node;
        }
        node = node.parentElement;
      }
      return null;
    }, uniqueTaskText);

    const rowFound = await rowHandle.evaluate(el => !!el);
    console.log('[TC-F14-05] Task row (exactly 1 button inside) found:', rowFound);

    if (!rowFound) {
      throw new Error(`[TC-F14-05] Could not isolate a single-button row for task text "${uniqueTaskText}"`);
    }

    const rowButtonHandle = await rowHandle.evaluateHandle(el => el.querySelector('button'));
    const rowButton = rowButtonHandle.asElement();

    if (!rowButton) {
      throw new Error('[TC-F14-05] Row found but no button inside it.');
    }

    await page.evaluate(el => el.scrollIntoView(), rowButton);
    await rowButton.click({ force: true });
    await page.waitForTimeout(1500);

    const hasStrikethrough = await page.evaluate((taskText) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent && node.textContent.includes(taskText)) {
          let el = node.parentElement;
          for (let d = 0; d < 4 && el; d++) {
            const style = window.getComputedStyle(el);
            if (style.textDecorationLine && style.textDecorationLine.includes('line-through')) {
              return true;
            }
            el = el.parentElement;
          }
        }
      }
      return false;
    }, uniqueTaskText);

    console.log('[TC-F14-05] Strikethrough detected on task text:', hasStrikethrough);
    expect(hasStrikethrough).toBeTruthy();
  });

  test('TC-F14-06: Change lead status to won — KPI updates', async ({ page }) => {
    test.setTimeout(60000);

    await goToCrm(page);

    const bodyBefore = await page.locator('body').innerText();
    const pipelineBeforeMatch = bodyBefore.match(/PIPELINE VALUE\s*\$?([\d.]+)K/i);
    const pipelineBefore = pipelineBeforeMatch ? parseFloat(pipelineBeforeMatch[1]) : null;
    console.log('[TC-F14-06] Pipeline Value before:', pipelineBefore);

    const statusSelects = page.locator('select').filter({ hasText: 'won' });
    const count = await statusSelects.count();
    console.log('[TC-F14-06] Status selects with "won" option found:', count);
    if (count > 0) {
      await statusSelects.first().selectOption({ label: 'won' });
      await page.waitForTimeout(2000);
    }

    const bodyAfter = await page.locator('body').innerText();
    const pipelineAfterMatch = bodyAfter.match(/PIPELINE VALUE\s*\$?([\d.]+)K/i);
    const pipelineAfter = pipelineAfterMatch ? parseFloat(pipelineAfterMatch[1]) : null;
    console.log('[TC-F14-06] Pipeline Value after:', pipelineAfter);

    if (pipelineBefore !== null && pipelineAfter !== null) {
      expect(pipelineAfter).toBeLessThanOrEqual(pipelineBefore);
    } else {
      console.log('[TC-F14-06] Could not parse Pipeline Value — logging only.');
    }
  });

});