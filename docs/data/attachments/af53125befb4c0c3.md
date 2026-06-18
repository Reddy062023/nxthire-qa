# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: openjobs.spec.js >> TC-12-E View Matches >> View matches button navigates to candidate matches
- Location: openjobs.spec.js:295:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 60000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - img [ref=e8]
      - generic [ref=e10]: NxtHire.ai
    - generic [ref=e11]:
      - generic [ref=e12]: Recruiting on autopilot, with the world's best LLM.
      - generic [ref=e13]: Source candidates across LinkedIn, Indeed, Monster and your private resume DB. Apply to matching jobs in one click.
    - generic [ref=e14]: v0.4.2 · trusted by 240+ agencies
  - generic [ref=e16]:
    - generic [ref=e17]: Welcome back
    - generic [ref=e18]: Sign in to your agency workspace.
    - generic [ref=e19]:
      - button "Recruiter" [ref=e20] [cursor=pointer]:
        - img [ref=e21]
        - text: Recruiter
      - button "Job seeker" [ref=e24] [cursor=pointer]:
        - img [ref=e25]
        - text: Job seeker
    - generic [ref=e28]:
      - generic [ref=e29]: Work email
      - textbox [ref=e30]: vish@premiertalent.com
    - generic [ref=e31]:
      - generic [ref=e32]: Password
      - textbox [ref=e33]: password123
    - generic [ref=e34]: Failed to fetch
    - button "Continue" [ref=e35] [cursor=pointer]:
      - text: Continue
      - img [ref=e36]
    - generic [ref=e38]:
      - text: New agency?
      - link "Sign up" [ref=e39] [cursor=pointer]:
        - /url: /register-agency
      - text: · 14-day free trial
    - generic [ref=e40]:
      - text: Job seeker?
      - link "Register your resume" [ref=e41] [cursor=pointer]:
        - /url: /seeker-register
