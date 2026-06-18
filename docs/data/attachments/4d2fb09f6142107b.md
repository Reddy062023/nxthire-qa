# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: openjobs.spec.js >> TC-12-H Pagination >> Shows 500 of 2232 active requisitions loaded
- Location: openjobs.spec.js:346:3

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "of"
Received string:    ""
```

# Test source

```ts
  251 | test.describe('TC-12-F Import CSV', () => {
  252 | 
  253 |   test('Import CSV button opens import interface', async ({ page }) => {
  254 |     await login(page);
  255 |     await goToJobs(page);
  256 |     const importBtn = page.locator('button:has-text("Import CSV"), a:has-text("Import CSV")').first();
  257 |     await importBtn.click();
  258 |     await page.waitForTimeout(3000);
  259 |     const url = page.url();
  260 |     const modal = await page.locator('[role="dialog"], .modal, input[type="file"]').isVisible().catch(() => false);
  261 |     console.log(`URL after Import CSV: ${url}`);
  262 |     console.log(`Modal/dialog detected: ${modal}`);
  263 |     console.log('NOTE: Import CSV opens interface for bulk job upload');
  264 |   });
  265 | 
  266 | });
  267 | 
  268 | // ─────────────────────────────────────────────────────────────
  269 | // TC-12-G — New Requisition Page
  270 | // No API credits needed — just testing form loads correctly
  271 | // ─────────────────────────────────────────────────────────────
  272 | test.describe('TC-12-G New Requisition Page', () => {
  273 | 
  274 |   test('New requisition button navigates to form', async ({ page }) => {
  275 |     await login(page);
  276 |     await goToJobs(page);
  277 |     const newReqBtn = page.locator('button:has-text("New requisition"), a:has-text("New requisition")').first();
  278 |     await newReqBtn.click();
  279 |     await page.waitForTimeout(3000);
  280 |     const url = page.url();
  281 |     console.log(`URL after New requisition: ${url}`);
  282 |     expect(url).toContain('jobs/new');
  283 |     console.log('PASS: New requisition navigates to /jobs/new');
  284 |   });
  285 | 
  286 |   test('New requisition form shows JD text area', async ({ page }) => {
  287 |     await login(page);
  288 |     await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
  289 |     await page.waitForTimeout(3000);
  290 |     const textarea = page.locator('textarea').first();
  291 |     const visible = await textarea.isVisible().catch(() => false);
  292 |     console.log(`JD text area visible: ${visible}`);
  293 |     expect(visible).toBe(true);
  294 |     console.log('PASS: JD text area present on new requisition form');
  295 |   });
  296 | 
  297 |   test('New requisition form shows Parse with Claude button', async ({ page }) => {
  298 |     await login(page);
  299 |     await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
  300 |     await page.waitForTimeout(3000);
  301 |     const parseBtn = page.locator('button:has-text("Parse with Claude")').first();
  302 |     const visible = await parseBtn.isVisible().catch(() => false);
  303 |     console.log(`Parse with Claude button visible: ${visible}`);
  304 |     expect(visible).toBe(true);
  305 |     console.log('PASS: Parse with Claude button present');
  306 |     console.log('NOTE: This button requires active Anthropic API credits — deferred to Phase 2');
  307 |   });
  308 | 
  309 |   test('New requisition form accepts JD text input', async ({ page }) => {
  310 |     await login(page);
  311 |     await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
  312 |     await page.waitForTimeout(3000);
  313 |     const textarea = page.locator('textarea').first();
  314 |     await textarea.fill('QA Test Job - Senior Java Developer - Austin TX - 5+ years experience - DO NOT USE');
  315 |     await page.waitForTimeout(1000);
  316 |     const value = await textarea.inputValue();
  317 |     console.log(`Text entered in JD area: ${value.substring(0, 50)}...`);
  318 |     expect(value.length).toBeGreaterThan(10);
  319 |     console.log('PASS: JD text area accepts input');
  320 |   });
  321 | 
  322 |   test('Cancel button returns to jobs list', async ({ page }) => {
  323 |     await login(page);
  324 |     await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
  325 |     await page.waitForTimeout(3000);
  326 |     const cancelBtn = page.locator('button:has-text("Cancel"), a:has-text("Cancel")').first();
  327 |     if (await cancelBtn.isVisible()) {
  328 |       await cancelBtn.click();
  329 |       await page.waitForTimeout(2000);
  330 |       const url = page.url();
  331 |       console.log(`URL after Cancel: ${url}`);
  332 |       expect(url).toContain('jobs');
  333 |       console.log('PASS: Cancel returns to jobs list');
  334 |     } else {
  335 |       console.log('NOTE: Cancel button not found — may use browser back');
  336 |     }
  337 |   });
  338 | 
  339 | });
  340 | 
  341 | // ─────────────────────────────────────────────────────────────
  342 | // TC-12-H — Pagination
  343 | // ─────────────────────────────────────────────────────────────
  344 | test.describe('TC-12-H Pagination', () => {
  345 | 
  346 |   test('Shows 500 of 2232 active requisitions loaded', async ({ page }) => {
  347 |     await login(page);
  348 |     await goToJobs(page);
  349 |     const countText = await page.locator('text=/\\d+ of \\d+ active requisitions loaded/').first().innerText().catch(() => '');
  350 |     console.log(`Pagination count: ${countText}`);
> 351 |     expect(countText).toContain('of');
      |                       ^ Error: expect(received).toContain(expected) // indexOf
  352 |     expect(countText).toContain('loaded');
  353 |     console.log('PASS: Pagination count shows correctly');
  354 |   });
  355 | 
  356 |   test('Active reqs stat card shows correct count', async ({ page }) => {
  357 |     await login(page);
  358 |     await goToJobs(page);
  359 |     const body = await page.locator('body').innerText();
  360 |     const hasCount = body.includes('2,2') || body.includes('2231') || body.includes('2232');
  361 |     console.log(`Active reqs count visible: ${hasCount}`);
  362 |     expect(hasCount).toBe(true);
  363 |     console.log('PASS: Active reqs count shown in stats card');
  364 |   });
  365 | 
  366 | });
  367 | 
  368 | // ─────────────────────────────────────────────────────────────
  369 | // TC-12-K — Parse with Claude (DEFERRED — Needs API Credits)
  370 | // ─────────────────────────────────────────────────────────────
  371 | test.describe('TC-12-K Parse with Claude — DEFERRED', () => {
  372 | 
  373 |   test('DEFERRED — Parse JD with Claude extracts fields correctly', async ({ page }) => {
  374 |     console.log('DEFERRED: This test requires active Anthropic API credits');
  375 |     console.log('DEFERRED: When API credits restored — paste JD and click Parse with Claude');
  376 |     console.log('DEFERRED: Verify Claude extracts title, location, skills, comp, work type');
  377 |     console.log('DEFERRED: Verify extracted fields appear on right panel');
  378 |     console.log('DEFERRED: Save the parsed requisition and verify it appears in jobs list');
  379 |   });
  380 | 
  381 |   test('DEFERRED — New requisition created and shows as active', async ({ page }) => {
  382 |     console.log('DEFERRED: After Parse with Claude saves the job');
  383 |     console.log('DEFERRED: Verify new job appears in Open Jobs list');
  384 |     console.log('DEFERRED: Verify status shows as active');
  385 |     console.log('DEFERRED: Verify active reqs count increases by 1');
  386 |   });
  387 | 
  388 |   test('DEFERRED — Position filled — change status from active to closed', async ({ page }) => {
  389 |     console.log('DEFERRED: After job is created and candidate is submitted');
  390 |     console.log('DEFERRED: Change job status from active to closed');
  391 |     console.log('DEFERRED: Verify status badge changes to closed');
  392 |     console.log('DEFERRED: Verify active reqs count decreases by 1');
  393 |     console.log('DEFERRED: This simulates the real-world position filled workflow');
  394 |   });
  395 | 
  396 | });
```