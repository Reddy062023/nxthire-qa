# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/features.spec.js >> Feature 4 — Word Resume Download >> TC-F04-02: Word resume button present even with no uploaded resume file
- Location: tests/features.spec.js:336:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="Search" i]').first()

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
  240 |     }
  241 |     const newBtn = page.locator('button:has-text("New candidate")').first();
  242 |     await newBtn.waitFor({ state: 'visible', timeout: 15000 });
  243 |     await newBtn.click();
  244 |     await page.waitForTimeout(2000);
  245 |     const parseBtn = page.locator('button:has-text("Parse from resume"), button:has-text("Parse")').first();
  246 |     await parseBtn.click();
  247 |     await page.waitForTimeout(1000);
  248 |     const fileInput = page.locator('input[type="file"]').first();
  249 |     await fileInput.setInputFiles(RESUME_FIXTURE_PATH);
  250 |     await page.waitForTimeout(4000);
  251 |     const nameField = page.locator('input[placeholder*="name" i], input[name*="name" i]').first();
  252 |     const nameValue = await nameField.inputValue().catch(() => '');
  253 |     expect(nameValue).not.toBe('');
  254 |   });
  255 | 
  256 | });
  257 | 
  258 | // ─────────────────────────────────────────────────────────────
  259 | // FEATURE 3 — Edit Candidate
  260 | // ─────────────────────────────────────────────────────────────
  261 | test.describe('Feature 3 — Edit Candidate', () => {
  262 | 
  263 |   test.beforeEach(async ({ page }) => {
  264 |     await login(page);
  265 |   });
  266 | 
  267 |   // FIX v2.0: v1.0 looked for [class*="edit"], which is too broad and can
  268 |   // match unrelated elements. Manual testing confirmed the edit control is
  269 |   // a pencil icon button in the action bar next to Email/Word resume —
  270 |   // matching by icon button position is more reliable than by class name.
  271 |   test('TC-F03-01: Edit (pencil) icon present on candidate detail page', async ({ page }) => {
  272 |     await openFirstCandidate(page);
  273 |     const editBtn = page.locator('button[aria-label*="edit" i], button:has(svg[class*="pencil" i]), button:has-text("Edit")').first();
  274 |     await expect(editBtn).toBeVisible({ timeout: 15000 });
  275 |   });
  276 | 
  277 |   test('TC-F03-02/03: Edit candidate — change name and add skill then save', async ({ page }) => {
  278 |     await openFirstCandidate(page);
  279 |     const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit")').first();
  280 |     await editBtn.waitFor({ state: 'visible', timeout: 15000 });
  281 |     await editBtn.click();
  282 |     await page.waitForTimeout(2000);
  283 | 
  284 |     const skillsField = page.locator('input[placeholder*="skill" i], textarea[placeholder*="skill" i]').first();
  285 |     if (await skillsField.isVisible().catch(() => false)) {
  286 |       const current = await skillsField.inputValue().catch(() => '');
  287 |       await skillsField.fill(`${current}, Playwright`.replace(/^,\s*/, ''));
  288 |     }
  289 | 
  290 |     const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update")').first();
  291 |     await expect(saveBtn).toBeVisible();
  292 |     await saveBtn.click();
  293 |     await page.waitForTimeout(3000);
  294 |     const body = await page.locator('body').innerText();
  295 |     expect(body).toContain('Playwright');
  296 |   });
  297 | 
  298 |   test('TC-F03-04: Changes persist after page reload', async ({ page }) => {
  299 |     await openFirstCandidate(page);
  300 |     await page.reload();
  301 |     await page.waitForTimeout(3000);
  302 |     const body = await page.locator('body').innerText();
  303 |     expect(body).toContain('Playwright');
  304 |   });
  305 | 
  306 | });
  307 | 
  308 | // ─────────────────────────────────────────────────────────────
  309 | // FEATURE 4 — Word Resume Download
  310 | // ─────────────────────────────────────────────────────────────
  311 | test.describe('Feature 4 — Word Resume Download', () => {
  312 | 
  313 |   test.beforeEach(async ({ page }) => {
  314 |     await login(page);
  315 |   });
  316 | 
  317 |   test('TC-F04-01: Word resume button present on candidate detail', async ({ page }) => {
  318 |     await openFirstCandidate(page);
  319 |     const wordBtn = page.locator('button:has-text("Word resume")').first();
  320 |     await expect(wordBtn).toBeVisible({ timeout: 15000 });
  321 |   });
  322 | 
  323 |   test('TC-F04-03: Word resume button triggers a .docx download', async ({ page }) => {
  324 |     await openFirstCandidate(page);
  325 |     const wordBtn = page.locator('button:has-text("Word resume")').first();
  326 |     await expect(wordBtn).toBeVisible({ timeout: 15000 });
  327 |     const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
  328 |     await wordBtn.click();
  329 |     const download = await downloadPromise;
  330 |     expect(download.suggestedFilename()).toMatch(/\.docx$/);
  331 |   });
  332 | 
  333 |   // TC-F04-02: button should stay visible even for a candidate with no
  334 |   // uploaded resume file. Uses the freshly created no-resume candidate
  335 |   // from Feature 5's negative-path test if it exists; otherwise skips.
  336 |   test('TC-F04-02: Word resume button present even with no uploaded resume file', async ({ page }) => {
  337 |     await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  338 |     await page.waitForTimeout(2000);
  339 |     const searchBox = page.locator('input[placeholder*="Search" i]').first();
> 340 |     await searchBox.fill(NO_EMAIL_CANDIDATE.name);
      |                     ^ Error: locator.fill: Test timeout of 60000ms exceeded.
  341 |     await page.waitForTimeout(2000);
  342 |     const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
  343 |     if (!(await viewBtn.isVisible().catch(() => false))) {
  344 |       test.skip(true, 'No candidate without a resume found — run TC-F05-02 first to create one');
  345 |     }
  346 |     await viewBtn.click();
  347 |     await page.waitForTimeout(3000);
  348 |     const wordBtn = page.locator('button:has-text("Word resume")').first();
  349 |     await expect(wordBtn).toBeVisible({ timeout: 10000 });
  350 |   });
  351 | 
  352 | });
  353 | 
  354 | // ─────────────────────────────────────────────────────────────
  355 | // FEATURE 5 — Email Button and Templates
  356 | // ─────────────────────────────────────────────────────────────
  357 | test.describe('Feature 5 — Email Button and Templates', () => {
  358 | 
  359 |   test.beforeEach(async ({ page }) => {
  360 |     await login(page);
  361 |   });
  362 | 
  363 |   test('TC-F05-01: Email button present on candidate detail', async ({ page }) => {
  364 |     await openFirstCandidate(page);
  365 |     const emailBtn = page.locator('button:has-text("Email")').first();
  366 |     await expect(emailBtn).toBeVisible({ timeout: 15000 });
  367 |   });
  368 | 
  369 |   // REGRESSION TEST for confirmed bug (see CHANGELOG). This test is
  370 |   // EXPECTED TO FAIL until the app is fixed to show a proper validation
  371 |   // message instead of a raw fetch error when email is missing.
  372 |   test('TC-F05-02 [BUG]: creating a candidate with no email should show a validation message, not "Failed to fetch"', async ({ page }) => {
  373 |     await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  374 |     await page.waitForTimeout(2000);
  375 |     const newBtn = page.locator('button:has-text("New candidate")').first();
  376 |     await newBtn.waitFor({ state: 'visible', timeout: 15000 });
  377 |     await newBtn.click();
  378 |     await page.waitForTimeout(2000);
  379 | 
  380 |     await fillIfVisible(page, 'input[placeholder*="name" i], input[name*="name" i]', NO_EMAIL_CANDIDATE.name);
  381 |     await fillIfVisible(page, 'input[placeholder*="title" i], input[name*="title" i]', NO_EMAIL_CANDIDATE.title);
  382 |     await fillIfVisible(page, 'input[placeholder*="year" i], input[name*="year" i]', NO_EMAIL_CANDIDATE.years);
  383 |     await fillIfVisible(page, 'input[placeholder*="skill" i], textarea[placeholder*="skill" i]', NO_EMAIL_CANDIDATE.skills);
  384 |     // Deliberately leave email blank
  385 | 
  386 |     const saveBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
  387 |     await saveBtn.click();
  388 |     await page.waitForTimeout(3000);
  389 |     const body = await page.locator('body').innerText();
  390 |     // KNOWN BUG: currently shows "Failed to fetch" — should show a clear
  391 |     // validation message instead (e.g. "Email is required").
  392 |     expect(body).not.toContain('Failed to fetch');
  393 |   });
  394 | 
  395 |   test('TC-F05-03: Email modal opens with template applied', async ({ page }) => {
  396 |     await openFirstCandidate(page);
  397 |     const emailBtn = page.locator('button:has-text("Email")').first();
  398 |     if (!(await emailBtn.isVisible().catch(() => false)) || await emailBtn.isDisabled().catch(() => false)) {
  399 |       test.skip(true, 'Email button not available/enabled for this candidate');
  400 |     }
  401 |     await emailBtn.click();
  402 |     await page.waitForTimeout(2000);
  403 |     const modal = page.locator('[role="dialog"]').first();
  404 |     await expect(modal).toBeVisible({ timeout: 10000 });
  405 |     const templateDropdown = page.locator('select, button', { hasText: /template/i }).first();
  406 |     await expect(templateDropdown).toBeVisible({ timeout: 5000 }).catch(() => {});
  407 |   });
  408 | 
  409 |   test('TC-F05-04: Send email and receive confirmation', async ({ page }) => {
  410 |     await openFirstCandidate(page);
  411 |     const emailBtn = page.locator('button:has-text("Email")').first();
  412 |     if (!(await emailBtn.isVisible().catch(() => false)) || await emailBtn.isDisabled().catch(() => false)) {
  413 |       test.skip(true, 'Email button not available/enabled for this candidate');
  414 |     }
  415 |     await emailBtn.click();
  416 |     await page.waitForTimeout(2000);
  417 |     const sendBtn = page.locator('button:has-text("Send")').first();
  418 |     await expect(sendBtn).toBeVisible({ timeout: 10000 });
  419 |     await sendBtn.click();
  420 |     await page.waitForTimeout(3000);
  421 |     const body = await page.locator('body').innerText();
  422 |     // Should NOT show the "mail service not configured" error if it has
  423 |     // been fixed; if it still shows, that's a regression worth flagging.
  424 |     expect(body).not.toContain('mail service is not configured');
  425 |   });
  426 | 
  427 |   test('TC-F05-05: Save as template — custom template appears in dropdown after reopening', async ({ page }) => {
  428 |     await openFirstCandidate(page);
  429 |     const emailBtn = page.locator('button:has-text("Email")').first();
  430 |     if (!(await emailBtn.isVisible().catch(() => false)) || await emailBtn.isDisabled().catch(() => false)) {
  431 |       test.skip(true, 'Email button not available/enabled for this candidate');
  432 |     }
  433 |     await emailBtn.click();
  434 |     await page.waitForTimeout(2000);
  435 |     const uniqueSubject = `QA Custom Template ${Date.now()}`;
  436 |     await fillIfVisible(page, 'input[placeholder*="subject" i]', uniqueSubject);
  437 |     const saveTemplateCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /template/i }).first();
  438 |     if (await saveTemplateCheckbox.isVisible().catch(() => false)) {
  439 |       await saveTemplateCheckbox.check();
  440 |     }
```