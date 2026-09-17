// ============================================================
// Feature 4 — Word Resume Download (standalone)
//   TC-F04-01: Word resume button present on candidate detail
//   TC-F04-02: Word resume button present even with no file
//              (QA Email Test — confirmed no resume on record)
//   TC-F04-03: Word resume downloads as .docx, correctly named,
//              non-empty file. Deep content check (summary/skills/
//              work history/education/references) is a manual step.
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://nxthire.ai';
const DOWNLOAD_DIR = path.join(__dirname, '..', 'test-data', 'downloads');

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

test.describe('Feature 4 — Word Resume Download (standalone)', () => {

  test.beforeAll(() => {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  });

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

  test('TC-F04-01: Word resume button present on candidate detail', async ({ page }) => {
    await openCandidateByName(page, 'Arjun Mehta');
    const wordResumeBtn = page.getByRole('button', { name: 'Word resume', exact: true })
      .or(page.getByRole('link', { name: 'Word resume', exact: true })).first();
    await expect(wordResumeBtn).toBeVisible({ timeout: 15000 });
  });

  test('TC-F04-02: Word resume button present even with no resume file', async ({ page }) => {
    // QA Email Test is confirmed to have "no file on record" for its
    // resume (seen in earlier Feature 5 debug output).
    await openCandidateByName(page, 'QA Email Test');

    const resumeSectionText = await page.getByText('no file on record', { exact: false }).first().isVisible().catch(() => false);
    console.log('[TC-F04-02] "no file on record" confirmed present:', resumeSectionText);

    const wordResumeBtn = page.getByRole('button', { name: 'Word resume', exact: true })
      .or(page.getByRole('link', { name: 'Word resume', exact: true })).first();
    await expect(wordResumeBtn).toBeVisible({ timeout: 15000 });
  });

  test('TC-F04-03: Word resume downloads as .docx, correctly named, non-empty', async ({ page }) => {
    await openCandidateByName(page, 'Arjun Mehta');

    const wordResumeBtn = page.getByRole('button', { name: 'Word resume', exact: true })
      .or(page.getByRole('link', { name: 'Word resume', exact: true })).first();
    await wordResumeBtn.waitFor({ state: 'visible', timeout: 15000 });

    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
    await wordResumeBtn.click();
    const download = await downloadPromise;

    const suggestedFilename = download.suggestedFilename();
    console.log('[TC-F04-03] Suggested filename:', suggestedFilename);

    const savePath = path.join(DOWNLOAD_DIR, suggestedFilename);
    await download.saveAs(savePath);

    const stats = fs.statSync(savePath);
    console.log('[TC-F04-03] Downloaded file size (bytes):', stats.size);

    // Expected filename pattern: "Arjun Mehta - Resume.docx" (or close
    // variant — exact spacing/casing may differ slightly).
    expect(suggestedFilename.toLowerCase()).toContain('arjun mehta');
    expect(suggestedFilename.toLowerCase()).toMatch(/\.docx$/);
    expect(stats.size).toBeGreaterThan(0);
  });

});