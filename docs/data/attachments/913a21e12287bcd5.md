# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: openjobs.spec.js >> TC-12-C Job Card Details >> View matches button present on job cards
- Location: openjobs.spec.js:181:3

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
            - generic [ref=e117]: Loading… 3.0s
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
          - text: Loading jobs… 3.0s
          - generic [ref=e142]: Large tenants can take several seconds — the full set is fetched in one request today.
```

# Test source

```ts
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
  182 |     const viewMatchesBtn = page.locator('button:has-text("View matches"), a:has-text("View matches")').first();
  183 |     const visible = await viewMatchesBtn.isVisible().catch(() => false);
  184 |     console.log(`View matches button visible: ${visible}`);
> 185 |     expect(visible).toBe(true);
      |                     ^ Error: expect(received).toBe(expected) // Object.is equality
  186 |     console.log('PASS: View matches button present');
  187 |   });
  188 | 
  189 |   test('Source button present on job cards', async ({ page }) => {
  190 |     const sourceBtn = page.locator('button:has-text("Source"), a:has-text("Source")').first();
  191 |     const visible = await sourceBtn.isVisible().catch(() => false);
  192 |     console.log(`Source button visible: ${visible}`);
  193 |     expect(visible).toBe(true);
  194 |     console.log('PASS: Source button present');
  195 |   });
  196 | 
  197 | });
  198 | 
  199 | // ─────────────────────────────────────────────────────────────
  200 | // TC-12-D — Job Status Badges
  201 | // ─────────────────────────────────────────────────────────────
  202 | test.describe('TC-12-D Job Status Badges', () => {
  203 | 
  204 |   test('Active and closed status badges visible', async ({ page }) => {
  205 |     await login(page);
  206 |     await goToJobs(page);
  207 |     const body = await page.locator('body').innerText();
  208 |     const hasActive = body.includes('active');
  209 |     const hasClosed = body.includes('closed');
  210 |     console.log(`Active badge: ${hasActive} | Closed badge: ${hasClosed}`);
  211 |     expect(hasActive || hasClosed).toBe(true);
  212 |     console.log('PASS: Status badges visible on job cards');
  213 |   });
  214 | 
  215 |   test('Status dropdown present to change job status', async ({ page }) => {
  216 |     await login(page);
  217 |     await goToJobs(page);
  218 |     const statusDropdown = page.locator('select, [class*="dropdown"]').first();
  219 |     const visible = await statusDropdown.isVisible().catch(() => false);
  220 |     console.log(`Status dropdown visible: ${visible}`);
  221 |     console.log('NOTE: Status change (active → closed) confirms position filled flow');
  222 |   });
  223 | 
  224 | });
  225 | 
  226 | // ─────────────────────────────────────────────────────────────
  227 | // TC-12-E — View Matches
  228 | // ─────────────────────────────────────────────────────────────
  229 | test.describe('TC-12-E View Matches', () => {
  230 | 
  231 |   test('View matches button navigates to candidate matches', async ({ page }) => {
  232 |     await login(page);
  233 |     await goToJobs(page);
  234 |     const viewMatchesBtn = page.locator('button:has-text("View matches"), a:has-text("View matches")').first();
  235 |     await viewMatchesBtn.waitFor({ state: 'visible', timeout: 15000 });
  236 |     await viewMatchesBtn.click({ force: true });
  237 |     await page.waitForTimeout(3000);
  238 |     const url = page.url();
  239 |     console.log(`URL after View matches: ${url}`);
  240 |     const urlChanged = !url.endsWith('/jobs');
  241 |     console.log(`Navigated away from jobs: ${urlChanged}`);
  242 |     expect(urlChanged).toBe(true);
  243 |     console.log('PASS: View matches navigates to candidate matches');
  244 |   });
  245 | 
  246 | });
  247 | 
  248 | // ─────────────────────────────────────────────────────────────
  249 | // TC-12-F — Import CSV
  250 | // ─────────────────────────────────────────────────────────────
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
```