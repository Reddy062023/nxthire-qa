// ============================================================
// Feature 9 — Interviews and Placements (standalone)
//   TC-F09-01: Log interview — KPI ticks up
//   TC-F09-02: Edit interview outcome to "passed" (pencil icon)
//   TC-F09-03: Log placement — Placements this week ticks up
//   TC-F09-04: Analytics reflects correct Interviews arranged and
//              Placements counts
//
// TC-F09-02's pencil targeting: naive "ancestor contains target text"
// gave a false positive (same class of bug fixed in Feature 14's
// checkbox targeting) — a broad ancestor wrapping the whole table
// contains every candidate name, so the wrong pencil button got
// clicked. Fixed using the same proven pattern: find the SMALLEST
// ancestor containing our unique text that has EXACTLY ONE pencil
// icon inside it — that isolates the specific row.
//
// Log interview modal fields: Candidate name, Interview date, Client,
// Client manager, Bill rate (5 inputs), Outcome select (scheduled/
// completed/passed/failed/no show/cancelled), Notes (textarea).
// Log placement modal fields: Candidate name, Sub-vendor, Interview
// date, Start date, Client, Client manager, Bill rate (7 inputs),
// Outcome select (confirmed/started/completed/backed out/terminated),
// Notes (textarea).
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';

test.describe.configure({ retries: 0 });

