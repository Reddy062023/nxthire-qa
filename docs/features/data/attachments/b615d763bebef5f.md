# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feature3.spec.js >> Feature 3 — Edit Candidate (standalone) >> TC-F03-03: Edit candidate — add skill
- Location: tests/feature3.spec.js:108:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('button[aria-label*="edit" i], button:has-text("Edit")').first()

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
      - generic [ref=e9]: AI Agent
      - link "AI Agent NEW" [ref=e10] [cursor=pointer]:
        - /url: /dashboard
        - img [ref=e11]
        - generic [ref=e13]: AI Agent
        - generic [ref=e14]: NEW
      - generic [ref=e15]: Recruit
      - link "Candidates" [ref=e16] [cursor=pointer]:
        - /url: /candidates
        - img [ref=e17]
        - generic [ref=e22]: Candidates
      - link "Open jobs" [ref=e23] [cursor=pointer]:
        - /url: /jobs
        - img [ref=e24]
        - generic [ref=e27]: Open jobs
      - link "Interviews" [ref=e28] [cursor=pointer]:
        - /url: /interviews
        - img [ref=e29]
        - generic [ref=e31]: Interviews
      - generic [ref=e32]: Sales
      - link "Sales CRM" [ref=e33] [cursor=pointer]:
        - /url: /crm
        - img [ref=e34]
        - generic [ref=e38]: Sales CRM
      - link "Requirements" [ref=e39] [cursor=pointer]:
        - /url: /requirements
        - img [ref=e40]
        - generic [ref=e43]: Requirements
      - link "Vendors" [ref=e44] [cursor=pointer]:
        - /url: /vendors
        - img [ref=e45]
        - generic [ref=e49]: Vendors
      - generic [ref=e50]: Configure
      - link "Data sources" [ref=e51] [cursor=pointer]:
        - /url: /sources
        - img [ref=e52]
        - generic [ref=e54]: Data sources
      - link "Monster" [ref=e55] [cursor=pointer]:
        - /url: /connectors/monster
        - img [ref=e56]
        - generic [ref=e62]: Monster
      - link "Indeed" [ref=e63] [cursor=pointer]:
        - /url: /connectors/indeed
        - img [ref=e64]
        - generic [ref=e70]: Indeed
      - link "TheirStack" [ref=e71] [cursor=pointer]:
        - /url: /connectors/theirstack
        - img [ref=e72]
        - generic [ref=e78]: TheirStack
      - link "Ceipal" [ref=e79] [cursor=pointer]:
        - /url: /connectors/ceipal
        - img [ref=e80]
        - generic [ref=e86]: Ceipal
      - link "Templates" [ref=e87] [cursor=pointer]:
        - /url: /templates
        - img [ref=e88]
        - generic [ref=e91]: Templates
      - link "Onboarding" [ref=e92] [cursor=pointer]:
        - /url: /onboarding
        - img [ref=e93]
        - generic [ref=e98]: Onboarding
      - generic [ref=e99]: Insights
      - link "Analytics" [ref=e100] [cursor=pointer]:
        - /url: /analytics
        - img [ref=e101]
        - generic [ref=e103]: Analytics
      - generic [ref=e104]: Manage
      - link "Team" [ref=e105] [cursor=pointer]:
        - /url: /users
        - img [ref=e106]
        - generic [ref=e110]: Team
      - link "Settings" [ref=e111] [cursor=pointer]:
        - /url: /settings
        - img [ref=e112]
        - generic [ref=e115]: Settings
  - generic [ref=e116]:
    - banner [ref=e117]:
      - generic [ref=e118]:
        - button [ref=e119] [cursor=pointer]:
          - img [ref=e120]
        - generic "Sign out" [ref=e125] [cursor=pointer]:
          - generic [ref=e126]: SN
          - generic [ref=e128]: Sundar N
          - img [ref=e129]
    - main [ref=e131]:
      - generic [ref=e132]: Loading…
