// ============================================================
// Feature 15 — Job Seeker Portal (standalone) — DRAFT (not yet run)
//   TC-F15-01: Seeker self-registration
//   TC-F15-02: Duplicate-email registration rejected
//   TC-F15-03: Seeker login
//   TC-F15-04: Seeker token blocked from recruiter/admin routes
//   TC-F15-05: Seeker profile view
//   TC-F15-11: Seeker dashboard completeness
//
//   NOT included yet — TC-F15-06 to -10 (share request lifecycle)
//   and TC-F15-12 (consent-gated apply): these need the recruiter-side
//   "send share request" UI, which hasn't been located manually yet.
//   Add once that screen is found (see note at bottom of file).
//
//   Known quirk (observed manually Aug 6): seeker-register can fail
//   once with "Couldn't reach the server" then succeed on retry —
//   registerSeeker() below retries once automatically so this
//   flakiness doesn't mask real regressions.
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';
const SEEKER_PASSWORD = 'Test@1234';

test.describe.configure({ retries: 0 });

function freshSeekerEmail(label) {
  return `qaseeker.${label}.${Date.now()}@example.com`;
}

async function registerSeeker(page, email, opts = {}) {
  await page.goto(`${BASE_URL}/seeker-register`, { timeout: 60000 });
  await page.waitForTimeout(1000);

  // "Full name" / "Email" / etc. on this form are styled text, not real
  // <label for="">-linked labels — getByLabel times out. Use positional
  // input order instead (confirmed via manual screenshot Aug 6):
  // 0=Full name, 1=Email, 2=Password, 3=Current title, 4=Location, 5=Top skills.
  const inputs = page.locator('input');
  const inputCount = await inputs.count();
  console.log('[registerSeeker] Input field count on /seeker-register:', inputCount);

  await inputs.nth(0).fill(opts.name || 'QA Seeker');
  await inputs.nth(1).fill(email);
  await inputs.nth(2).fill(SEEKER_PASSWORD);
  await inputs.nth(3).fill(opts.title || 'Software Engineer');
  await inputs.nth(4).fill(opts.location || 'Austin, TX');
  await inputs.nth(5).fill(opts.skills || 'React, TypeScript, Python');
  // Leave Profile visibility on its default ("Private — agencies must request consent")

  const submitBtn = page.getByRole('button', { name: 'Create profile', exact: true }).first();
  await submitBtn.click();
  await page.waitForTimeout(2000);

  const serverError = await page.getByText(/couldn.?t reach the server/i).isVisible({ timeout: 3000 }).catch(() => false);
  console.log('[registerSeeker] Server error on first attempt:', serverError);
  if (serverError) {
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }
}

async function loginSeeker(page, email) {
  await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Job seeker', exact: true }).click();
  await page.locator('input').first().fill(email);
  await page.locator('input[type="password"]').first().fill(SEEKER_PASSWORD);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForTimeout(2000);
}

