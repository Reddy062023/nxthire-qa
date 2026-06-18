# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: openjobs.spec.js >> TC-12-A Page Load >> Source filter dropdown present
- Location: openjobs.spec.js:75:3

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
        - generic [ref=e17]: AI Recruiter
        - generic [ref=e18]: NEW
      - link "Candidates" [ref=e19] [cursor=pointer]:
        - /url: /candidates
        - img [ref=e20]
        - generic [ref=e25]: Candidates
      - link "Open jobs" [ref=e26] [cursor=pointer]:
        - /url: /jobs
        - img [ref=e27]
        - generic [ref=e30]: Open jobs
      - generic [ref=e31]: Configure
      - link "Data sources" [ref=e32] [cursor=pointer]:
        - /url: /sources
        - img [ref=e33]
        - generic [ref=e38]: Data sources
      - link "Monster" [ref=e39] [cursor=pointer]:
        - /url: /connectors/monster
        - img [ref=e40]
        - generic [ref=e46]: Monster
      - link "Indeed" [ref=e47] [cursor=pointer]:
        - /url: /connectors/indeed
        - img [ref=e48]
        - generic [ref=e54]: Indeed
      - link "TheirStack" [ref=e55] [cursor=pointer]:
        - /url: /connectors/theirstack
        - img [ref=e56]
        - generic [ref=e62]: TheirStack
      - link "Ceipal" [ref=e63] [cursor=pointer]:
        - /url: /connectors/ceipal
        - img [ref=e64]
        - generic [ref=e70]: Ceipal
      - link "Onboarding" [ref=e71] [cursor=pointer]:
        - /url: /onboarding
        - img [ref=e72]
        - generic [ref=e77]: Onboarding
      - generic [ref=e78]: Insights
      - link "Analytics" [ref=e79] [cursor=pointer]:
        - /url: /analytics
        - img [ref=e80]
        - generic [ref=e85]: Analytics
      - generic [ref=e86]: Manage
      - link "Team" [ref=e87] [cursor=pointer]:
        - /url: /users
        - img [ref=e88]
        - generic [ref=e92]: Team
      - link "Settings" [ref=e93] [cursor=pointer]:
        - /url: /settings
        - img [ref=e94]
        - generic [ref=e97]: Settings
  - generic [ref=e98]:
    - banner [ref=e99]:
      - generic [ref=e100]:
        - button [ref=e101] [cursor=pointer]:
          - img [ref=e102]
        - generic "Sign out" [ref=e107] [cursor=pointer]:
          - generic [ref=e108]: SN
          - generic [ref=e110]: Sundar N
          - img [ref=e111]
    - main [ref=e113]:
      - generic [ref=e114]:
        - img [ref=e115]
        - generic [ref=e119]:
          - text: "AI is temporarily unavailable: the configured AI provider account is out of credit or billing-blocked. AI features are paused and falling back to keyword matching until it's topped up."
          - link "Update billing / API key in Settings" [ref=e120] [cursor=pointer]:
            - /url: /settings
        - button "Dismiss" [ref=e121] [cursor=pointer]
      - generic [ref=e122]:
        - generic [ref=e123]:
          - generic [ref=e124]:
            - generic [ref=e125]: /jobs
            - generic [ref=e126]:
              - text: Open jobs
              - img [ref=e127]
            - generic [ref=e129]: Loading… 3.1s
          - generic [ref=e130]:
            - button "Import CSV" [ref=e131] [cursor=pointer]:
              - img [ref=e132]
              - text: Import CSV
            - button "New requisition" [ref=e136] [cursor=pointer]:
              - img [ref=e137]
              - text: New requisition
        - generic [ref=e140]:
          - generic [ref=e141]: SOURCE
          - combobox "SOURCE" [ref=e142]:
            - option "All sources (2,232)" [selected]
            - option "Ceipal (2232)"
        - generic [ref=e143]:
          - generic [ref=e144]:
            - generic [ref=e145]: Active reqs
            - generic [ref=e146]: 2,231
          - generic [ref=e147]:
            - generic [ref=e148]: Avg time-to-fill
            - generic [ref=e149]: —
          - generic [ref=e150]:
            - generic [ref=e151]: Pipeline value
            - generic [ref=e152]: —
        - generic [ref=e154]:
          - img [ref=e155]
          - text: Loading jobs… 3.1s
          - generic [ref=e157]: Large tenants can take several seconds — the full set is fetched in one request today.
