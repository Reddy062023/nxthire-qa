# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: openjobs.spec.js >> TC-12-C Job Card Details >> View matches button present on job cards
- Location: openjobs.spec.js:222:3

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
            - generic [ref=e117]: Loading… 7.0s
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
          - text: Loading jobs… 7.0s
          - generic [ref=e142]: Large tenants can take several seconds — the full set is fetched in one request today.
```

# Test source

```ts
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
  151 |       const options = await select.locator('option').allInnerTexts();
  152 |       const ceipalOption = options.find(o => o.toLowerCase().includes('ceipal'));
  153 |       if (ceipalOption) {
  154 |         await select.selectOption({ label: ceipalOption });
  155 |         await page.waitForTimeout(3000);
  156 |         const body = await getBody(page);
  157 |         const hasReqs = body.includes('requisitions') || body.includes('loaded');
  158 |         console.log(`After Ceipal filter — reqs visible: ${hasReqs}`);
  159 |         console.log('PASS: Ceipal filter applied');
  160 |       }
  161 |     } else {
  162 |       console.log('NOTE: Source filter is a custom component — manual verification needed');
  163 |     }
  164 |   });
  165 | 
  166 | });
  167 | 
  168 | // ─────────────────────────────────────────────────────────────
  169 | // TC-12-C — Job Card Details
  170 | // ─────────────────────────────────────────────────────────────
  171 | test.describe('TC-12-C Job Card Details', () => {
  172 | 
  173 |   test.beforeEach(async ({ page }) => {
  174 |     await login(page);
  175 |     await goToJobs(page);
  176 |   });
  177 | 
  178 |   test('Job card shows title and company location', async ({ page }) => {
  179 |     const body = await getBody(page);
  180 |     const hasNorthStar = body.includes('North Star');
  181 |     const hasLocation  = body.includes('Georgia') || body.includes('Texas') || body.includes('Remote') || body.includes('Hybrid');
  182 |     console.log(`North Star visible: ${hasNorthStar} | Location visible: ${hasLocation}`);
  183 |     expect(hasNorthStar).toBe(true);
  184 |     console.log('PASS: Job card shows company and location');
  185 |   });
  186 | 
  187 |   test('Job card shows skills tags', async ({ page }) => {
  188 |     const body = await getBody(page);
  189 |     // Skills seen in screenshots: Data Pipelines, EWM, GIS, cloud infrastructure
  190 |     const hasSkills = body.includes('Pipeline') || body.includes('EWM') || body.includes('GIS') || body.includes('cloud');
  191 |     console.log(`Skills tags found: ${hasSkills}`);
  192 |     console.log('NOTE: Skills tags like Data Pipelines, EWM confirmed visually');
  193 |   });
  194 | 
  195 |   test('Job card shows Posted date', async ({ page }) => {
  196 |     const body = await getBody(page);
  197 |     const hasPosted = body.includes('ago') || body.includes('Posted') || body.includes('POSTED');
  198 |     console.log(`Posted date visible: ${hasPosted}`);
  199 |     expect(hasPosted).toBe(true);
  200 |     console.log('PASS: Posted date visible on job cards');
  201 |   });
  202 | 
  203 |   test('Job card shows Candidates and Applications count', async ({ page }) => {
  204 |     const body = await getBody(page);
  205 |     const hasCandidates   = body.includes('CANDIDATES') || body.includes('Candidates');
  206 |     const hasApplications = body.includes('APPLICATIONS') || body.includes('Applications');
  207 |     console.log(`Candidates: ${hasCandidates} | Applications: ${hasApplications}`);
  208 |     expect(hasCandidates).toBe(true);
  209 |     console.log('PASS: Candidates and Applications counts visible');
  210 |   });
  211 | 
  212 |   test('Job card shows Top match percentage', async ({ page }) => {
  213 |     // Wait a bit extra for job cards to fully render
  214 |     await page.waitForTimeout(3000);
  215 |     const body = await getBody(page);
  216 |     const hasTopMatch = body.includes('TOP MATCH') || body.includes('Top match') || body.includes('MATCH') || body.includes('%');
  217 |     console.log(`Top match % visible: ${hasTopMatch}`);
  218 |     expect(hasTopMatch).toBe(true);
  219 |     console.log('PASS: Top match percentage visible');
  220 |   });
  221 | 
  222 |   test('View matches button present on job cards', async ({ page }) => {
  223 |     // Wait extra for cards to fully render
  224 |     await page.waitForTimeout(3000);
  225 |     const viewMatchesBtn = page.locator('button:has-text("View matches"), a:has-text("View matches")').first();
  226 |     const visible = await viewMatchesBtn.isVisible().catch(() => false);
  227 |     console.log(`View matches button visible: ${visible}`);
> 228 |     expect(visible).toBe(true);
      |                     ^ Error: expect(received).toBe(expected) // Object.is equality
  229 |     console.log('PASS: View matches button present');
  230 |   });
  231 | 
  232 |   test('Source button present on job cards', async ({ page }) => {
  233 |     await page.waitForTimeout(3000);
  234 |     const sourceBtn = page.locator('button:has-text("Source"), a:has-text("Source")').first();
  235 |     const visible = await sourceBtn.isVisible().catch(() => false);
  236 |     console.log(`Source button visible: ${visible}`);
  237 |     expect(visible).toBe(true);
  238 |     console.log('PASS: Source button present');
  239 |   });
  240 | 
  241 | });
  242 | 
  243 | // ─────────────────────────────────────────────────────────────
  244 | // TC-12-D — Job Status Badges
  245 | // ─────────────────────────────────────────────────────────────
  246 | test.describe('TC-12-D Job Status Badges', () => {
  247 | 
  248 |   test('Active and closed status badges visible', async ({ page }) => {
  249 |     await login(page);
  250 |     await goToJobs(page);
  251 |     await page.waitForTimeout(3000);
  252 |     const body = await getBody(page);
  253 |     // Status badges show as 'active' and 'closed' inside dropdown elements
  254 |     // Also check for Ceipal badge which is always visible
  255 |     const hasActive = body.toLowerCase().includes('active');
  256 |     const hasClosed = body.toLowerCase().includes('closed');
  257 |     const hasCeipal = body.includes('Ceipal');
  258 |     console.log(`Active: ${hasActive} | Closed: ${hasClosed} | Ceipal badge: ${hasCeipal}`);
  259 |     // At least one status type or source badge must be visible
  260 |     expect(hasActive || hasClosed || hasCeipal).toBe(true);
  261 |     console.log('PASS: Status badges visible on job cards');
  262 |   });
  263 | 
  264 |   test('Status dropdown present to change job status', async ({ page }) => {
  265 |     await login(page);
  266 |     await goToJobs(page);
  267 |     await page.waitForTimeout(3000);
  268 |     const body = await getBody(page);
  269 |     const hasStatus = body.includes('active') || body.includes('closed');
  270 |     console.log(`Status options visible: ${hasStatus}`);
  271 |     console.log('NOTE: Status change (active → closed) confirms position filled flow');
  272 |     console.log('NOTE: When status changes to closed — active reqs count decreases by 1');
  273 |   });
  274 | 
  275 | });
  276 | 
  277 | // ─────────────────────────────────────────────────────────────
  278 | // TC-12-E — View Matches
  279 | // ─────────────────────────────────────────────────────────────
  280 | test.describe('TC-12-E View Matches', () => {
  281 | 
  282 |   test('View matches button navigates to candidate matches', async ({ page }) => {
  283 |     await login(page);
  284 |     await goToJobs(page);
  285 |     await page.waitForTimeout(4000);
  286 |     // Use JavaScript click to bypass any overlay issues
  287 |     const clicked = await page.evaluate(() => {
  288 |       const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().includes('View matches'));
  289 |       if (btn) { btn.click(); return true; }
  290 |       return false;
  291 |     });
  292 |     console.log(`View matches clicked via JS: ${clicked}`);
  293 |     await page.waitForTimeout(4000);
  294 |     const url = page.url();
  295 |     console.log(`URL after View matches: ${url}`);
  296 |     const navigated = url.includes('candidates') || !url.endsWith('/jobs');
  297 |     console.log(`Navigated to candidates with job filter: ${navigated}`);
  298 |     expect(navigated).toBe(true);
  299 |     console.log('PASS: View matches navigates to candidate matches filtered by job');
  300 |   });
  301 | 
  302 | });
  303 | 
  304 | // ─────────────────────────────────────────────────────────────
  305 | // TC-12-F — Import CSV
  306 | // ─────────────────────────────────────────────────────────────
  307 | test.describe('TC-12-F Import CSV', () => {
  308 | 
  309 |   test('Import CSV button opens import interface', async ({ page }) => {
  310 |     await login(page);
  311 |     await goToJobs(page);
  312 |     const importBtn = page.locator('button:has-text("Import CSV"), a:has-text("Import CSV")').first();
  313 |     await importBtn.click();
  314 |     await page.waitForTimeout(3000);
  315 |     const url = page.url();
  316 |     const body = await getBody(page);
  317 |     console.log(`URL after Import CSV: ${url}`);
  318 |     // From previous run: navigates to /jobs/new
  319 |     const navigated = url.includes('jobs/new') || url.includes('import');
  320 |     console.log(`Navigated to import page: ${navigated}`);
  321 |     console.log('NOTE: Import CSV opens the new requisition / import interface');
  322 |   });
  323 | 
  324 | });
  325 | 
  326 | // ─────────────────────────────────────────────────────────────
  327 | // TC-12-G — New Requisition Page
  328 | // ─────────────────────────────────────────────────────────────
```