test.describe('Feature 15 — Job Seeker Portal (standalone)', () => {

  test('TC-F15-01: Seeker self-registration', async ({ page }) => {
    test.setTimeout(60000);
    const email = freshSeekerEmail('reg');

    await registerSeeker(page, email);

    const onSeekerPortal = page.url().includes('/seeker');
    console.log('[TC-F15-01] Landed on seeker portal:', page.url());
    expect(onSeekerPortal).toBeTruthy();

    const notOnRecruiterRoute = !page.url().includes('/candidates') && !page.url().includes('/crm');
    expect(notOnRecruiterRoute).toBeTruthy();

    const emailVisible = await page.getByText(email, { exact: false }).first().isVisible({ timeout: 10000 }).catch(() => false);
    console.log('[TC-F15-01] Registered email visible on dashboard:', emailVisible);
    expect(emailVisible).toBeTruthy();
  });

  test('TC-F15-02: Duplicate-email registration rejected', async ({ page }) => {
    test.setTimeout(60000);
    const email = freshSeekerEmail('dup');

    await registerSeeker(page, email);
    const firstRegisterUrl = page.url();
    console.log('[TC-F15-02] First registration landed on:', firstRegisterUrl);

    await registerSeeker(page, email, { name: 'QA Seeker Dup Attempt' });

    const stillOnRegisterOrError = page.url().includes('/seeker-register')
      || await page.getByText(/already registered|already exists|in use/i).isVisible({ timeout: 5000 }).catch(() => false);
    console.log('[TC-F15-02] Duplicate attempt rejected (stayed on register or showed error):', stillOnRegisterOrError);
    expect(stillOnRegisterOrError).toBeTruthy();
  });

  test('TC-F15-03: Seeker login', async ({ page }) => {
    test.setTimeout(60000);
    const email = freshSeekerEmail('login');

    await registerSeeker(page, email);

    const signOutBtn = page.getByRole('button', { name: 'Sign out', exact: true }).first();
    await signOutBtn.click();
    await page.waitForTimeout(1500);

    await loginSeeker(page, email);

    const onSeekerPortal = page.url().includes('/seeker');
    console.log('[TC-F15-03] Logged back in, landed on:', page.url());
    expect(onSeekerPortal).toBeTruthy();

    const emailVisible = await page.getByText(email, { exact: false }).first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(emailVisible).toBeTruthy();
  });

  test('TC-F15-04: Seeker token blocked from recruiter/admin routes', async ({ page }) => {
    test.setTimeout(60000);
    const email = freshSeekerEmail('block');

    await registerSeeker(page, email);

    await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
    await page.waitForTimeout(2000);
    const blockedFromCandidates = !page.url().endsWith('/candidates');
    console.log('[TC-F15-04] Blocked from /candidates:', blockedFromCandidates, '| URL:', page.url());

    await page.goto(`${BASE_URL}/crm`, { timeout: 60000 });
    await page.waitForTimeout(2000);
    const blockedFromCrm = !page.url().endsWith('/crm');
    console.log('[TC-F15-04] Blocked from /crm:', blockedFromCrm, '| URL:', page.url());

    expect(blockedFromCandidates && blockedFromCrm).toBeTruthy();
  });

  test('TC-F15-05: Seeker profile view', async ({ page }) => {
    test.setTimeout(60000);
    const email = freshSeekerEmail('profile');

    await registerSeeker(page, email, { name: 'Profile View Test', title: 'QA Engineer', location: 'Boston, MA' });

    const body = await page.locator('body').innerText();
    const hasName = body.includes('Profile View Test');
    const hasTitle = body.includes('QA Engineer');
    const hasLocation = body.includes('Boston, MA');
    console.log('[TC-F15-05] Name:', hasName, '| Title:', hasTitle, '| Location:', hasLocation);

    expect(hasName && hasTitle && hasLocation).toBeTruthy();
  });

  test('TC-F15-11: Seeker dashboard completeness', async ({ page }) => {
    test.setTimeout(60000);
    const email = freshSeekerEmail('dash');

    await registerSeeker(page, email);

    const body = await page.locator('body').innerText();
    const hasShareRequests = /share requests/i.test(body);
    const hasConnectedAgencies = /connected agencies/i.test(body);
    console.log('[TC-F15-11] Share requests section:', hasShareRequests, '| Connected agencies section:', hasConnectedAgencies);

    expect(hasShareRequests && hasConnectedAgencies).toBeTruthy();
  });

});

// ------------------------------------------------------------
// TODO — TC-F15-06 to -10 (share request lifecycle) and TC-F15-12
// (consent-gated apply): need the recruiter-side screen for sending
// a share request to a seeker. Not yet located manually. Once found,
// add a goToRecruiterSeekerSearch()-style helper here (mirroring
// goToCrm() from feature14.spec.js — inline login via
// process.env.NXTHIRE_EMAIL / NXTHIRE_PASSWORD, no storageState
// file), then a two-page test: recruiter sends the request, seeker
// (separate `page` via a second browser context) approves/rejects it.
// ------------------------------------------------------------