```

# Test source

```ts
  1   | // ============================================================
  2   | // NxtHire.ai – Open Jobs Module Test Suite
  3   | // Tool: Playwright  |  Target: nxthire.ai/jobs
  4   | // Version: 1.0  |  Date: June 2026
  5   | // Tester: QA — North Star Group Inc.
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
  31  |   await page.waitForTimeout(3000);
  32  | }
  33  | 
  34  | // ─────────────────────────────────────────────────────────────
  35  | // TC-12-A — Page Load
  36  | // ─────────────────────────────────────────────────────────────
  37  | test.describe('TC-12-A Page Load', () => {
  38  | 
  39  |   test('Open Jobs page loads with requisitions', async ({ page }) => {
  40  |     await login(page);
  41  |     await goToJobs(page);
  42  |     const countText = await page.locator('text=/\\d+ of \\d+ active requisitions loaded/').first().innerText().catch(() => '');
  43  |     console.log(`Requisitions count: ${countText}`);
  44  |     await expect(page.locator('text=/active requisitions loaded/')).toBeVisible({ timeout: 10000 });
  45  |     console.log('PASS: Open Jobs page loaded with requisitions');
  46  |   });
  47  | 
  48  |   test('Page title shows Open jobs', async ({ page }) => {
  49  |     await login(page);
  50  |     await goToJobs(page);
  51  |     await expect(page.locator('h1, text=Open jobs').first()).toBeVisible();
  52  |     console.log('PASS: Page title visible');
  53  |   });
  54  | 
  55  |   test('Import CSV and New requisition buttons present', async ({ page }) => {
  56  |     await login(page);
  57  |     await goToJobs(page);
  58  |     await expect(page.locator('button:has-text("Import CSV"), a:has-text("Import CSV")').first()).toBeVisible();
  59  |     await expect(page.locator('button:has-text("New requisition"), a:has-text("New requisition")').first()).toBeVisible();
  60  |     console.log('PASS: Import CSV and New requisition buttons present');
  61  |   });
  62  | 
  63  |   test('Stats cards visible — Active reqs, Avg time-to-fill, Pipeline value', async ({ page }) => {
  64  |     await login(page);
  65  |     await goToJobs(page);
  66  |     const body = await page.locator('body').innerText();
  67  |     const hasActiveReqs    = body.includes('Active reqs') || body.includes('active reqs');
  68  |     const hasTimeToFill    = body.includes('time-to-fill') || body.includes('Time-to-fill');
  69  |     const hasPipelineValue = body.includes('Pipeline value') || body.includes('pipeline value');
  70  |     console.log(`Active reqs: ${hasActiveReqs} | Time-to-fill: ${hasTimeToFill} | Pipeline value: ${hasPipelineValue}`);
  71  |     expect(hasActiveReqs).toBe(true);
  72  |     console.log('PASS: Stats cards visible');
  73  |   });
  74  | 
  75  |   test('Source filter dropdown present', async ({ page }) => {
  76  |     await login(page);
  77  |     await goToJobs(page);
  78  |     const sourceFilter = page.locator('text=/All sources/').first();
  79  |     const visible = await sourceFilter.isVisible().catch(() => false);
  80  |     console.log(`Source filter visible: ${visible}`);
> 81  |     expect(visible).toBe(true);
      |                     ^ Error: expect(received).toBe(expected) // Object.is equality
  82  |     console.log('PASS: Source filter present');
  83  |   });
  84  | 
  85  | });
  86  | 
  87  | // ─────────────────────────────────────────────────────────────
  88  | // TC-12-B — Source Filter
  89  | // ─────────────────────────────────────────────────────────────
  90  | test.describe('TC-12-B Source Filter', () => {
  91  | 
  92  |   test.beforeEach(async ({ page }) => {
  93  |     await login(page);
  94  |     await goToJobs(page);
  95  |   });
  96  | 
  97  |   test('Default shows All sources with total count', async ({ page }) => {
  98  |     const sourceText = await page.locator('text=/All sources/').first().innerText().catch(() => '');
  99  |     console.log(`Default source filter: ${sourceText}`);
  100 |     expect(sourceText).toContain('All sources');
  101 |     console.log('PASS: Default source filter shows All sources');
  102 |   });
  103 | 
  104 |   test('Source filter has Ceipal option', async ({ page }) => {
  105 |     const sourceDropdown = page.locator('text=/All sources/').first();
  106 |     await sourceDropdown.click();
  107 |     await page.waitForTimeout(1000);
  108 |     const hasCeipal = await page.locator('text=Ceipal').first().isVisible().catch(() => false);
  109 |     console.log(`Ceipal option visible: ${hasCeipal}`);
  110 |     expect(hasCeipal).toBe(true);
  111 |     console.log('PASS: Ceipal option in source filter');
  112 |   });
  113 | 
  114 |   test('Selecting Ceipal filters jobs correctly', async ({ page }) => {
  115 |     const sourceDropdown = page.locator('text=/All sources/').first();
  116 |     await sourceDropdown.click();
  117 |     await page.waitForTimeout(1000);
  118 |     const ceipalOption = page.locator('text=Ceipal').first();
  119 |     if (await ceipalOption.isVisible()) {
  120 |       await ceipalOption.click();
  121 |       await page.waitForTimeout(3000);
  122 |       const countText = await page.locator('text=/\\d+ of \\d+ active requisitions loaded/').first().innerText().catch(() => '');
  123 |       console.log(`After Ceipal filter: ${countText}`);
  124 |       console.log('PASS: Ceipal filter applied');
  125 |     }
  126 |   });
  127 | 
  128 | });
  129 | 
  130 | // ─────────────────────────────────────────────────────────────
  131 | // TC-12-C — Job Card Details
  132 | // ─────────────────────────────────────────────────────────────
  133 | test.describe('TC-12-C Job Card Details', () => {
  134 | 
  135 |   test.beforeEach(async ({ page }) => {
  136 |     await login(page);
  137 |     await goToJobs(page);
  138 |   });
  139 | 
  140 |   test('Job card shows title and company location', async ({ page }) => {
  141 |     const body = await page.locator('body').innerText();
  142 |     const hasNorthStar = body.includes('North Star');
  143 |     const hasLocation  = body.includes('Georgia') || body.includes('Texas') || body.includes('Remote');
  144 |     console.log(`North Star visible: ${hasNorthStar} | Location visible: ${hasLocation}`);
  145 |     expect(hasNorthStar).toBe(true);
  146 |     console.log('PASS: Job card shows company and location');
  147 |   });
  148 | 
  149 |   test('Job card shows skills tags', async ({ page }) => {
  150 |     const skillTags = page.locator('[class*="tag"], [class*="badge"], [class*="skill"]').first();
  151 |     const visible = await skillTags.isVisible().catch(() => false);
  152 |     console.log(`Skills tags visible: ${visible}`);
  153 |     console.log('NOTE: Skills tags like Data Pipelines, EWM confirmed visually');
  154 |   });
  155 | 
  156 |   test('Job card shows Posted date', async ({ page }) => {
  157 |     const body = await page.locator('body').innerText();
  158 |     const hasPosted = body.includes('ago') || body.includes('Posted');
  159 |     console.log(`Posted date visible: ${hasPosted}`);
  160 |     expect(hasPosted).toBe(true);
  161 |     console.log('PASS: Posted date visible on job cards');
  162 |   });
  163 | 
  164 |   test('Job card shows Candidates and Applications count', async ({ page }) => {
  165 |     const body = await page.locator('body').innerText();
  166 |     const hasCandidates   = body.includes('CANDIDATES') || body.includes('Candidates');
  167 |     const hasApplications = body.includes('APPLICATIONS') || body.includes('Applications');
  168 |     console.log(`Candidates: ${hasCandidates} | Applications: ${hasApplications}`);
  169 |     expect(hasCandidates).toBe(true);
  170 |     console.log('PASS: Candidates and Applications counts visible');
  171 |   });
  172 | 
  173 |   test('Job card shows Top match percentage', async ({ page }) => {
  174 |     const body = await page.locator('body').innerText();
  175 |     const hasTopMatch = body.includes('TOP MATCH') || body.includes('Top match') || body.includes('%');
  176 |     console.log(`Top match % visible: ${hasTopMatch}`);
  177 |     expect(hasTopMatch).toBe(true);
  178 |     console.log('PASS: Top match percentage visible');
  179 |   });
  180 | 
  181 |   test('View matches button present on job cards', async ({ page }) => {
```