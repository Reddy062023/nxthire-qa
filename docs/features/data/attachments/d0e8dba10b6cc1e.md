# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feature14.spec.js >> Feature 14 — Sales CRM (standalone) >> TC-F14-04: Log call, email, task on a lead
- Location: tests/feature14.spec.js:247:3

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByText('Sales CRM', { exact: true }).first() to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - img "NxtHire" [ref=e7]
      - generic [ref=e12]: NxtHire.ai
    - generic [ref=e13]:
      - generic [ref=e14]: Recruiting on autopilot, with the world's best LLM.
      - generic [ref=e15]: Source candidates across LinkedIn, Indeed, Monster and your private resume DB. Apply to matching jobs in one click.
    - generic [ref=e16]: v0.4.2 · trusted by 240+ agencies
  - generic [ref=e18]:
    - generic [ref=e19]: Welcome back
    - generic [ref=e20]: Sign in to your agency workspace.
    - generic [ref=e21]:
      - button "Recruiter" [ref=e22] [cursor=pointer]:
        - img [ref=e23]
        - text: Recruiter
      - button "Job seeker" [ref=e26] [cursor=pointer]:
        - img [ref=e27]
        - text: Job seeker
    - generic [ref=e30]:
      - generic [ref=e31]: Work email
      - textbox [ref=e32]: vish@premiertalent.com
    - generic [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e35]: Password
        - link "Forgot password?" [ref=e36] [cursor=pointer]:
          - /url: /forgot-password
      - textbox [ref=e37]: password123
    - button "Continue" [ref=e38] [cursor=pointer]:
      - text: Continue
      - img [ref=e39]
    - generic [ref=e41]:
      - text: New agency?
      - link "Sign up" [ref=e42] [cursor=pointer]:
        - /url: /register-agency
      - text: · 14-day free trial
    - generic [ref=e43]:
      - text: Job seeker?
      - link "Register your resume" [ref=e44] [cursor=pointer]:
        - /url: /seeker-register
