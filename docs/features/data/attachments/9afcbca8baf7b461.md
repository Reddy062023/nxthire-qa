# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feature9.spec.js >> Feature 9 — Interviews and Placements (standalone) >> TC-F09-02: Edit interview outcome to "passed"
- Location: tests/feature9.spec.js:97:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Log interview', exact: true }).first()

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
  3   | //   TC-F09-01: Log interview — KPI ticks up
  4   | //   TC-F09-02: Edit interview outcome to "passed" (pencil icon)
  5   | //   TC-F09-03: Log placement — Placements this week ticks up
  6   | //   TC-F09-04: Analytics reflects correct Interviews arranged and
  7   | //              Placements counts
  8   | //
  9   | // TC-F09-02's pencil targeting: naive "ancestor contains target text"
  10  | // gave a false positive (same class of bug fixed in Feature 14's
  11  | // checkbox targeting) — a broad ancestor wrapping the whole table
  12  | // contains every candidate name, so the wrong pencil button got
  13  | // clicked. Fixed using the same proven pattern: find the SMALLEST
  14  | // ancestor containing our unique text that has EXACTLY ONE pencil
  15  | // icon inside it — that isolates the specific row.
  16  | //
  17  | // Log interview modal fields: Candidate name, Interview date, Client,
  18  | // Client manager, Bill rate (5 inputs), Outcome select (scheduled/
  19  | // completed/passed/failed/no show/cancelled), Notes (textarea).
  20  | // Log placement modal fields: Candidate name, Sub-vendor, Interview
  21  | // date, Start date, Client, Client manager, Bill rate (7 inputs),
  22  | // Outcome select (confirmed/started/completed/backed out/terminated),
  23  | // Notes (textarea).
  24  | // ============================================================
  25  | 
  26  | require('dotenv').config();
  27  | const { test, expect } = require('@playwright/test');
  28  | 
  29  | const BASE_URL = 'https://nxthire.ai';
  30  | 
  31  | test.describe.configure({ retries: 0 });
  32  | 
  33  | async function goToInterviews(page) {
  34  |   await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  35  |   const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  36  |   if (!loggedIn) {
  37  |     await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  38  |     await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
  39  |     await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
  40  |     await page.click('button[type="submit"]');
  41  |     await page.waitForTimeout(3000);
  42  |   }
  43  | 
  44  |   await page.goto(`${BASE_URL}/interviews`, { timeout: 60000 });
  45  |   await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  46  |   await page.locator('button:has-text("Dismiss")').first().click({ timeout: 3000 }).catch(() => {});
  47  |   await page.waitForTimeout(2000);
  48  | }
  49  | 
  50  | test.describe('Feature 9 — Interviews and Placements (standalone)', () => {
  51  | 
  52  |   test('TC-F09-01: Log interview — KPI ticks up', async ({ page }) => {
  53  |     test.setTimeout(60000);
  54  | 
  55  |     await goToInterviews(page);
  56  | 
  57  |     const bodyBefore = await page.locator('body').innerText();
  58  |     const beforeMatch = bodyBefore.match(/INTERVIEWS THIS WEEK\s*\n?\s*(\d+)/i);
  59  |     const countBefore = beforeMatch ? parseInt(beforeMatch[1], 10) : null;
  60  |     console.log('[TC-F09-01] Interviews this week before:', countBefore);
  61  | 
  62  |     const logBtn = page.getByRole('button', { name: 'Log interview', exact: true }).first();
  63  |     await logBtn.click();
  64  |     await page.waitForTimeout(2000);
  65  | 
  66  |     const submitBtn = page.getByRole('button', { name: 'Log interview', exact: true }).last();
  67  |     const modal = submitBtn.locator('xpath=ancestor::div[.//input][1]');
  68  | 
  69  |     const inputs = modal.locator('input');
  70  |     const uniqueCandidateName = `QA Test Candidate ${Date.now()}`;
  71  |     await inputs.nth(0).fill(uniqueCandidateName);
  72  |     await inputs.nth(1).fill(new Date().toISOString().slice(0, 10));
  73  |     await inputs.nth(2).fill('QA Test Client');
  74  |     await inputs.nth(3).fill('QA Manager');
  75  |     await inputs.nth(4).fill('$100/hr');
  76  | 
  77  |     const outcomeSelect = modal.locator('select').first();
  78  |     await outcomeSelect.selectOption({ label: 'scheduled' });
  79  | 
  80  |     await submitBtn.click();
  81  |     await page.waitForTimeout(3000);
  82  | 
  83  |     const bodyAfter = await page.locator('body').innerText();
  84  |     const afterMatch = bodyAfter.match(/INTERVIEWS THIS WEEK\s*\n?\s*(\d+)/i);
  85  |     const countAfter = afterMatch ? parseInt(afterMatch[1], 10) : null;
  86  |     console.log('[TC-F09-01] Interviews this week after:', countAfter);
  87  | 
  88  |     const candidateFound = bodyAfter.includes(uniqueCandidateName);
  89  |     console.log('[TC-F09-01] New interview entry found:', candidateFound);
  90  | 
  91  |     expect(candidateFound).toBeTruthy();
  92  |     if (countBefore !== null && countAfter !== null) {
  93  |       expect(countAfter).toBeGreaterThan(countBefore);
  94  |     }
  95  |   });
  96  | 
  97  |   test('TC-F09-02: Edit interview outcome to "passed"', async ({ page }) => {
  98  |     test.setTimeout(60000);
  99  | 
  100 |     await goToInterviews(page);
  101 | 
  102 |     const logBtn = page.getByRole('button', { name: 'Log interview', exact: true }).first();
> 103 |     await logBtn.click();
      |                  ^ Error: locator.click: Test timeout of 60000ms exceeded.
  104 |     await page.waitForTimeout(2000);
  105 | 
  106 |     const submitBtn = page.getByRole('button', { name: 'Log interview', exact: true }).last();
  107 |     const modal = submitBtn.locator('xpath=ancestor::div[.//input][1]');
  108 | 
  109 |     const uniqueCandidateName = `QA Edit Test ${Date.now()}`;
  110 |     const inputs = modal.locator('input');
  111 |     await inputs.nth(0).fill(uniqueCandidateName);
  112 |     await inputs.nth(1).fill(new Date().toISOString().slice(0, 10));
  113 |     await inputs.nth(2).fill('QA Test Client');
  114 |     await inputs.nth(3).fill('QA Manager');
  115 |     await inputs.nth(4).fill('$100/hr');
  116 | 
  117 |     const outcomeSelect = modal.locator('select').first();
  118 |     await outcomeSelect.selectOption({ label: 'scheduled' });
  119 | 
  120 |     await submitBtn.click();
  121 |     await page.waitForTimeout(3000);
  122 | 
  123 |     const targetPencilIndex = await page.evaluate((candidateName) => {
  124 |       const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  125 |       let textNode;
  126 |       while ((textNode = walker.nextNode())) {
  127 |         if (textNode.textContent && textNode.textContent.includes(candidateName)) break;
  128 |       }
  129 |       if (!textNode) return -1;
  130 | 
  131 |       let node = textNode.parentElement;
  132 |       for (let d = 0; d < 12 && node; d++) {
  133 |         const pencils = node.querySelectorAll('svg.lucide-pencil');
  134 |         if (pencils.length === 1) {
  135 |           const btn = pencils[0].closest('button');
  136 |           const allPencilButtons = Array.from(document.querySelectorAll('button:has(svg.lucide-pencil)'));
  137 |           return allPencilButtons.indexOf(btn);
  138 |         }
  139 |         node = node.parentElement;
  140 |       }
  141 |       return -1;
  142 |     }, uniqueCandidateName);
  143 | 
  144 |     console.log('[TC-F09-02] Correctly-scoped pencil index:', targetPencilIndex);
  145 | 
  146 |     if (targetPencilIndex === -1) {
  147 |       throw new Error('[TC-F09-02] Could not isolate a single-pencil row for the new interview.');
  148 |     }
  149 | 
  150 |     const targetPencil = page.locator('button:has(svg.lucide-pencil)').nth(targetPencilIndex);
  151 |     await targetPencil.click();
  152 |     await page.waitForTimeout(2000);
  153 | 
  154 |     const modalHeading = page.getByText(`Edit interview — ${uniqueCandidateName}`, { exact: false }).first();
  155 |     const correctModalOpen = await modalHeading.isVisible({ timeout: 5000 }).catch(() => false);
  156 |     console.log('[TC-F09-02] Edit modal opened for the correct candidate:', correctModalOpen);
  157 |     expect(correctModalOpen).toBeTruthy();
  158 | 
  159 |     const editSelects = page.locator('select');
  160 |     const editSelectCount = await editSelects.count();
  161 |     let editOutcomeSelect = null;
  162 |     for (let i = 0; i < editSelectCount; i++) {
  163 |       const opts = await editSelects.nth(i).locator('option').allInnerTexts().catch(() => []);
  164 |       if (opts.includes('scheduled') && opts.includes('passed')) {
  165 |         editOutcomeSelect = editSelects.nth(i);
  166 |         break;
  167 |       }
  168 |     }
  169 | 
  170 |     if (!editOutcomeSelect) {
  171 |       throw new Error('[TC-F09-02] Could not find the Outcome select in the edit modal.');
  172 |     }
  173 | 
  174 |     await editOutcomeSelect.selectOption({ label: 'passed' });
  175 | 
  176 |     const saveBtn = page.getByRole('button', { name: 'Save changes', exact: true }).first();
  177 |     await saveBtn.click();
  178 |     await page.waitForTimeout(3000);
  179 | 
  180 |     const bodyAfter = await page.locator('body').innerText();
  181 |     const rowIndex = bodyAfter.indexOf(uniqueCandidateName);
  182 |     const rowSnippet = rowIndex >= 0 ? bodyAfter.slice(rowIndex, rowIndex + 200) : '';
  183 |     console.log('[TC-F09-02] Row text after edit:', rowSnippet.replace(/[\r\n]+/g, ' ~ '));
  184 | 
  185 |     const outcomeIsPassed = rowSnippet.includes('passed');
  186 |     console.log('[TC-F09-02] Outcome now shows "passed":', outcomeIsPassed);
  187 | 
  188 |     expect(outcomeIsPassed).toBeTruthy();
  189 |   });
  190 | 
  191 |   test('TC-F09-03: Log placement — Placements this week ticks up', async ({ page }) => {
  192 |     test.setTimeout(60000);
  193 | 
  194 |     await goToInterviews(page);
  195 | 
  196 |     const placementsTab = page.getByRole('button', { name: /Placements \(\d+\)/i }).first();
  197 |     await placementsTab.click();
  198 |     await page.waitForTimeout(2000);
  199 | 
  200 |     const bodyBefore = await page.locator('body').innerText();
  201 |     const beforeMatch = bodyBefore.match(/PLACEMENTS THIS WEEK\s*\n?\s*(\d+)/i);
  202 |     const countBefore = beforeMatch ? parseInt(beforeMatch[1], 10) : null;
  203 |     console.log('[TC-F09-03] Placements this week before:', countBefore);
```