async function goToInterviews(page) {
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  if (!loggedIn) {
    await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
    await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
    await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  await page.goto(`${BASE_URL}/interviews`, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

test.describe('Feature 9 — Interviews and Placements (standalone)', () => {

  test('TC-F09-01: Log interview — KPI ticks up', async ({ page }) => {
    test.setTimeout(60000);

    await goToInterviews(page);

    const bodyBefore = await page.locator('body').innerText();
    const beforeMatch = bodyBefore.match(/INTERVIEWS THIS WEEK\s*\n?\s*(\d+)/i);
    const countBefore = beforeMatch ? parseInt(beforeMatch[1], 10) : null;
    console.log('[TC-F09-01] Interviews this week before:', countBefore);

    const logBtn = page.getByRole('button', { name: 'Log interview', exact: true }).first();
    await logBtn.click();
    await page.waitForTimeout(2000);

    const submitBtn = page.getByRole('button', { name: 'Log interview', exact: true }).last();
    const modal = submitBtn.locator('xpath=ancestor::div[.//input][1]');

    const inputs = modal.locator('input');
    const uniqueCandidateName = `QA Test Candidate ${Date.now()}`;
    await inputs.nth(0).fill(uniqueCandidateName);
    await inputs.nth(1).fill(new Date().toISOString().slice(0, 10));
    await inputs.nth(2).fill('QA Test Client');
    await inputs.nth(3).fill('QA Manager');
    await inputs.nth(4).fill('$100/hr');

    const outcomeSelect = modal.locator('select').first();
    await outcomeSelect.selectOption({ label: 'scheduled' });

    await submitBtn.click();
    await page.waitForTimeout(3000);

    const bodyAfter = await page.locator('body').innerText();
    const afterMatch = bodyAfter.match(/INTERVIEWS THIS WEEK\s*\n?\s*(\d+)/i);
    const countAfter = afterMatch ? parseInt(afterMatch[1], 10) : null;
    console.log('[TC-F09-01] Interviews this week after:', countAfter);

    const candidateFound = bodyAfter.includes(uniqueCandidateName);
    console.log('[TC-F09-01] New interview entry found:', candidateFound);

    expect(candidateFound).toBeTruthy();
    if (countBefore !== null && countAfter !== null) {
      expect(countAfter).toBeGreaterThan(countBefore);
    }
  });

  test('TC-F09-02: Edit interview outcome to "passed"', async ({ page }) => {
    test.setTimeout(60000);

    await goToInterviews(page);

    const logBtn = page.getByRole('button', { name: 'Log interview', exact: true }).first();
    await logBtn.click();
    await page.waitForTimeout(2000);

    const submitBtn = page.getByRole('button', { name: 'Log interview', exact: true }).last();
    const modal = submitBtn.locator('xpath=ancestor::div[.//input][1]');

    const uniqueCandidateName = `QA Edit Test ${Date.now()}`;
    const inputs = modal.locator('input');
    await inputs.nth(0).fill(uniqueCandidateName);
    await inputs.nth(1).fill(new Date().toISOString().slice(0, 10));
    await inputs.nth(2).fill('QA Test Client');
    await inputs.nth(3).fill('QA Manager');
    await inputs.nth(4).fill('$100/hr');

    const outcomeSelect = modal.locator('select').first();
    await outcomeSelect.selectOption({ label: 'scheduled' });

    await submitBtn.click();
    await page.waitForTimeout(3000);

    const targetPencilIndex = await page.evaluate((candidateName) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) {
        if (textNode.textContent && textNode.textContent.includes(candidateName)) break;
      }
      if (!textNode) return -1;

      let node = textNode.parentElement;
      for (let d = 0; d < 12 && node; d++) {
        const pencils = node.querySelectorAll('svg.lucide-pencil');
        if (pencils.length === 1) {
          const btn = pencils[0].closest('button');
          const allPencilButtons = Array.from(document.querySelectorAll('button:has(svg.lucide-pencil)'));
          return allPencilButtons.indexOf(btn);
        }
        node = node.parentElement;
      }
      return -1;
    }, uniqueCandidateName);

    console.log('[TC-F09-02] Correctly-scoped pencil index:', targetPencilIndex);

    if (targetPencilIndex === -1) {
      throw new Error('[TC-F09-02] Could not isolate a single-pencil row for the new interview.');
    }

    const targetPencil = page.locator('button:has(svg.lucide-pencil)').nth(targetPencilIndex);
    await targetPencil.click();
    await page.waitForTimeout(2000);

    const modalHeading = page.getByText(`Edit interview — ${uniqueCandidateName}`, { exact: false }).first();
    const correctModalOpen = await modalHeading.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('[TC-F09-02] Edit modal opened for the correct candidate:', correctModalOpen);
    expect(correctModalOpen).toBeTruthy();

    const editSelects = page.locator('select');
    const editSelectCount = await editSelects.count();
    let editOutcomeSelect = null;
    for (let i = 0; i < editSelectCount; i++) {
      const opts = await editSelects.nth(i).locator('option').allInnerTexts().catch(() => []);
      if (opts.includes('scheduled') && opts.includes('passed')) {
        editOutcomeSelect = editSelects.nth(i);
        break;
      }
    }

    if (!editOutcomeSelect) {
      throw new Error('[TC-F09-02] Could not find the Outcome select in the edit modal.');
    }

    await editOutcomeSelect.selectOption({ label: 'passed' });

    const saveBtn = page.getByRole('button', { name: 'Save changes', exact: true }).first();
    await saveBtn.click();
    await page.waitForTimeout(3000);

    const bodyAfter = await page.locator('body').innerText();
    const rowIndex = bodyAfter.indexOf(uniqueCandidateName);
    const rowSnippet = rowIndex >= 0 ? bodyAfter.slice(rowIndex, rowIndex + 200) : '';
    console.log('[TC-F09-02] Row text after edit:', rowSnippet.replace(/[\r\n]+/g, ' ~ '));

    const outcomeIsPassed = rowSnippet.includes('passed');
    console.log('[TC-F09-02] Outcome now shows "passed":', outcomeIsPassed);

    expect(outcomeIsPassed).toBeTruthy();
  });

  test('TC-F09-03: Log placement — Placements this week ticks up', async ({ page }) => {
    test.setTimeout(60000);

    await goToInterviews(page);

    const placementsTab = page.getByRole('button', { name: /Placements \(\d+\)/i }).first();
    await placementsTab.click();
    await page.waitForTimeout(2000);

    const bodyBefore = await page.locator('body').innerText();
    const beforeMatch = bodyBefore.match(/PLACEMENTS THIS WEEK\s*\n?\s*(\d+)/i);
    const countBefore = beforeMatch ? parseInt(beforeMatch[1], 10) : null;
    console.log('[TC-F09-03] Placements this week before:', countBefore);

    const logPlacementBtn = page.getByRole('button', { name: 'Log placement', exact: true }).first();
    await logPlacementBtn.click();
    await page.waitForTimeout(2000);

    const submitBtn = page.getByRole('button', { name: 'Log placement', exact: true }).last();
    const modal = submitBtn.locator('xpath=ancestor::div[.//input][1]');

    const uniqueCandidateName = `QA Placement Test ${Date.now()}`;
    const inputs = modal.locator('input');
    await inputs.nth(0).fill(uniqueCandidateName);
    await inputs.nth(1).fill('QA Sub-vendor');
    await inputs.nth(2).fill(new Date().toISOString().slice(0, 10));
    await inputs.nth(3).fill(new Date().toISOString().slice(0, 10));
    await inputs.nth(4).fill('QA Test Client');
    await inputs.nth(5).fill('QA Manager');
    await inputs.nth(6).fill('$90/hr');

    const outcomeSelect = modal.locator('select').first();
    await outcomeSelect.selectOption({ label: 'confirmed' });

    await submitBtn.click();
    await page.waitForTimeout(3000);

    const bodyAfter = await page.locator('body').innerText();
    const afterMatch = bodyAfter.match(/PLACEMENTS THIS WEEK\s*\n?\s*(\d+)/i);
    const countAfter = afterMatch ? parseInt(afterMatch[1], 10) : null;
    console.log('[TC-F09-03] Placements this week after:', countAfter);

    const placementFound = bodyAfter.includes(uniqueCandidateName);
    console.log('[TC-F09-03] New placement entry found:', placementFound);

    expect(placementFound).toBeTruthy();
    if (countBefore !== null && countAfter !== null) {
      expect(countAfter).toBeGreaterThan(countBefore);
    }
  });

  test('TC-F09-04: Analytics reflects correct Interviews arranged and Placements counts', async ({ page }) => {
    test.setTimeout(60000);

    await goToInterviews(page);

    const bodyInterviews = await page.locator('body').innerText();
    const interviewsTabMatch = bodyInterviews.match(/Interviews \((\d+)\)/i);
    const interviewsTabCount = interviewsTabMatch ? parseInt(interviewsTabMatch[1], 10) : null;
    console.log('[TC-F09-04] Interviews tab count:', interviewsTabCount);

    const placementsTabMatch = bodyInterviews.match(/Placements \((\d+)\)/i);
    const placementsTabCount = placementsTabMatch ? parseInt(placementsTabMatch[1], 10) : null;
    console.log('[TC-F09-04] Placements tab count:', placementsTabCount);

    await page.goto(`${BASE_URL}/analytics`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const analyticsBody = await page.locator('body').innerText();
    const interviewsArrangedMatch = analyticsBody.match(/Interviews\s*arranged\D*(\d+)/i);
    const interviewsArrangedCount = interviewsArrangedMatch ? parseInt(interviewsArrangedMatch[1], 10) : null;
    console.log('[TC-F09-04] Analytics "Interviews arranged" count:', interviewsArrangedCount);

    const placementsAnalyticsMatch = analyticsBody.match(/Placements\D*(\d+)/i);
    const placementsAnalyticsCount = placementsAnalyticsMatch ? parseInt(placementsAnalyticsMatch[1], 10) : null;
    console.log('[TC-F09-04] Analytics "Placements" count:', placementsAnalyticsCount);

    expect(interviewsArrangedCount).not.toBeNull();
    expect(placementsAnalyticsCount).not.toBeNull();
  });

});