```

# Test source

```ts
  1   | // ============================================================
  2   | // Feature 14 — Sales CRM (standalone) — FINAL
  3   | //   TC-F14-01: Add company with all fields + 2 contacts
  4   | //   TC-F14-02: New lead linked to company
  5   | //   TC-F14-03: Duplicate lead badge appears for matching contact
  6   | //              email — CONFIRMED FIXED Aug 5, flipped from
  7   | //              fails-by-design to an expected PASS. Also fixed a
  8   | //              bug in the check itself: the real badge text is
  9   | //              "dup", not "duplicate" (confirmed via screenshots),
  10  | //              and the check is now self-contained (creates both
  11  | //              leads fresh) rather than relying on old accumulated
  12  | //              test data.
  13  | //   TC-F14-04: Log call, email, task on lead
  14  | //   TC-F14-05: Tick task done — strikethrough
  15  | //   TC-F14-06: Change lead status to won — KPI updates
  16  | // ============================================================
  17  | 
  18  | require('dotenv').config();
  19  | const { test, expect } = require('@playwright/test');
  20  | 
  21  | const BASE_URL = 'https://nxthire.ai';
  22  | 
  23  | test.describe.configure({ retries: 0 });
  24  | 
  25  | async function goToCrm(page) {
  26  |   await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  27  |   const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  28  |   if (!loggedIn) {
  29  |     await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  30  |     await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
  31  |     await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
  32  |     await page.click('button[type="submit"]');
  33  |     await page.waitForTimeout(3000);
  34  |   }
  35  | 
  36  |   await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  37  |   await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  38  |   await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  39  |   await page.waitForTimeout(1000);
  40  | 
  41  |   const salesCrmLink = page.getByText('Sales CRM', { exact: true }).first();
> 42  |   await salesCrmLink.waitFor({ state: 'visible', timeout: 15000 });
      |                      ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  43  |   await salesCrmLink.click();
  44  |   await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  45  |   await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  46  |   await page.waitForTimeout(2000);
  47  | }
  48  | 
  49  | async function openActivityModalViaPhoneIcon(page) {
  50  |   let phoneIcon = page.locator('button:has(svg.lucide-phone)').first();
  51  |   let visible = await phoneIcon.isVisible({ timeout: 15000 }).catch(() => false);
  52  | 
  53  |   if (!visible) {
  54  |     await page.waitForTimeout(3000);
  55  |     visible = await phoneIcon.isVisible({ timeout: 15000 }).catch(() => false);
  56  |   }
  57  | 
  58  |   if (!visible) {
  59  |     const buttons = await page.locator('button').all();
  60  |     for (const btn of buttons) {
  61  |       const svgClass = await btn.locator('svg').first().getAttribute('class').catch(() => '');
  62  |       if (svgClass && svgClass.toLowerCase().includes('phone')) {
  63  |         phoneIcon = btn;
  64  |         visible = true;
  65  |         break;
  66  |       }
  67  |     }
  68  |   }
  69  | 
  70  |   if (!visible) {
  71  |     throw new Error('[openActivityModalViaPhoneIcon] Could not find a phone icon button on the page.');
  72  |   }
  73  | 
  74  |   await phoneIcon.click();
  75  |   await page.waitForTimeout(1500);
  76  | }
  77  | 
  78  | async function getActivityTypeSelect(page) {
  79  |   const selects = page.locator('select');
  80  |   const selectCount = await selects.count();
  81  |   for (let i = 0; i < selectCount; i++) {
  82  |     const options = await selects.nth(i).locator('option').allInnerTexts().catch(() => []);
  83  |     if (options.includes('Call') && options.includes('Task')) {
  84  |       return selects.nth(i);
  85  |     }
  86  |   }
  87  |   throw new Error('[getActivityTypeSelect] Could not find the Activity type select (Call/Email/Task/Note/Meeting).');
  88  | }
  89  | 
  90  | test.describe('Feature 14 — Sales CRM (standalone)', () => {
  91  | 
  92  |   test('TC-F14-01: Add company with all fields and 2 contacts', async ({ page }) => {
  93  |     test.setTimeout(60000);
  94  |     const uniqueName = `QA Test Company ${Date.now()}`;
  95  | 
  96  |     await goToCrm(page);
  97  | 
  98  |     const addCompanyBtn = page.getByRole('button', { name: 'Add company', exact: true }).first();
  99  |     await addCompanyBtn.waitFor({ state: 'visible', timeout: 15000 });
  100 |     await addCompanyBtn.click();
  101 |     await page.waitForTimeout(1500);
  102 | 
  103 |     const modal = page.getByRole('button', { name: 'Add company', exact: true }).last().locator('xpath=ancestor::div[.//input][1]');
  104 | 
  105 |     const nameField = modal.locator('input').first();
  106 |     await nameField.fill(uniqueName);
  107 | 
  108 |     const industryField = modal.locator('input').nth(1);
  109 |     await industryField.fill('Technology');
  110 | 
  111 |     const websiteField = modal.locator('input').nth(3);
  112 |     await websiteField.fill('qatestco.com');
  113 | 
  114 |     const contactInputs = modal.locator('input');
  115 |     const totalInputs = await contactInputs.count();
  116 |     console.log('[TC-F14-01] Total input fields in Add company modal:', totalInputs);
  117 | 
  118 |     await contactInputs.nth(4).fill('QA Contact One');
  119 |     await contactInputs.nth(5).fill('CEO');
  120 |     await contactInputs.nth(6).fill(`contact1${Date.now()}@qatestco.com`);
  121 |     await contactInputs.nth(7).fill('555-000-0001');
  122 | 
  123 |     const addContactBtn = page.getByText('Add contact', { exact: true }).first();
  124 |     await addContactBtn.click();
  125 |     await page.waitForTimeout(1000);
  126 | 
  127 |     const contactInputs2 = modal.locator('input');
  128 |     const totalAfter = await contactInputs2.count();
  129 |     console.log('[TC-F14-01] Total input fields after Add contact:', totalAfter);
  130 |     if (totalAfter >= 12) {
  131 |       await contactInputs2.nth(8).fill('QA Contact Two');
  132 |       await contactInputs2.nth(9).fill('CFO');
  133 |       await contactInputs2.nth(10).fill(`contact2${Date.now()}@qatestco.com`);
  134 |       await contactInputs2.nth(11).fill('555-000-0002');
  135 |     }
  136 | 
  137 |     const submitBtn = page.getByRole('button', { name: 'Add company', exact: true }).last();
  138 |     await submitBtn.click();
  139 |     await page.waitForTimeout(3000);
  140 | 
  141 |     const companiesTab = page.getByText(/Companies \(\d+\)/, { exact: false }).first();
  142 |     await companiesTab.click();
```