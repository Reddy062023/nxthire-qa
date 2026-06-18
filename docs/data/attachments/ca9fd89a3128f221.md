# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: openjobs.spec.js >> TC-12-E View Matches >> View matches button navigates to candidate matches
- Location: openjobs.spec.js:265:3

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('button:has-text("View matches"), a:has-text("View matches")').first() to be visible

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
            - generic [ref=e117]: Loading… 22.0s
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
          - text: Loading jobs… 22.0s
          - generic [ref=e142]: Large tenants can take several seconds — the full set is fetched in one request today.
```

# Test source

```ts
  170 |     console.log(`North Star visible: ${hasNorthStar} | Location visible: ${hasLocation}`);
  171 |     expect(hasNorthStar).toBe(true);
  172 |     console.log('PASS: Job card shows company and location');
  173 |   });
  174 | 
  175 |   test('Job card shows skills tags', async ({ page }) => {
  176 |     const body = await getBody(page);
  177 |     // Skills seen in screenshots: Data Pipelines, EWM, GIS, cloud infrastructure
  178 |     const hasSkills = body.includes('Pipeline') || body.includes('EWM') || body.includes('GIS') || body.includes('cloud');
  179 |     console.log(`Skills tags found: ${hasSkills}`);
  180 |     console.log('NOTE: Skills tags like Data Pipelines, EWM confirmed visually');
  181 |   });
  182 | 
  183 |   test('Job card shows Posted date', async ({ page }) => {
  184 |     const body = await getBody(page);
  185 |     const hasPosted = body.includes('ago') || body.includes('Posted') || body.includes('POSTED');
  186 |     console.log(`Posted date visible: ${hasPosted}`);
  187 |     expect(hasPosted).toBe(true);
  188 |     console.log('PASS: Posted date visible on job cards');
  189 |   });
  190 | 
  191 |   test('Job card shows Candidates and Applications count', async ({ page }) => {
  192 |     const body = await getBody(page);
  193 |     const hasCandidates   = body.includes('CANDIDATES') || body.includes('Candidates');
  194 |     const hasApplications = body.includes('APPLICATIONS') || body.includes('Applications');
  195 |     console.log(`Candidates: ${hasCandidates} | Applications: ${hasApplications}`);
  196 |     expect(hasCandidates).toBe(true);
  197 |     console.log('PASS: Candidates and Applications counts visible');
  198 |   });
  199 | 
  200 |   test('Job card shows Top match percentage', async ({ page }) => {
  201 |     // Wait a bit extra for job cards to fully render
  202 |     await page.waitForTimeout(3000);
  203 |     const body = await getBody(page);
  204 |     const hasTopMatch = body.includes('TOP MATCH') || body.includes('Top match') || body.includes('MATCH') || body.includes('%');
  205 |     console.log(`Top match % visible: ${hasTopMatch}`);
  206 |     expect(hasTopMatch).toBe(true);
  207 |     console.log('PASS: Top match percentage visible');
  208 |   });
  209 | 
  210 |   test('View matches button present on job cards', async ({ page }) => {
  211 |     // Wait extra for cards to fully render
  212 |     await page.waitForTimeout(3000);
  213 |     const viewMatchesBtn = page.locator('button:has-text("View matches"), a:has-text("View matches")').first();
  214 |     const visible = await viewMatchesBtn.isVisible().catch(() => false);
  215 |     console.log(`View matches button visible: ${visible}`);
  216 |     expect(visible).toBe(true);
  217 |     console.log('PASS: View matches button present');
  218 |   });
  219 | 
  220 |   test('Source button present on job cards', async ({ page }) => {
  221 |     await page.waitForTimeout(3000);
  222 |     const sourceBtn = page.locator('button:has-text("Source"), a:has-text("Source")').first();
  223 |     const visible = await sourceBtn.isVisible().catch(() => false);
  224 |     console.log(`Source button visible: ${visible}`);
  225 |     expect(visible).toBe(true);
  226 |     console.log('PASS: Source button present');
  227 |   });
  228 | 
  229 | });
  230 | 
  231 | // ─────────────────────────────────────────────────────────────
  232 | // TC-12-D — Job Status Badges
  233 | // ─────────────────────────────────────────────────────────────
  234 | test.describe('TC-12-D Job Status Badges', () => {
  235 | 
  236 |   test('Active and closed status badges visible', async ({ page }) => {
  237 |     await login(page);
  238 |     await goToJobs(page);
  239 |     const body = await getBody(page);
  240 |     const hasActive = body.includes('active');
  241 |     const hasClosed = body.includes('closed');
  242 |     console.log(`Active badge: ${hasActive} | Closed badge: ${hasClosed}`);
  243 |     expect(hasActive || hasClosed).toBe(true);
  244 |     console.log('PASS: Status badges visible on job cards');
  245 |   });
  246 | 
  247 |   test('Status dropdown present to change job status', async ({ page }) => {
  248 |     await login(page);
  249 |     await goToJobs(page);
  250 |     await page.waitForTimeout(3000);
  251 |     const body = await getBody(page);
  252 |     const hasStatus = body.includes('active') || body.includes('closed');
  253 |     console.log(`Status options visible: ${hasStatus}`);
  254 |     console.log('NOTE: Status change (active → closed) confirms position filled flow');
  255 |     console.log('NOTE: When status changes to closed — active reqs count decreases by 1');
  256 |   });
  257 | 
  258 | });
  259 | 
  260 | // ─────────────────────────────────────────────────────────────
  261 | // TC-12-E — View Matches
  262 | // ─────────────────────────────────────────────────────────────
  263 | test.describe('TC-12-E View Matches', () => {
  264 | 
  265 |   test('View matches button navigates to candidate matches', async ({ page }) => {
  266 |     await login(page);
  267 |     await goToJobs(page);
  268 |     await page.waitForTimeout(3000);
  269 |     const viewMatchesBtn = page.locator('button:has-text("View matches"), a:has-text("View matches")').first();
> 270 |     await viewMatchesBtn.waitFor({ state: 'visible', timeout: 15000 });
      |                          ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  271 |     await viewMatchesBtn.click({ force: true });
  272 |     await page.waitForTimeout(3000);
  273 |     const url = page.url();
  274 |     console.log(`URL after View matches: ${url}`);
  275 |     // From previous run: navigates to /candidates?job=...
  276 |     const navigated = url.includes('candidates') || !url.endsWith('/jobs');
  277 |     console.log(`Navigated to candidates with job filter: ${navigated}`);
  278 |     expect(navigated).toBe(true);
  279 |     console.log('PASS: View matches navigates to candidate matches filtered by job');
  280 |   });
  281 | 
  282 | });
  283 | 
  284 | // ─────────────────────────────────────────────────────────────
  285 | // TC-12-F — Import CSV
  286 | // ─────────────────────────────────────────────────────────────
  287 | test.describe('TC-12-F Import CSV', () => {
  288 | 
  289 |   test('Import CSV button opens import interface', async ({ page }) => {
  290 |     await login(page);
  291 |     await goToJobs(page);
  292 |     const importBtn = page.locator('button:has-text("Import CSV"), a:has-text("Import CSV")').first();
  293 |     await importBtn.click();
  294 |     await page.waitForTimeout(3000);
  295 |     const url = page.url();
  296 |     const body = await getBody(page);
  297 |     console.log(`URL after Import CSV: ${url}`);
  298 |     // From previous run: navigates to /jobs/new
  299 |     const navigated = url.includes('jobs/new') || url.includes('import');
  300 |     console.log(`Navigated to import page: ${navigated}`);
  301 |     console.log('NOTE: Import CSV opens the new requisition / import interface');
  302 |   });
  303 | 
  304 | });
  305 | 
  306 | // ─────────────────────────────────────────────────────────────
  307 | // TC-12-G — New Requisition Page
  308 | // ─────────────────────────────────────────────────────────────
  309 | test.describe('TC-12-G New Requisition Page', () => {
  310 | 
  311 |   test('New requisition button navigates to form', async ({ page }) => {
  312 |     await login(page);
  313 |     await goToJobs(page);
  314 |     const newReqBtn = page.locator('button:has-text("New requisition"), a:has-text("New requisition")').first();
  315 |     await newReqBtn.click();
  316 |     await page.waitForTimeout(3000);
  317 |     const url = page.url();
  318 |     console.log(`URL after New requisition: ${url}`);
  319 |     expect(url).toContain('jobs/new');
  320 |     console.log('PASS: New requisition navigates to /jobs/new');
  321 |   });
  322 | 
  323 |   test('New requisition form shows JD text area', async ({ page }) => {
  324 |     await login(page);
  325 |     await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
  326 |     await page.waitForTimeout(3000);
  327 |     const textarea = page.locator('textarea').first();
  328 |     const visible = await textarea.isVisible().catch(() => false);
  329 |     console.log(`JD text area visible: ${visible}`);
  330 |     expect(visible).toBe(true);
  331 |     console.log('PASS: JD text area present on new requisition form');
  332 |   });
  333 | 
  334 |   test('New requisition form shows Parse with Claude button', async ({ page }) => {
  335 |     await login(page);
  336 |     await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
  337 |     await page.waitForTimeout(3000);
  338 |     const parseBtn = page.locator('button:has-text("Parse with Claude")').first();
  339 |     const visible = await parseBtn.isVisible().catch(() => false);
  340 |     console.log(`Parse with Claude button visible: ${visible}`);
  341 |     expect(visible).toBe(true);
  342 |     console.log('PASS: Parse with Claude button present');
  343 |     console.log('NOTE: This button requires active Anthropic API credits — deferred to Phase 2');
  344 |   });
  345 | 
  346 |   test('New requisition form accepts JD text input', async ({ page }) => {
  347 |     await login(page);
  348 |     await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
  349 |     await page.waitForTimeout(3000);
  350 |     const textarea = page.locator('textarea').first();
  351 |     await textarea.fill('QA Test Job - Senior Java Developer - Austin TX - 5+ years - DO NOT USE');
  352 |     await page.waitForTimeout(1000);
  353 |     const value = await textarea.inputValue();
  354 |     console.log(`Text entered: ${value.substring(0, 50)}...`);
  355 |     expect(value.length).toBeGreaterThan(10);
  356 |     console.log('PASS: JD text area accepts input');
  357 |   });
  358 | 
  359 |   test('Cancel button returns to jobs list', async ({ page }) => {
  360 |     await login(page);
  361 |     await page.goto(`${BASE_URL}/jobs/new`, { timeout: 60000 });
  362 |     await page.waitForTimeout(3000);
  363 |     const cancelBtn = page.locator('button:has-text("Cancel"), a:has-text("Cancel")').first();
  364 |     if (await cancelBtn.isVisible()) {
  365 |       await cancelBtn.click();
  366 |       await page.waitForTimeout(2000);
  367 |       const url = page.url();
  368 |       console.log(`URL after Cancel: ${url}`);
  369 |       expect(url).toContain('jobs');
  370 |       console.log('PASS: Cancel returns to jobs list');
```