```

# Test source

```ts
  11  | require('dotenv').config();
  12  | const { test, expect } = require('@playwright/test');
  13  | 
  14  | const BASE_URL = 'https://nxthire.ai';
  15  | 
  16  | // Opens the Candidates page, searches for a specific named candidate,
  17  | // and clicks View — mirrors exactly what a human tester does manually.
  18  | async function openCandidateByName(page, name) {
  19  |   console.log(`[openCandidateByName] Navigating to /candidates...`);
  20  |   await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  21  | 
  22  |   // Wait for the network to actually settle and the "X loaded" count to
  23  |   // appear — large virtualized lists can render placeholder rows first,
  24  |   // then swap in real data a moment later. Clicking too early could hit
  25  |   // a row that's about to be replaced.
  26  |   await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  27  |   await page.locator('text=/\\d+ (of \\d+ )?loaded/i').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  28  |   await page.waitForTimeout(2000);
  29  | 
  30  |   await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  31  | 
  32  |   console.log(`[openCandidateByName] Typing "${name}" into search box...`);
  33  |   const searchBox = page.locator('input[placeholder*="Search" i]').first();
  34  |   await searchBox.click();
  35  |   await searchBox.pressSequentially(name, { delay: 80 });
  36  |   await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  37  |   await page.waitForTimeout(2500);
  38  |   console.log(`[openCandidateByName] Search typed. Checking if results rendered...`);
  39  | 
  40  |   const nameCell = page.getByText(name, { exact: false }).first();
  41  |   await nameCell.waitFor({ state: 'visible', timeout: 15000 });
  42  |   console.log(`[openCandidateByName] Candidate name "${name}" confirmed visible in results.`);
  43  | 
  44  |   // TEMP DEBUG: inspect the structure around the matched name so we can
  45  |   // build a correct row/container locator instead of guessing tr/role=row.
  46  |   const outerHtml = await nameCell.evaluate(el => {
  47  |     let node = el;
  48  |     for (let i = 0; i < 5 && node.parentElement; i++) node = node.parentElement;
  49  |     return node.outerHTML.slice(0, 1500);
  50  |   });
  51  |   console.log('[DEBUG] Ancestor HTML (5 levels up, truncated):', outerHtml);
  52  | 
  53  |   const viewBtn = page.getByRole('button', { name: 'View', exact: true })
  54  |     .or(page.getByRole('link', { name: 'View', exact: true })).first();
  55  |   await viewBtn.waitFor({ state: 'visible', timeout: 15000 });
  56  |   console.log(`[openCandidateByName] Clicking View...`);
  57  |   await viewBtn.click({ force: false, timeout: 10000 });
  58  |   await page.waitForTimeout(3000);
  59  |   console.log(`[openCandidateByName] Done. Current URL: ${page.url()}`);
  60  | }
  61  | 
  62  | test.describe('Feature 3 — Edit Candidate (standalone)', () => {
  63  | 
  64  |   test.beforeEach(async ({ page }) => {
  65  |     // Reuses the shared session file if it already exists from an
  66  |     // earlier auth.setup run today; if not, logs in directly here.
  67  |     await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  68  |     const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  69  |     if (!loggedIn) {
  70  |       await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  71  |       await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
  72  |       await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
  73  |       await page.click('button[type="submit"]');
  74  |       await page.waitForTimeout(3000);
  75  |     }
  76  |   });
  77  | 
  78  |   test('TC-F03-01: Edit button present on candidate detail', async ({ page }) => {
  79  |     await openCandidateByName(page, 'Arjun Mehta');
  80  |     const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit")').first();
  81  |     await expect(editBtn).toBeVisible({ timeout: 15000 });
  82  |   });
  83  | 
  84  |   test('TC-F03-02: Edit candidate — change name', async ({ page }) => {
  85  |     await openCandidateByName(page, 'Arjun Mehta');
  86  |     const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit")').first();
  87  |     await editBtn.click();
  88  |     await page.waitForTimeout(2000);
  89  | 
  90  |     // The Name field has no label/placeholder/name attribute — it's the
  91  |     // first non-checkbox input on the edit form (Title is second, right
  92  |     // after it, confirmed by its "e.g. Senior Java Developer" placeholder).
  93  |     const nameField = page.locator('input:not([type="checkbox"])').first();
  94  |     console.log('[TC-F03-02] Name field current value:', await nameField.inputValue().catch(() => '(could not read)'));
  95  |     await nameField.fill('Arjun Mehta Updated');
  96  | 
  97  |     const saveBtn = page.getByRole('button', { name: 'Save changes', exact: true })
  98  |       .or(page.getByRole('button', { name: 'Save', exact: true }))
  99  |       .or(page.getByRole('button', { name: 'Update', exact: true })).first();
  100 |     await saveBtn.scrollIntoViewIfNeeded();
  101 |     await saveBtn.click();
  102 |     await page.waitForTimeout(3000);
  103 | 
  104 |     const body = await page.locator('body').innerText();
  105 |     expect(body).toContain('Arjun Mehta Updated');
  106 |   });
  107 | 
  108 |   test('TC-F03-03: Edit candidate — add skill', async ({ page }) => {
  109 |     await openCandidateByName(page, 'Arjun Mehta');
  110 |     const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit")').first();
> 111 |     await editBtn.click();
      |                   ^ Error: locator.click: Test timeout of 60000ms exceeded.
  112 |     await page.waitForTimeout(2000);
  113 | 
  114 |     // Skills field has no label/name and its placeholder is an example
  115 |     // string ("Java, Spring, AWS"), not the word "skill" — so match on
  116 |     // that placeholder directly instead of *="skill".
  117 |     const skillsField = page.locator('input[placeholder="Java, Spring, AWS"], textarea[placeholder="Java, Spring, AWS"]').first();
  118 |     console.log('[TC-F03-03] Skills field current value:', await skillsField.inputValue().catch(() => '(could not read)'));
  119 |     const current = await skillsField.inputValue().catch(() => '');
  120 |     if (!current.toLowerCase().includes('playwright')) {
  121 |       await skillsField.fill(`${current}${current ? ', ' : ''}Playwright`);
  122 |     }
  123 | 
  124 |     const saveBtn = page.getByRole('button', { name: 'Save changes', exact: true })
  125 |       .or(page.getByRole('button', { name: 'Save', exact: true }))
  126 |       .or(page.getByRole('button', { name: 'Update', exact: true })).first();
  127 |     await saveBtn.scrollIntoViewIfNeeded();
  128 |     await saveBtn.click();
  129 |     await page.waitForTimeout(3000);
  130 | 
  131 |     const body = await page.locator('body').innerText();
  132 |     expect(body).toContain('Playwright');
  133 |   });
  134 | 
  135 |   test('TC-F03-04: Changes persist after page reload', async ({ page }) => {
  136 |     await openCandidateByName(page, 'Arjun Mehta Updated');
  137 |     await page.reload();
  138 |     await page.waitForTimeout(3000);
  139 | 
  140 |     const body = await page.locator('body').innerText();
  141 |     expect(body).toContain('Playwright');
  142 |   });
  143 | 
  144 | });
```