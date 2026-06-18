# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: openjobs.spec.js >> TC-12-A Page Load >> Open Jobs page loads with requisitions
- Location: openjobs.spec.js:44:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "NS North Star" [ref=e5] [cursor=pointer]:
      - /url: /dashboard
      - generic [ref=e6]: NS
      - generic [ref=e7]: North Star
    - navigation [ref=e8]:
      - generic [ref=e9]: Recruit
      - link "AI Recruiter NEW" [ref=e10] [cursor=pointer]:
        - /url: /dashboard
        - img [ref=e11]
        - generic [ref=e13]: AI Recruiter
        - generic [ref=e14]: NEW
      - link "Candidates" [ref=e15] [cursor=pointer]:
        - /url: /candidates
        - img [ref=e16]
        - generic [ref=e21]: Candidates
      - link "Open jobs" [ref=e22] [cursor=pointer]:
        - /url: /jobs
        - img [ref=e23]
        - generic [ref=e26]: Open jobs
      - generic [ref=e27]: Configure
      - link "Data sources" [ref=e28] [cursor=pointer]:
        - /url: /sources
        - img [ref=e29]
        - generic [ref=e31]: Data sources
      - link "Monster" [ref=e32] [cursor=pointer]:
        - /url: /connectors/monster
        - img [ref=e33]
        - generic [ref=e39]: Monster
      - link "Indeed" [ref=e40] [cursor=pointer]:
        - /url: /connectors/indeed
        - img [ref=e41]
        - generic [ref=e47]: Indeed
      - link "TheirStack" [ref=e48] [cursor=pointer]:
        - /url: /connectors/theirstack
        - img [ref=e49]
        - generic [ref=e55]: TheirStack
      - link "Ceipal" [ref=e56] [cursor=pointer]:
        - /url: /connectors/ceipal
        - img [ref=e57]
        - generic [ref=e63]: Ceipal
      - link "Onboarding" [ref=e64] [cursor=pointer]:
        - /url: /onboarding
        - img [ref=e65]
        - generic [ref=e70]: Onboarding
      - generic [ref=e71]: Insights
      - link "Analytics" [ref=e72] [cursor=pointer]:
        - /url: /analytics
        - img [ref=e73]
        - generic [ref=e75]: Analytics
      - generic [ref=e76]: Manage
      - link "Team" [ref=e77] [cursor=pointer]:
        - /url: /users
        - img [ref=e78]
        - generic [ref=e82]: Team
      - link "Settings" [ref=e83] [cursor=pointer]:
        - /url: /settings
        - img [ref=e84]
        - generic [ref=e87]: Settings
  - generic [ref=e88]:
    - banner [ref=e89]:
      - generic [ref=e90]:
        - button [ref=e91] [cursor=pointer]:
          - img [ref=e92]
        - generic "Sign out" [ref=e97] [cursor=pointer]:
          - generic [ref=e98]: SN
          - generic [ref=e100]: Sundar N
          - img [ref=e101]
    - main [ref=e103]:
      - generic [ref=e104]:
        - img [ref=e105]
        - generic [ref=e107]:
          - text: "AI is temporarily unavailable: the configured AI provider account is out of credit or billing-blocked. AI features are paused and falling back to keyword matching until it's topped up."
          - link "Update billing / API key in Settings" [ref=e108] [cursor=pointer]:
            - /url: /settings
        - button "Dismiss" [ref=e109] [cursor=pointer]
      - generic [ref=e110]:
        - generic [ref=e111]:
          - generic [ref=e112]:
            - generic [ref=e113]: /jobs
            - generic [ref=e114]:
              - text: Open jobs
              - img [ref=e115]
            - generic [ref=e117]: Loading… 4.0s
          - generic [ref=e118]:
            - button "Import CSV" [ref=e119] [cursor=pointer]:
              - img [ref=e120]
              - text: Import CSV
            - button "New requisition" [ref=e123] [cursor=pointer]:
              - img [ref=e124]
              - text: New requisition
        - generic [ref=e125]:
          - generic [ref=e126]: SOURCE
          - combobox "SOURCE" [ref=e127]:
            - option "All sources (2,232)" [selected]
            - option "Ceipal (2232)"
        - generic [ref=e128]:
          - generic [ref=e129]:
            - generic [ref=e130]: Active reqs
            - generic [ref=e131]: 2,231
          - generic [ref=e132]:
            - generic [ref=e133]: Avg time-to-fill
            - generic [ref=e134]: —
          - generic [ref=e135]:
            - generic [ref=e136]: Pipeline value
            - generic [ref=e137]: —
        - generic [ref=e139]:
          - img [ref=e140]
          - text: Loading jobs… 4.0s
          - generic [ref=e142]: Large tenants can take several seconds — the full set is fetched in one request today.
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
  25  |   await page.waitForURL('**/dashboard', { timeout: 60000 });
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
> 50  |     expect(hasReqs).toBe(true);
      |                     ^ Error: expect(received).toBe(expected) // Object.is equality
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
  126 | 
  127 |   test('Source filter has Ceipal option', async ({ page }) => {
  128 |     // Source filter is a native select element
  129 |     const select = page.locator('select').first();
  130 |     const visible = await select.isVisible().catch(() => false);
  131 |     if (visible) {
  132 |       const options = await select.locator('option').allInnerTexts();
  133 |       console.log(`Source filter options: ${options.join(', ')}`);
  134 |       const hasCeipal = options.some(o => o.toLowerCase().includes('ceipal'));
  135 |       console.log(`Ceipal option present: ${hasCeipal}`);
  136 |       expect(hasCeipal).toBe(true);
  137 |       console.log('PASS: Ceipal option in source filter');
  138 |     } else {
  139 |       // Try reading options from body text
  140 |       const body = await getBody(page);
  141 |       const hasCeipal = body.includes('Ceipal');
  142 |       console.log(`Ceipal found in page: ${hasCeipal}`);
  143 |       expect(hasCeipal).toBe(true);
  144 |     }
  145 |   });
  146 | 
  147 |   test('Selecting Ceipal filters jobs correctly', async ({ page }) => {
  148 |     const select = page.locator('select').first();
  149 |     const visible = await select.isVisible().catch(() => false);
  150 |     if (visible) {
```