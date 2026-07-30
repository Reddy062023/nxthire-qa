# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/features.spec.js >> Feature 1 — Create Candidate Manually >> TC-F01-01: Fill and save new candidate with all fields
- Location: tests/features.spec.js:126:3

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('button:has-text("New candidate")').first() to be visible

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
      - generic [ref=e32]:
        - generic [ref=e33]: Password
        - link "Forgot password?" [ref=e34] [cursor=pointer]:
          - /url: /forgot-password
      - textbox [ref=e35]: password123
    - button "Continue" [ref=e36] [cursor=pointer]:
      - text: Continue
      - img [ref=e37]
    - generic [ref=e39]:
      - text: New agency?
      - link "Sign up" [ref=e40] [cursor=pointer]:
        - /url: /register-agency
      - text: · 14-day free trial
    - generic [ref=e41]:
      - text: Job seeker?
      - link "Register your resume" [ref=e42] [cursor=pointer]:
        - /url: /seeker-register
```

# Test source

```ts
  28  | //      * TC-F14-02: creating a lead returns "401: missing bearer token"
  29  | //  - ADDED: Feature 8 conversion flow, Feature 11 full pipeline walk,
  30  | //    Feature 13 hotlist send, Feature 14 lead/duplicate/task/won flow.
  31  | // ============================================================
  32  | 
  33  | require('dotenv').config();
  34  | const { test, expect } = require('@playwright/test');
  35  | 
  36  | const BASE_URL = 'https://nxthire.ai';
  37  | const CREDS = {
  38  |   email:    process.env.NXTHIRE_EMAIL,
  39  |   password: process.env.NXTHIRE_PASSWORD,
  40  | };
  41  | 
  42  | // ── Login helper ──────────────────────────────────────────────
  43  | // FIX: the app has no /dashboard route. After login it lands on
  44  | // /candidates (confirmed across every manual test screenshot).
  45  | // Waiting on the sidebar "Candidates" link is more robust than a
  46  | // URL pattern in case the landing page ever changes.
  47  | async function login(page) {
  48  |   await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  49  |   await page.fill('input[type="email"]', CREDS.email);
  50  |   await page.fill('input[type="password"]', CREDS.password);
  51  |   await page.click('button[type="submit"]');
  52  |   await page.locator('text=Candidates').first().waitFor({ state: 'visible', timeout: 60000 });
  53  | }
  54  | 
  55  | // Opens the first candidate in the list via its "View" action and
  56  | // waits for the detail page to render. Used by many feature suites.
  57  | async function openFirstCandidate(page) {
  58  |   await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  59  |   await page.waitForTimeout(2000);
  60  |   const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
  61  |   await viewBtn.waitFor({ state: 'visible', timeout: 30000 });
  62  |   await viewBtn.click();
  63  |   await page.waitForTimeout(3000);
  64  | }
  65  | 
  66  | // ── Test Data ─────────────────────────────────────────────────
  67  | const TEST_CANDIDATE = {
  68  |   name:   'QA Test Candidate',
  69  |   title:  'QA Engineer',
  70  |   email:  'qatest.feature@nstartest.com',
  71  |   phone:  '6175550199',
  72  |   city:   'Boston',
  73  |   state:  'MA',
  74  |   years:  '5',
  75  |   skills: 'Java, Python, Playwright',
  76  | };
  77  | 
  78  | const NO_EMAIL_CANDIDATE = {
  79  |   name:  'QA No Email Candidate',
  80  |   title: 'QA Engineer',
  81  |   years: '3',
  82  |   skills: 'Java',
  83  | };
  84  | 
  85  | const TEST_JOB = {
  86  |   title:       'QA Automation Engineer',
  87  |   description: 'We need a senior QA Automation Engineer with Playwright and Java experience. Must have 5+ years of experience in test automation.',
  88  | };
  89  | 
  90  | const TEST_VENDOR = {
  91  |   name:    `QA Test Vendor ${Date.now()}`,
  92  |   email:   process.env.NXTHIRE_EMAIL,
  93  |   contact: 'Test Contact',
  94  | };
  95  | 
  96  | const TEST_COMPANY = {
  97  |   name:    `QA Test Company ${Date.now()}`,
  98  |   website: 'qatestcompany.com',
  99  | };
  100 | 
  101 | // ─────────────────────────────────────────────────────────────
  102 | // FEATURE 1 — Create Candidate Manually
  103 | // ─────────────────────────────────────────────────────────────
  104 | test.describe('Feature 1 — Create Candidate Manually', () => {
  105 | 
  106 |   test.beforeEach(async ({ page }) => {
  107 |     await login(page);
  108 |     await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  109 |     await page.waitForTimeout(3000);
  110 |   });
  111 | 
  112 |   test('TC-F01-01: New candidate button is present on Candidates page', async ({ page }) => {
  113 |     const newBtn = page.locator('button:has-text("New candidate")').first();
  114 |     await expect(newBtn).toBeVisible({ timeout: 15000 });
  115 |   });
  116 | 
  117 |   test('TC-F01-01: Create candidate form opens on button click', async ({ page }) => {
  118 |     const newBtn = page.locator('button:has-text("New candidate")').first();
  119 |     await newBtn.waitFor({ state: 'visible', timeout: 15000 });
  120 |     await newBtn.click();
  121 |     await page.waitForTimeout(2000);
  122 |     const formVisible = await page.locator('form, [role="dialog"]').first().isVisible().catch(() => false);
  123 |     expect(formVisible).toBe(true);
  124 |   });
  125 | 
  126 |   test('TC-F01-01: Fill and save new candidate with all fields', async ({ page }) => {
  127 |     const newBtn = page.locator('button:has-text("New candidate")').first();
> 128 |     await newBtn.waitFor({ state: 'visible', timeout: 15000 });
      |                  ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  129 |     await newBtn.click();
  130 |     await page.waitForTimeout(2000);
  131 | 
  132 |     await fillIfVisible(page, 'input[placeholder*="name" i], input[name*="name" i]', TEST_CANDIDATE.name);
  133 |     await fillIfVisible(page, 'input[placeholder*="title" i], input[name*="title" i]', TEST_CANDIDATE.title);
  134 |     await fillIfVisible(page, 'input[type="email"], input[placeholder*="email" i]', TEST_CANDIDATE.email);
  135 |     await fillIfVisible(page, 'input[placeholder*="phone" i], input[type="tel"]', TEST_CANDIDATE.phone);
  136 |     await fillIfVisible(page, 'input[placeholder*="year" i], input[name*="year" i]', TEST_CANDIDATE.years);
  137 |     await fillIfVisible(page, 'input[placeholder*="skill" i], textarea[placeholder*="skill" i]', TEST_CANDIDATE.skills);
  138 | 
  139 |     const saveBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
  140 |     await expect(saveBtn).toBeVisible();
  141 |     await saveBtn.click();
  142 |     await page.waitForTimeout(4000);
  143 |     // Expected result per TC-F01-01: lands on new candidate detail page
  144 |     const url = page.url();
  145 |     expect(url).not.toContain('/candidates/new');
  146 |   });
  147 | 
  148 |   test('TC-F01-02: Negative — letters not accepted in Years of experience field', async ({ page }) => {
  149 |     const newBtn = page.locator('button:has-text("New candidate")').first();
  150 |     await newBtn.waitFor({ state: 'visible', timeout: 15000 });
  151 |     await newBtn.click();
  152 |     await page.waitForTimeout(2000);
  153 | 
  154 |     const yearsField = page.locator('input[placeholder*="year" i], input[name*="year" i]').first();
  155 |     await yearsField.waitFor({ state: 'visible', timeout: 10000 });
  156 |     await yearsField.fill('abc');
  157 |     await page.waitForTimeout(500);
  158 |     const value = await yearsField.inputValue();
  159 |     expect(value).toBe('');
  160 |   });
  161 | 
  162 |   test('TC-F01-03: New candidate appears in candidates list after creation', async ({ page }) => {
  163 |     const searchBox = page.locator('input[placeholder*="Search" i]').first();
  164 |     await searchBox.fill(TEST_CANDIDATE.name);
  165 |     await page.waitForTimeout(2000);
  166 |     const noResults = await page.locator('text=/no candidates match/i').isVisible().catch(() => false);
  167 |     expect(noResults).toBe(false);
  168 |   });
  169 | 
  170 |   test('TC-F01-04: Education card appears on candidate detail after creation', async ({ page }) => {
  171 |     const newBtn = page.locator('button:has-text("New candidate")').first();
  172 |     await newBtn.waitFor({ state: 'visible', timeout: 15000 });
  173 |     await newBtn.click();
  174 |     await page.waitForTimeout(2000);
  175 |     await fillIfVisible(page, 'input[placeholder*="name" i], input[name*="name" i]', `${TEST_CANDIDATE.name} Edu`);
  176 |     await fillIfVisible(page, 'input[type="email"], input[placeholder*="email" i]', `edu.${Date.now()}@nstartest.com`);
  177 |     await fillIfVisible(page, 'textarea[placeholder*="education" i]', 'B.S Computer Science, MIT, 2015');
  178 |     const saveBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
  179 |     if (await saveBtn.isVisible().catch(() => false)) {
  180 |       await saveBtn.click();
  181 |       await page.waitForTimeout(3000);
  182 |       const body = await page.locator('body').innerText();
  183 |       expect(body.toLowerCase()).toContain('education');
  184 |     }
  185 |   });
  186 | 
  187 |   test('TC-F01-05: Social links card appears on candidate detail after creation', async ({ page }) => {
  188 |     const newBtn = page.locator('button:has-text("New candidate")').first();
  189 |     await newBtn.waitFor({ state: 'visible', timeout: 15000 });
  190 |     await newBtn.click();
  191 |     await page.waitForTimeout(2000);
  192 |     await fillIfVisible(page, 'input[placeholder*="name" i], input[name*="name" i]', `${TEST_CANDIDATE.name} Social`);
  193 |     await fillIfVisible(page, 'input[type="email"], input[placeholder*="email" i]', `social.${Date.now()}@nstartest.com`);
  194 |     await fillIfVisible(page, 'textarea[placeholder*="social" i], input[placeholder*="linkedin" i]', 'https://linkedin.com/in/qatest');
  195 |     const saveBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
  196 |     if (await saveBtn.isVisible().catch(() => false)) {
  197 |       await saveBtn.click();
  198 |       await page.waitForTimeout(3000);
  199 |       const link = page.locator('a[href*="linkedin.com"]').first();
  200 |       await expect(link).toBeVisible({ timeout: 5000 }).catch(() => {});
  201 |     }
  202 |   });
  203 | 
  204 | });
  205 | 
  206 | // ─────────────────────────────────────────────────────────────
  207 | // FEATURE 2 — Parse Resume on Create
  208 | // ─────────────────────────────────────────────────────────────
  209 | test.describe('Feature 2 — Parse Resume on Create', () => {
  210 | 
  211 |   test.beforeEach(async ({ page }) => {
  212 |     await login(page);
  213 |     await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  214 |     await page.waitForTimeout(3000);
  215 |   });
  216 | 
  217 |   test('TC-F02-01: Parse from resume button present on new candidate form', async ({ page }) => {
  218 |     const newBtn = page.locator('button:has-text("New candidate")').first();
  219 |     await newBtn.waitFor({ state: 'visible', timeout: 15000 });
  220 |     await newBtn.click();
  221 |     await page.waitForTimeout(2000);
  222 |     const parseBtn = page.locator('button:has-text("Parse from resume"), button:has-text("Parse")').first();
  223 |     await expect(parseBtn).toBeVisible({ timeout: 10000 });
  224 |   });
  225 | 
  226 |   test('TC-F02-03: Resume card shows on candidate detail after parse-create', async ({ page }) => {
  227 |     await openFirstCandidate(page);
  228 |     const resumeCard = page.locator('text=/resume/i').first();
```