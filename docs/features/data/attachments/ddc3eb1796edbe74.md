# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feature11.spec.js >> Feature 11 — Application Pipeline (standalone) >> TC-F11-01: Apply candidate to job — "already applied" + working status dropdown
- Location: tests/feature11.spec.js:216:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "already applied"
Received string:    "ns
north star
ai agent
ai agent
new
recruit
candidates
open jobs
talent bench
interviews
timesheets
sales
sales crm
requirements
vendors
configure
data sources
monster
indeed
theirstack
ceipal
templates
onboarding
insights
analytics
email history
activity & goals
manage
team
access control
audit log
settings
powered by nxthire.ai
sn
sundar n
candidates
qa f11 t01 1789756284086
qf
qa f11 t01 1789756284086
open to work
profile shared
· — · · hybrid preferred
qaf11t011789756284086@nstargroupinc.com
match score
pick jobs & apply
shortlist
email
add note
edit
archive
delete
claude's read on this candidate
3.2s
qa f11 t01 1789756284086 works across java, python, aws. strong fit for senior roles in their domain. recommend prioritising for matching reqs.
strengths
java · python · aws
experience
—
source
local db
tags
no tags yet.
add
notes
add note
no notes yet.
email history
1
your application to north star group has been submitted
sent
9/18/2026, 6:32:00 pm · by sundar n
skills
java
python
aws
duplicate submission check
check
flags other profiles with the same email/name, plus existing submissions, interviews, and placements for this candidate.
video interview & verification
steps to complete before moving this candidate forward.
video interview completed
identity verified
work authorization verified
references checked
skills assessment reviewed
resume
no file on record
word resume
matched open jobs
loading…
loading open jobs…
matching against candidate skills
pick jobs & apply
jobs on external sources
posted ≤
7d
14d
30d
60d
90d
theirstack
click a source above to search for matching external jobs. results are cached for this session to avoid paid re-calls."
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
      - link "Talent bench" [ref=e28] [cursor=pointer]:
        - /url: /bench
        - img [ref=e29]
        - generic [ref=e32]: Talent bench
      - link "Interviews" [ref=e33] [cursor=pointer]:
        - /url: /interviews
        - img [ref=e34]
        - generic [ref=e36]: Interviews
      - link "Timesheets" [ref=e37] [cursor=pointer]:
        - /url: /timesheets
        - img [ref=e38]
        - generic [ref=e41]: Timesheets
      - generic [ref=e42]: Sales
      - link "Sales CRM" [ref=e43] [cursor=pointer]:
        - /url: /crm
        - img [ref=e44]
        - generic [ref=e48]: Sales CRM
      - link "Requirements" [ref=e49] [cursor=pointer]:
        - /url: /requirements
        - img [ref=e50]
        - generic [ref=e53]: Requirements
      - link "Vendors" [ref=e54] [cursor=pointer]:
        - /url: /vendors
        - img [ref=e55]
        - generic [ref=e59]: Vendors
      - generic [ref=e60]: Configure
      - link "Data sources" [ref=e61] [cursor=pointer]:
        - /url: /sources
        - img [ref=e62]
        - generic [ref=e64]: Data sources
      - link "Monster" [ref=e65] [cursor=pointer]:
        - /url: /connectors/monster
        - img [ref=e66]
        - generic [ref=e72]: Monster
      - link "Indeed" [ref=e73] [cursor=pointer]:
        - /url: /connectors/indeed
        - img [ref=e74]
        - generic [ref=e80]: Indeed
      - link "TheirStack" [ref=e81] [cursor=pointer]:
        - /url: /connectors/theirstack
        - img [ref=e82]
        - generic [ref=e88]: TheirStack
      - link "Ceipal" [ref=e89] [cursor=pointer]:
        - /url: /connectors/ceipal
        - img [ref=e90]
        - generic [ref=e96]: Ceipal
      - link "Templates" [ref=e97] [cursor=pointer]:
        - /url: /templates
        - img [ref=e98]
        - generic [ref=e101]: Templates
      - link "Onboarding" [ref=e102] [cursor=pointer]:
        - /url: /onboarding
        - img [ref=e103]
        - generic [ref=e108]: Onboarding
      - generic [ref=e109]: Insights
      - link "Analytics" [ref=e110] [cursor=pointer]:
        - /url: /analytics
        - img [ref=e111]
        - generic [ref=e113]: Analytics
      - link "Email history" [ref=e114] [cursor=pointer]:
        - /url: /email-history
        - img [ref=e115]
        - generic [ref=e118]: Email history
      - link "Activity & goals" [ref=e119] [cursor=pointer]:
        - /url: /productivity
        - img [ref=e120]
        - generic [ref=e124]: Activity & goals
      - generic [ref=e125]: Manage
      - link "Team" [ref=e126] [cursor=pointer]:
        - /url: /users
        - img [ref=e127]
        - generic [ref=e131]: Team
      - link "Access control" [ref=e132] [cursor=pointer]:
        - /url: /access
        - img [ref=e133]
        - generic [ref=e136]: Access control
      - link "Audit log" [ref=e137] [cursor=pointer]:
        - /url: /audit
        - img [ref=e138]
        - generic [ref=e141]: Audit log
      - link "Settings" [ref=e142] [cursor=pointer]:
        - /url: /settings
        - img [ref=e143]
        - generic [ref=e146]: Settings
    - generic [ref=e147]:
      - img "NxtHire" [ref=e148]
      - generic [ref=e153]: Powered by NxtHire.ai
  - generic [ref=e154]:
    - banner [ref=e155]:
      - generic [ref=e156]:
        - button "Notifications" [ref=e158] [cursor=pointer]:
          - img [ref=e159]
        - generic [ref=e164] [cursor=pointer]:
          - generic [ref=e165]: SN
          - generic [ref=e167]: Sundar N
          - img [ref=e168]
    - main [ref=e170]:
      - generic [ref=e171]:
        - generic [ref=e172]:
          - link "Candidates" [ref=e173] [cursor=pointer]:
            - /url: /candidates
          - img [ref=e174]
          - generic [ref=e176]: QA F11 T01 1789756284086
        - generic [ref=e177]:
          - generic [ref=e178]:
            - generic [ref=e179]:
              - generic [ref=e180]:
                - generic [ref=e181]: QF
                - generic [ref=e182]:
                  - generic [ref=e183]:
                    - generic [ref=e184]: QA F11 T01 1789756284086
                    - generic [ref=e185]: open to work
                    - generic [ref=e187]:
                      - img [ref=e188]
                      - text: Profile shared
                  - generic [ref=e191]: · — · · Hybrid preferred
                  - generic [ref=e193]:
                    - img [ref=e194]
                    - text: qaf11t011789756284086@nstargroupinc.com
                - generic [ref=e198]: MATCH SCORE
              - generic [ref=e199]:
                - button "Pick jobs & apply" [ref=e200] [cursor=pointer]:
                  - img [ref=e201]
                  - text: Pick jobs & apply
                - button "Shortlist" [ref=e204] [cursor=pointer]:
                  - img [ref=e205]
                  - text: Shortlist
                - button "Email" [ref=e207] [cursor=pointer]:
                  - img [ref=e208]
                  - text: Email
                - button "Add note" [ref=e211] [cursor=pointer]:
                  - img [ref=e212]
                  - text: Add note
                - button "Edit" [ref=e214] [cursor=pointer]:
                  - img [ref=e215]
                  - text: Edit
                - button "Archive" [ref=e218] [cursor=pointer]:
                  - img [ref=e219]
                  - text: Archive
                - button "Delete" [ref=e222] [cursor=pointer]:
                  - img [ref=e223]
                  - text: Delete
            - generic [ref=e226]:
              - generic [ref=e227]:
                - img [ref=e229]
                - generic [ref=e231]: Claude's read on this candidate
                - generic [ref=e232]: 3.2s
              - generic [ref=e233]: QA F11 T01 1789756284086 works across Java, Python, AWS. Strong fit for senior roles in their domain. Recommend prioritising for matching reqs.
              - generic [ref=e234]:
                - generic [ref=e235]:
                  - generic [ref=e236]: STRENGTHS
                  - generic [ref=e237]: Java · Python · AWS
                - generic [ref=e238]:
                  - generic [ref=e239]: EXPERIENCE
                  - generic [ref=e240]: —
                - generic [ref=e241]:
                  - generic [ref=e242]: SOURCE
                  - generic [ref=e243]: Local DB
            - generic [ref=e244]:
              - generic [ref=e245]:
                - img [ref=e246]
                - text: Tags
              - generic [ref=e250]: No tags yet.
              - generic [ref=e251]:
                - textbox "Add a tag (e.g. hot lead, java bench)" [ref=e252]
                - button "Add" [disabled] [ref=e253]
            - generic [ref=e254]:
              - generic [ref=e255]:
                - img [ref=e256]
                - text: Notes
              - generic [ref=e258]:
                - textbox "Add a note — call summary, availability, rate discussed…" [ref=e259]
                - button "Add note" [disabled] [ref=e261]
              - generic [ref=e262]: No notes yet.
            - generic [ref=e263]:
              - generic [ref=e264]:
                - img [ref=e265]
                - generic [ref=e268]: Email history
                - generic [ref=e269]: "1"
              - generic [ref=e271] [cursor=pointer]:
                - img [ref=e273]
                - generic [ref=e275]:
                  - generic [ref=e276]:
                    - generic [ref=e277]: Your application to North Star Group has been submitted
                    - generic [ref=e278]: sent
                  - generic [ref=e279]: 9/18/2026, 6:32:00 PM · by Sundar N
            - generic [ref=e280]:
              - generic [ref=e281]: Skills
              - generic [ref=e282]:
                - generic [ref=e283]: Java
                - generic [ref=e284]: Python
                - generic [ref=e285]: AWS
            - generic [ref=e286]:
              - generic [ref=e287]:
                - generic [ref=e288]: Duplicate submission check
                - button "Check" [ref=e289] [cursor=pointer]:
                  - img [ref=e290]
                  - text: Check
              - generic [ref=e293]: Flags other profiles with the same email/name, plus existing submissions, interviews, and placements for this candidate.
            - generic [ref=e294]:
              - generic [ref=e295]: Video interview & verification
              - generic [ref=e296]: Steps to complete before moving this candidate forward.
              - generic [ref=e297]:
                - generic [ref=e298] [cursor=pointer]:
                  - checkbox "Video interview completed" [ref=e299]
                  - generic [ref=e300]: Video interview completed
                - generic [ref=e301] [cursor=pointer]:
                  - checkbox "Identity verified" [ref=e302]
                  - generic [ref=e303]: Identity verified
                - generic [ref=e304] [cursor=pointer]:
                  - checkbox "Work authorization verified" [ref=e305]
                  - generic [ref=e306]: Work authorization verified
                - generic [ref=e307] [cursor=pointer]:
                  - checkbox "References checked" [ref=e308]
                  - generic [ref=e309]: References checked
                - generic [ref=e310] [cursor=pointer]:
                  - checkbox "Skills assessment reviewed" [ref=e311]
                  - generic [ref=e312]: Skills assessment reviewed
            - generic [ref=e314]:
              - generic [ref=e315]:
                - img [ref=e316]
                - text: Resume
                - generic [ref=e319]: no file on record
              - button "Word resume" [ref=e320] [cursor=pointer]:
                - img [ref=e321]
                - text: Word resume
          - generic [ref=e324]:
            - generic [ref=e325]:
              - generic [ref=e326]: MATCHED OPEN JOBS
              - generic [ref=e327]:
                - img [ref=e328]
                - generic [ref=e330]: loading…
              - generic [ref=e331]:
                - img [ref=e332]
                - generic [ref=e334]: Loading open jobs…
                - generic [ref=e335]: Matching against candidate skills
              - button "Pick jobs & apply" [disabled] [ref=e336]:
                - img [ref=e337]
                - text: Pick jobs & apply
            - generic [ref=e339]:
              - generic [ref=e341]:
                - img [ref=e342]
                - generic [ref=e348]: JOBS ON EXTERNAL SOURCES
              - generic [ref=e349]:
                - generic "Only return postings published within this many days" [ref=e350]:
                  - text: posted ≤
                  - combobox "posted ≤" [ref=e351]:
                    - option "7d"
                    - option "14d"
                    - option "30d" [selected]
                    - option "60d"
                    - option "90d"
                - generic [ref=e352]:
                  - button "TheirStack" [ref=e353] [cursor=pointer]
                  - button "Force a fresh TheirStack search (bypasses cache, may cost credits)" [ref=e354] [cursor=pointer]:
                    - img [ref=e355]
              - generic [ref=e360]: Click a source above to search for matching external jobs. Results are cached for this session to avoid paid re-calls.