```

# Test source

```ts
  1   | // ============================================================
  2   | // NxtHire.ai – Open Jobs Module Test Suite
  3   | // Tool: Playwright  |  Target: nxthire.ai/jobs
  4   | // Version: 1.1  |  Date: June 2026
  5   | // QA — North Star Group Inc.
  6   | // Run:  npx playwright test openjobs.spec.js --headed
  7   | // Credentials: stored in .env file — never hardcode passwords
  8   | // ============================================================
  9   | 
  10  | require('dotenv').config();
  11  | const { test, expect } = require('@playwright/test');
  12  | 
  13  | const BASE_URL = 'https://nxthire.ai';
  14  | const CREDS = {
  15  |   email:    process.env.NXTHIRE_EMAIL,
  16  |   password: process.env.NXTHIRE_PASSWORD,
  17  | };
  18  | 
  19  | // ── Login helper ──────────────────────────────────────────────
  20  | async function login(page) {
  21  |   await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  22  |   await page.fill('input[type="email"]',    CREDS.email);
  23  |   await page.fill('input[type="password"]', CREDS.password);
  24  |   await page.click('button[type="submit"]');
> 25  |   await page.waitForURL('**/dashboard', { timeout: 60000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 60000ms exceeded.
  26  | }
  27  | 
  28  | // ── Navigate to Open Jobs page ────────────────────────────────
  29  | async function goToJobs(page) {
  30  |   await page.goto(`${BASE_URL}/jobs`, { timeout: 60000 });
  31  |   await page.waitForTimeout(4000);
  32  | }
  33  | 
  34  | // ── Get page body text ────────────────────────────────────────
  35  | async function getBody(page) {
  36  |   return await page.locator('body').innerText().catch(() => '');
  37  | }
  38  | 
  39  | // ─────────────────────────────────────────────────────────────
  40  | // TC-12-A — Page Load
  41  | // ─────────────────────────────────────────────────────────────
  42  | test.describe('TC-12-A Page Load', () => {
  43  | 
  44  |   test('Open Jobs page loads with requisitions', async ({ page }) => {
  45  |     await login(page);
  46  |     await goToJobs(page);
  47  |     const body = await getBody(page);
  48  |     const hasReqs = body.includes('active requisitions') || body.includes('requisitions loaded');
  49  |     console.log(`Requisitions text found: ${hasReqs}`);
  50  |     expect(hasReqs).toBe(true);
  51  |     console.log('PASS: Open Jobs page loaded with requisitions');
  52  |   });
  53  | 
  54  |   test('Page title shows Open jobs', async ({ page }) => {
  55  |     await login(page);
  56  |     await goToJobs(page);
  57  |     const body = await getBody(page);
  58  |     const hasTitle = body.includes('Open jobs') || body.includes('Open Jobs');
  59  |     console.log(`Page title found: ${hasTitle}`);
  60  |     expect(hasTitle).toBe(true);
  61  |     console.log('PASS: Page title visible');
  62  |   });
  63  | 
  64  |   test('Import CSV and New requisition buttons present', async ({ page }) => {
  65  |     await login(page);
  66  |     await goToJobs(page);
  67  |     await expect(page.locator('button:has-text("Import CSV"), a:has-text("Import CSV")').first()).toBeVisible({ timeout: 10000 });
  68  |     await expect(page.locator('button:has-text("New requisition"), a:has-text("New requisition")').first()).toBeVisible({ timeout: 10000 });
  69  |     console.log('PASS: Import CSV and New requisition buttons present');
  70  |   });
  71  | 
  72  |   test('Stats cards visible — Active reqs, Avg time-to-fill, Pipeline value', async ({ page }) => {
  73  |     await login(page);
  74  |     await goToJobs(page);
  75  |     const body = await getBody(page);
  76  |     const hasActiveReqs    = body.includes('Active reqs') || body.includes('active reqs');
  77  |     const hasTimeToFill    = body.includes('time-to-fill') || body.includes('Time-to-fill');
  78  |     const hasPipelineValue = body.includes('Pipeline value') || body.includes('pipeline value');
  79  |     console.log(`Active reqs: ${hasActiveReqs} | Time-to-fill: ${hasTimeToFill} | Pipeline value: ${hasPipelineValue}`);
  80  |     expect(hasActiveReqs).toBe(true);
  81  |     console.log('PASS: Stats cards visible');
  82  |   });
  83  | 
  84  |   test('Source filter present on page', async ({ page }) => {
  85  |     await login(page);
  86  |     await goToJobs(page);
  87  |     const body = await getBody(page);
  88  |     const hasSource = body.includes('All sources') || body.includes('SOURCE') || body.includes('Source');
  89  |     console.log(`Source filter text found: ${hasSource}`);
  90  |     expect(hasSource).toBe(true);
  91  |     console.log('PASS: Source filter present');
  92  |   });
  93  | 
  94  | });
  95  | 
  96  | // ─────────────────────────────────────────────────────────────
  97  | // TC-12-B — Source Filter
  98  | // The source filter is a custom dropdown — use select element
  99  | // ─────────────────────────────────────────────────────────────
  100 | test.describe('TC-12-B Source Filter', () => {
  101 | 
  102 |   test.beforeEach(async ({ page }) => {
  103 |     await login(page);
  104 |     await goToJobs(page);
  105 |   });
  106 | 
  107 |   test('Default shows All sources with total count', async ({ page }) => {
  108 |     // Extra wait for Firefox which loads slower
  109 |     await page.waitForTimeout(3000);
  110 |     const body = await getBody(page);
  111 |     const hasAllSources = body.includes('All sources') || body.includes('all sources');
  112 |     // Also check via select element
  113 |     const select = page.locator('select').first();
  114 |     const selectVisible = await select.isVisible().catch(() => false);
  115 |     if (!hasAllSources && selectVisible) {
  116 |       const options = await select.locator('option').allInnerTexts();
  117 |       const hasOption = options.some(o => o.toLowerCase().includes('all sources'));
  118 |       console.log(`All sources in select options: ${hasOption}`);
  119 |       expect(hasOption).toBe(true);
  120 |     } else {
  121 |       console.log(`All sources text found: ${hasAllSources}`);
  122 |       expect(hasAllSources).toBe(true);
  123 |     }
  124 |     console.log('PASS: Default source filter shows All sources');
  125 |   });
```