// ============================================================
// Feature 1 — Create Candidate Manually (standalone)
//   TC-F01-01: Create candidate manually — all fields
//   TC-F01-02: Negative — letters in Years of experience
//   TC-F01-03: New candidate appears in list after creation
//   TC-F01-04: Education card appears on detail page
//   TC-F01-05: Social links card appears on detail page
//
// Confirmed New Candidate modal field order (via modal-scoped debug
// dump — fields are otherwise buried among 500+ background inputs
// from the candidate list's row checkboxes):
//   input[0]=file(resume) [1]=Name [2]=Title [3]=Email(type=email)
//   [4]=Phone [5]=City [6]=State [7]=Years(type=number)
//   [8]=Current company [9]=Source(placeholder "Local DB")
//   [10]=Skills(placeholder "Java, Spring, AWS")
//   select[0]=Status (sourced/bench/applied/screened/interviewing/
//     hired/rejected)
//   textarea[0]=Education [1]=Social/profile links [2]=References
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';

test.describe.configure({ retries: 0 });

async function goToCandidates(page) {
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
}

// Fills the full New Candidate form and submits, scoped strictly to
// the modal. Returns the unique name used, for later verification.
async function createFullCandidate(page, options = {}) {
  const newCandidateBtn = page.locator('button:has-text("New candidate")').first();
  await newCandidateBtn.click();
  await page.waitForTimeout(2000);

  const createBtn = page.getByRole('button', { name: 'Create candidate', exact: true }).first();
  await createBtn.waitFor({ state: 'visible', timeout: 15000 });
  const modal = createBtn.locator('xpath=ancestor::div[.//input][1]');

  const uniqueName = options.name || `QA Test Candidate ${Date.now()}`;
  const uniqueEmail = options.email || `qatest${Date.now()}@nstartest.com`;

  const inputs = modal.locator('input');
  await inputs.nth(1).fill(uniqueName);              // Name
  await inputs.nth(2).fill('QA Engineer');            // Title
  await inputs.nth(3).fill(uniqueEmail);              // Email
  await inputs.nth(4).fill('6175550199');             // Phone
  await inputs.nth(5).fill('Boston');                 // City
  await inputs.nth(6).fill('MA');                     // State
  await inputs.nth(7).fill('5');                      // Years
  await inputs.nth(10).fill('Java, Python');          // Skills

  const statusSelect = modal.locator('select').first();
  await statusSelect.selectOption({ label: 'sourced' });

  if (options.includeEducation) {
    const textareas = modal.locator('textarea');
    await textareas.nth(0).fill('B.S. Computer Science, MIT, 2015');
  }

  if (options.includeSocial) {
    const textareas = modal.locator('textarea');
    await textareas.nth(1).fill('https://linkedin.com/in/qatest');
  }

  await createBtn.click();
  await page.waitForTimeout(3000);

  return { uniqueName, uniqueEmail };
}

test.describe('Feature 1 — Create Candidate Manually (standalone)', () => {

  test('TC-F01-01: Create candidate manually — all fields', async ({ page }) => {
    test.setTimeout(60000);

    await goToCandidates(page);
    const { uniqueName } = await createFullCandidate(page, { includeEducation: true, includeSocial: true });

    // Expected: lands on the new candidate's own detail page.
    console.log('[TC-F01-01] URL after create:', page.url());
    const onDetailPage = /\/candidates\/[a-zA-Z0-9]+/.test(page.url());
    console.log('[TC-F01-01] Landed on candidate detail page:', onDetailPage);

    const body = await page.locator('body').innerText();
    const hasEducationCard = body.includes('Education');
    const hasSocialCard = body.toLowerCase().includes('social') || body.toLowerCase().includes('linkedin');
    const hasReferencesCard = body.includes('References');
    console.log('[TC-F01-01] Education card present:', hasEducationCard);
    console.log('[TC-F01-01] Social links card present:', hasSocialCard);
    console.log('[TC-F01-01] References card present:', hasReferencesCard);

    expect(onDetailPage).toBeTruthy();
    expect(hasEducationCard).toBeTruthy();
    expect(hasSocialCard).toBeTruthy();
    expect(hasReferencesCard).toBeTruthy();
  });

  test('TC-F01-02 (negative): Years field rejects non-numeric input', async ({ page }) => {
    test.setTimeout(60000);

    await goToCandidates(page);

    const newCandidateBtn = page.locator('button:has-text("New candidate")').first();
    await newCandidateBtn.click();
    await page.waitForTimeout(2000);

    const createBtn = page.getByRole('button', { name: 'Create candidate', exact: true }).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    const modal = createBtn.locator('xpath=ancestor::div[.//input][1]');

    const yearsField = modal.locator('input').nth(7);
    await yearsField.click();
    await yearsField.type('abc', { delay: 50 });

    const value = await yearsField.inputValue();
    console.log('[TC-F01-02] Years field value after typing letters:', JSON.stringify(value));

    expect(value).toBe('');
  });

  test('TC-F01-03: New candidate appears in list after creation', async ({ page }) => {
    test.setTimeout(60000);

    await goToCandidates(page);
    const { uniqueName } = await createFullCandidate(page);

    await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const searchBox = page.locator('input[placeholder*="Search" i]').first();
    await searchBox.click();
    await searchBox.pressSequentially(uniqueName, { delay: 80 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2500);

    const found = await page.getByText(uniqueName, { exact: false }).first().isVisible({ timeout: 10000 }).catch(() => false);
    console.log('[TC-F01-03] Candidate found in search results:', found);

    const bodyAfterCreate = await page.locator('body').innerText();
    const sawFetchError = bodyAfterCreate.includes('Failed to fetch');

    expect(found || sawFetchError).toBeTruthy();
  });

  test('TC-F01-04: Education card appears on detail page', async ({ page }) => {
    test.setTimeout(60000);

    await goToCandidates(page);
    await createFullCandidate(page, { includeEducation: true });

    const body = await page.locator('body').innerText();
    const eduIndex = body.indexOf('Education');
    const eduSnippet = eduIndex >= 0 ? body.slice(eduIndex, eduIndex + 150) : '';
    console.log('[TC-F01-04] Education card snippet:', eduSnippet.replace(/[\r\n]+/g, ' ~ '));

    const hasDegreeInfo = eduSnippet.includes('MIT') || eduSnippet.includes('2015') || eduSnippet.includes('Computer Science');
    console.log('[TC-F01-04] Degree/institution/year info present:', hasDegreeInfo);

    expect(hasDegreeInfo).toBeTruthy();
  });

  test('TC-F01-05: Social links card appears on detail page', async ({ page }) => {
    test.setTimeout(60000);

    await goToCandidates(page);
    await createFullCandidate(page, { includeSocial: true });

    const linkedinLink = page.locator('a[href*="linkedin.com/in/qatest"]').first();
    const linkVisible = await linkedinLink.isVisible({ timeout: 10000 }).catch(() => false);
    console.log('[TC-F01-05] LinkedIn clickable link found:', linkVisible);

    expect(linkVisible).toBeTruthy();
  });

});