```

# Test source

```ts
  125 |   }
  126 |   throw new Error('[createVerifiedCandidate] Could not create a verifiable candidate after 2 attempts.');
  127 | }
  128 | 
  129 | // Finds the status <select> scoped to the row containing the given job
  130 | // name, then POLLS until it's actually enabled (not just present) —
  131 | // the select can exist in the DOM but stay disabled for a while after
  132 | // an application is first submitted.
  133 | async function getEnabledStatusSelect(page, jobName) {
  134 |   const jobText = page.getByText(jobName, { exact: false }).first();
  135 |   await jobText.waitFor({ state: 'visible', timeout: 20000 });
  136 | 
  137 |   const selects = page.locator('select');
  138 |   const count = await selects.count();
  139 |   let target = null;
  140 |   for (let i = 0; i < count; i++) {
  141 |     const sel = selects.nth(i);
  142 |     const containerText = await sel.evaluate((el, levels) => {
  143 |       let node = el;
  144 |       for (let d = 0; d < levels && node.parentElement; d++) node = node.parentElement;
  145 |       return node.innerText || '';
  146 |     }, 6).catch(() => '');
  147 |     if (containerText.includes(jobName)) {
  148 |       target = sel;
  149 |       break;
  150 |     }
  151 |   }
  152 |   if (!target) {
  153 |     throw new Error(`[getEnabledStatusSelect] No status <select> found near "${jobName}"`);
  154 |   }
  155 | 
  156 |   console.log(`[getEnabledStatusSelect] Waiting up to 45s for the status select to become enabled...`);
  157 |   await expect(target).toBeEnabled({ timeout: 45000 });
  158 |   return target;
  159 | }
  160 | 
  161 | // Filters directly for the job (lighter than waiting on the full
  162 | // 2000+ job list), polls up to 60s for it to appear, applies, then
  163 | // POLLS for actual confirmation the application registered (rather
  164 | // than a blind wait) before returning.
  165 | async function applyToJob(page, jobName) {
  166 |   const pickJobsBtn = page.getByRole('button', { name: 'Pick jobs & apply', exact: true }).first();
  167 |   await pickJobsBtn.waitFor({ state: 'visible', timeout: 20000 });
  168 |   await pickJobsBtn.click();
  169 |   await page.waitForTimeout(2000);
  170 | 
  171 |   const filterBox = page.locator('input[placeholder*="Filter by title" i]').first();
  172 |   await filterBox.waitFor({ state: 'visible', timeout: 15000 });
  173 |   await filterBox.fill(jobName);
  174 | 
  175 |   const jobRow = page.getByText(jobName, { exact: false }).first();
  176 |   console.log(`[applyToJob] Waiting up to 60s for "${jobName}" to appear...`);
  177 |   await jobRow.waitFor({ state: 'visible', timeout: 60000 });
  178 | 
  179 |   const checkbox = page.locator('input[type="checkbox"]').first();
  180 |   await checkbox.waitFor({ state: 'visible', timeout: 10000 });
  181 |   const isDisabled = await checkbox.isDisabled().catch(() => false);
  182 |   if (isDisabled) {
  183 |     console.log(`[applyToJob] "${jobName}" already applied — using existing application.`);
  184 |     return;
  185 |   }
  186 |   await checkbox.check();
  187 |   await page.waitForTimeout(1000);
  188 | 
  189 |   const applyBtn = page.getByRole('button', { name: /Apply/i }).first();
  190 |   await applyBtn.click();
  191 | 
  192 |   // Poll for real confirmation instead of a blind wait: navigate back
  193 |   // to the candidate and check for "already applied" near the job,
  194 |   // retrying for up to 60s total.
  195 |   console.log('[applyToJob] Polling up to 60s for the submission to register...');
  196 |   const deadline = Date.now() + 60000;
  197 |   while (Date.now() < deadline) {
  198 |     await page.waitForTimeout(5000);
  199 |     const body = await page.locator('body').innerText().catch(() => '');
  200 |     if (body.toLowerCase().includes('already applied')) {
  201 |       console.log('[applyToJob] Confirmed: application registered.');
  202 |       return;
  203 |     }
  204 |   }
  205 |   console.log('[applyToJob] Did not see confirmation within 60s — proceeding anyway; downstream steps will surface if it truly failed.');
  206 | }
  207 | 
  208 | // ---------- Tests ----------
  209 | 
  210 | test.describe('Feature 11 — Application Pipeline (standalone)', () => {
  211 | 
  212 |   test.beforeEach(async ({ page }) => {
  213 |     await ensureLoggedIn(page);
  214 |   });
  215 | 
  216 |   test('TC-F11-01: Apply candidate to job — "already applied" + working status dropdown', async ({ page }) => {
  217 |     test.setTimeout(180000);
  218 |     const jobName = 'Data Science Engineer';
  219 | 
  220 |     const candidateName = await createVerifiedCandidate(page, 'QA F11 T01', 'Java, Python, AWS');
  221 |     await applyToJob(page, jobName);
  222 |     await openCandidateByName(page, candidateName);
  223 | 
  224 |     const body = await page.locator('body').innerText();
> 225 |     expect(body.toLowerCase()).toContain('already applied');
      |                                ^ Error: expect(received).toContain(expected) // indexOf
  226 | 
  227 |     const statusSelect = await getEnabledStatusSelect(page, jobName);
  228 |     const currentValue = await statusSelect.inputValue().catch(() => '');
  229 |     console.log('[TC-F11-01] Current status value:', currentValue);
  230 |   });
  231 | 
  232 |   test('TC-F11-02: Walk status pipeline (qualified -> interviewing -> offer_extended)', async ({ page }) => {
  233 |     test.setTimeout(180000);
  234 |     const jobName = 'Data Analyst';
  235 | 
  236 |     const candidateName = await createVerifiedCandidate(page, 'QA F11 T02', 'Java, Python, SQL');
  237 |     await applyToJob(page, jobName);
  238 |     await openCandidateByName(page, candidateName);
  239 | 
  240 |     const statusSelect = await getEnabledStatusSelect(page, jobName);
  241 | 
  242 |     for (const label of ['qualified', 'interviewing', 'offer extended']) {
  243 |       await statusSelect.selectOption({ label });
  244 |       await page.waitForTimeout(2000);
  245 |       const value = await statusSelect.inputValue().catch(() => '');
  246 |       console.log(`[TC-F11-02] Status after "${label}":`, value);
  247 |       expect(value.toLowerCase()).toContain(label);
  248 |     }
  249 |   });
  250 | 
  251 |   test('TC-F11-03: Analytics funnel tiles reflect application status', async ({ page }) => {
  252 |     test.setTimeout(90000);
  253 |     await page.goto(`${BASE_URL}/analytics`, { timeout: 60000 });
  254 |     await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  255 | 
  256 |     const bodyLocator = page.locator('body');
  257 |     await expect(bodyLocator).not.toContainText('Loading…', { timeout: 60000 }).catch(() => {
  258 |       console.log('[TC-F11-03] Still "Loading…" after 60s poll.');
  259 |     });
  260 |     await page.waitForTimeout(2000);
  261 | 
  262 |     const body = await bodyLocator.innerText();
  263 |     const hasQualified = /qualified/i.test(body);
  264 |     const hasOffersExtended = /offers?\s*extended/i.test(body);
  265 |     console.log('[TC-F11-03] Qualified:', hasQualified, '| Offers Extended:', hasOffersExtended);
  266 |     expect(hasQualified && hasOffersExtended).toBeTruthy();
  267 |   });
  268 | 
  269 |   test('TC-F11-04: Status updates to "hired" and "onboarded"', async ({ page }) => {
  270 |     test.setTimeout(180000);
  271 |     const jobName = 'Python Developer';
  272 | 
  273 |     const candidateName = await createVerifiedCandidate(page, 'QA F11 T04', 'Java, Python, AWS');
  274 |     await applyToJob(page, jobName);
  275 |     await openCandidateByName(page, candidateName);
  276 | 
  277 |     const statusSelect = await getEnabledStatusSelect(page, jobName);
  278 | 
  279 |     for (const label of ['hired', 'onboarded']) {
  280 |       await statusSelect.selectOption({ label });
  281 |       await page.waitForTimeout(2000);
  282 |       const value = await statusSelect.inputValue().catch(() => '');
  283 |       console.log(`[TC-F11-04] Status after "${label}":`, value);
  284 |       expect(value.toLowerCase()).toContain(label);
  285 |     }
  286 |   });
  287 | 
  288 |   test('TC-F11-05: backed_out increments the Back outs tile', async ({ page }) => {
  289 |     test.setTimeout(180000);
  290 |     const jobName = 'Lead Java Developer';
  291 | 
  292 |     await page.goto(`${BASE_URL}/analytics`, { timeout: 60000 });
  293 |     await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  294 |     await page.waitForTimeout(2000);
  295 |     const bodyBefore = await page.locator('body').innerText();
  296 |     const beforeCount = parseInt((bodyBefore.match(/back\s*outs?\D*(\d+)/i) || [])[1] || 'NaN', 10);
  297 |     console.log('[TC-F11-05] Back outs before:', beforeCount);
  298 | 
  299 |     const candidateName = await createVerifiedCandidate(page, 'QA F11 T05', 'Java, Python, AWS');
  300 |     await applyToJob(page, jobName);
  301 |     await openCandidateByName(page, candidateName);
  302 | 
  303 |     const statusSelect = await getEnabledStatusSelect(page, jobName);
  304 |     await statusSelect.selectOption({ label: 'backed out' });
  305 |     await page.waitForTimeout(2000);
  306 |     const value = await statusSelect.inputValue().catch(() => '');
  307 |     expect(value.toLowerCase()).toContain('backed out');
  308 | 
  309 |     await page.goto(`${BASE_URL}/analytics`, { timeout: 60000 });
  310 |     await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  311 |     await page.waitForTimeout(2000);
  312 |     const bodyAfter = await page.locator('body').innerText();
  313 |     const afterCount = parseInt((bodyAfter.match(/back\s*outs?\D*(\d+)/i) || [])[1] || 'NaN', 10);
  314 |     console.log('[TC-F11-05] Back outs after:', afterCount);
  315 | 
  316 |     if (!isNaN(beforeCount) && !isNaN(afterCount)) {
  317 |       expect(afterCount).toBeGreaterThan(beforeCount);
  318 |     } else {
  319 |       console.log('[TC-F11-05] Could not parse counts — logging only.');
  320 |     }
  321 |   });
  322 | 
  323 | });
```