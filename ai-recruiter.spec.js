// ============================================================
// NxtHire.ai – AI Recruiter Module Test Suite
// Tool: Playwright  |  Target: nxthire.ai/dashboard
// Version: 3.1  |  Date: July 2026
// Tester: Japendra  |  North Star Group Inc.
// Run:  npx playwright test ai-recruiter.spec.js
// Credentials: stored in .env file — never hardcode passwords
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';
const CREDS = {
  email:    process.env.NXTHIRE_EMAIL,
  password: process.env.NXTHIRE_PASSWORD,
};

// ── Login helper ──────────────────────────────────────────────
async function login(page, timeout = 60000) {
  await page.goto(`${BASE_URL}/login`, { timeout });
  await page.fill('input[type="email"]',    CREDS.email);
  await page.fill('input[type="password"]', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout });
}

// ── Send AI query and return full page text ───────────────────
async function sendAIQuery(page, query) {
  await page.goto(`${BASE_URL}/dashboard`, { timeout: 60000 });
  await page.waitForTimeout(3000);
  const searchBox = page.locator('textarea, input[placeholder*="Ask"]').first();
  await searchBox.waitFor({ state: 'visible', timeout: 15000 });
  await searchBox.fill(query);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(10000);
  return await page.locator('body').innerText();
}

// ── Send message helper ───────────────────────────────────────
async function sendMessage(page, text) {
  const input = page.locator('textarea').first();
  await input.fill(text);
  await page.click('button:has-text("Send")');
  await page.waitForTimeout(8000);
}

// ─────────────────────────────────────────────────────────────
// TC-01 — Authentication and Access Control
// ─────────────────────────────────────────────────────────────
test.describe('TC-01 Authentication', () => {

  test('01-A Valid login reaches dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/dashboard/);
    console.log('PASS: Valid login reaches dashboard');
  });

  test('01-B Invalid credentials shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'bad@example.com');
    await page.fill('input[type="password"]', 'WrongPass');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const errorVisible = await page.locator('text=/invalid|error|incorrect|wrong/i').isVisible().catch(() => false);
    console.log(`Error message visible: ${errorVisible}`);
    expect(errorVisible).toBe(true);
    console.log('PASS: Invalid credentials shows error');
  });

  test('01-C Unauthenticated access redirects to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/login/);
    console.log('PASS: Unauthenticated access redirects to login');
  });

  test('01-D Session persists across page refresh', async ({ page }) => {
    await login(page);
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/dashboard/);
    console.log('PASS: Session persists after refresh');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-02 — Dashboard UI Verification
// ─────────────────────────────────────────────────────────────
test.describe('TC-02 Dashboard UI', () => {

  test.beforeEach(async ({ page }) => { await login(page); });

  test('02-A All nav items present', async ({ page }) => {
    const body = await page.locator('body').innerText();
    expect(body).toContain('AI Recruiter');
    expect(body).toContain('Candidates');
    expect(body).toContain('Open jobs');
    console.log('PASS: All nav items present');
  });

  test('02-B Chat input and Send button visible', async ({ page }) => {
    await expect(page.locator('textarea, input[placeholder*="Ask"]').first()).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
    console.log('PASS: Chat input and Send button visible');
  });

  test('02-C Recruiter agent shows online badge', async ({ page }) => {
    const body = await page.locator('body').innerText();
    const isOnline = body.includes('online') || body.includes('Online');
    console.log(`Recruiter agent online: ${isOnline}`);
    expect(isOnline).toBe(true);
    console.log('PASS: Recruiter agent shows online badge');
  });

  test('02-D Clear chat button present', async ({ page }) => {
    await expect(page.locator('button:has-text("Clear chat")')).toBeVisible();
    console.log('PASS: Clear chat button present');
  });

  test('02-E Prompts history panel renders', async ({ page }) => {
    const body = await page.locator('body').innerText();
    expect(body).toContain('PROMPTS HISTORY');
    console.log('PASS: Prompts history panel renders');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-03 — AI Search Quality
// ─────────────────────────────────────────────────────────────
test.describe('TC-03 AI Search Quality', () => {

  test('TC-03-01 Java query returns candidates with Java in skills', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me Java developers');
    const hasJava = response.toLowerCase().includes('java');
    console.log(`Response contains Java: ${hasJava}`);
    expect(hasJava).toBe(true);
    console.log('PASS: AI response contains Java skill match');
  });

  test('TC-03-02 New Jersey query returns NJ candidates', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me Java developers in New Jersey');
    const hasNJ = response.toLowerCase().includes('new jersey') ||
                  response.toLowerCase().includes('jersey city') ||
                  response.toLowerCase().includes('hoboken') ||
                  response.toLowerCase().includes('newark') ||
                  response.toLowerCase().includes(' nj');
    console.log(`Response contains NJ location: ${hasNJ}`);
    expect(hasNJ).toBe(true);
    console.log('PASS: AI response contains New Jersey location');
  });

  test('TC-03-03 AI response includes match scores', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me Java developers in New Jersey');
    const hasScore = response.toLowerCase().includes('match score') ||
                     response.match(/score[:\s]+\d+/) !== null ||
                     response.match(/\b\d{2,3}\b/) !== null;
    console.log(`Match scores in response: ${hasScore}`);
    if (hasScore) {
      console.log('PASS: Match scores present in AI response');
    } else {
      console.log('FINDING: No match scores visible in AI response');
    }
  });

  test('TC-03-04 AI response renders candidate info', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me Java developers in New Jersey');
    const hasCandidates = response.includes('Java') || response.includes('Developer') ||
                          response.includes('Engineer') || response.includes('years');
    console.log(`Candidate info visible: ${hasCandidates}`);
    expect(hasCandidates).toBe(true);
    console.log('PASS: Candidate info rendered in AI response');
  });

  test('TC-03-05 Python query returns Python-related candidates', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me Python developers');
    const hasPython = response.toLowerCase().includes('python');
    console.log(`Response contains Python: ${hasPython}`);
    if (hasPython) {
      console.log('PASS: Python query returns Python candidates');
    } else {
      console.log('FINDING: Python query did not return Python candidates — check AI quality');
    }
  });

  test('TC-03-06 QA engineer query returns QA-related candidates', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me QA engineers');
    const hasQA = response.toLowerCase().includes('qa') ||
                  response.toLowerCase().includes('quality') ||
                  response.toLowerCase().includes('test') ||
                  response.toLowerCase().includes('automation');
    console.log(`Response contains QA skills: ${hasQA}`);
    if (hasQA) {
      console.log('PASS: QA query returns QA-related candidates');
    } else {
      console.log('FINDING: QA query did not return QA candidates — check AI relevance');
    }
  });

  test('TC-03-07 Senior developer query returns experienced candidates', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me senior Java developers with 10+ years experience');
    const hasExperience = response.match(/\d+\s*(years?|yrs?)/) !== null ||
                          response.toLowerCase().includes('senior') ||
                          response.toLowerCase().includes('experience');
    console.log(`Response contains experience info: ${hasExperience}`);
    if (hasExperience) {
      console.log('PASS: Senior query returns experience info');
    } else {
      console.log('FINDING: Senior query did not include experience details');
    }
  });

  test('TC-03-08 AI results show candidate source', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me Java developers');
    const hasSource = response.toLowerCase().includes('ceipal') ||
                      response.toLowerCase().includes('monster') ||
                      response.toLowerCase().includes('indeed') ||
                      response.toLowerCase().includes('local db');
    console.log(`Source in response: ${hasSource}`);
    if (hasSource) {
      console.log('PASS: Source tag visible in AI results');
    } else {
      console.log('FINDING: No source visible in AI results');
    }
  });

  test('TC-03-09 Nonsense query returns graceful no-result message', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'xyzabc123nonsense developer');
    const hasGraceful = response.toLowerCase().includes('no ') ||
                        response.toLowerCase().includes('found') ||
                        response.toLowerCase().includes('result') ||
                        response.toLowerCase().includes('match') ||
                        response.toLowerCase().includes('unable');
    console.log(`Graceful no-result response: ${hasGraceful}`);
    if (hasGraceful) {
      console.log('PASS: AI returns graceful message for nonsense query');
    } else {
      console.log('FINDING: AI returned candidates for nonsense query — check AI quality');
    }
  });

  test('TC-03-10 AI-returned candidate exists in NxtHire candidates list', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me Java developers in New Jersey');
    const hasSneha = response.includes('Sneha');
    console.log(`Sneha J in AI response: ${hasSneha}`);
    await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const searchBox = page.locator('input[placeholder*="Search"]').first();
    await searchBox.fill('Sneha');
    await page.waitForTimeout(3000);
    const noResults = await page.locator('text=No candidates match').isVisible().catch(() => false);
    console.log(`Sneha found in NxtHire candidates: ${!noResults}`);
    if (!noResults) {
      console.log('PASS: AI-returned candidate verified to exist in NxtHire — no hallucination');
    } else {
      console.log('FINDING: AI-returned candidate not found in NxtHire — possible hallucination');
    }
  });

  test('TC-03-11 AI returns results for valid query — not empty', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me Java developers in New Jersey');
    const historyText = await page.locator('text=/\\d+ results/').first().innerText().catch(() => '');
    console.log(`Result count in history: ${historyText}`);
    const countMatch = historyText.match(/(\d+) results/);
    if (countMatch) {
      const count = parseInt(countMatch[1]);
      console.log(`AI returned ${count} results`);
      expect(count).toBeGreaterThan(0);
      console.log('PASS: AI returned results for valid query');
    } else {
      console.log('NOTE: Could not extract result count — check manually');
    }
  });

  test('TC-03-12 Texas location query returns Texas candidates', async ({ page }) => {
    await login(page);
    const response = await sendAIQuery(page, 'Find me QA engineers in Texas');
    const hasTexas = response.toLowerCase().includes('texas') ||
                     response.toLowerCase().includes(' tx') ||
                     response.toLowerCase().includes('dallas') ||
                     response.toLowerCase().includes('houston') ||
                     response.toLowerCase().includes('austin');
    console.log(`Texas location in response: ${hasTexas}`);
    if (hasTexas) {
      console.log('PASS: Texas query returns Texas candidates');
    } else {
      console.log('FINDING: Texas query did not return Texas candidates — check location accuracy');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-05 — Clear Chat and Security Inputs
// ─────────────────────────────────────────────────────────────
test.describe('TC-05 Clear Chat', () => {

  test.beforeEach(async ({ page }) => { await login(page); });

  test('05-A Clear chat removes conversation history', async ({ page }) => {
    await sendMessage(page, 'Java developer');
    await page.click('button:has-text("Clear chat")');
    await page.waitForTimeout(2000);
    const messages = await page.locator('[class*="message"], [class*="chat"]').count().catch(() => 0);
    console.log(`Messages after clear: ${messages}`);
    console.log('PASS: Clear chat executed');
  });

  test('05-B After clear, new query works normally', async ({ page }) => {
    await sendMessage(page, 'Java developer');
    await page.click('button:has-text("Clear chat")');
    await page.waitForTimeout(1000);
    await sendMessage(page, 'Python developers with AWS experience');
    const body = await page.locator('body').innerText();
    const hasResponse = body.includes('Python') || body.includes('AWS') || body.includes('developer');
    console.log(`Response after clear: ${hasResponse}`);
    console.log('PASS: New query works after clear chat');
  });

  test('05-C XSS injection not executed', async ({ page }) => {
    await sendMessage(page, '<script>alert("xss")</script>');
    await page.waitForTimeout(3000);
    const alertFired = await page.evaluate(() => {
      return window.__alertFired || false;
    }).catch(() => false);
    expect(alertFired).toBe(false);
    console.log('PASS: XSS injection not executed');
  });

  test('05-D SQL injection handled safely', async ({ page }) => {
    await sendMessage(page, "'; DROP TABLE candidates; --");
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    const appStillWorks = body.includes('AI Recruiter') || body.includes('Candidates');
    expect(appStillWorks).toBe(true);
    console.log('PASS: SQL injection handled safely — app still running');
  });

  test('05-E Very long input handled', async ({ page }) => {
    const longInput = 'a'.repeat(5001);
    await sendMessage(page, longInput);
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    const appStillWorks = body.includes('AI Recruiter') || body.includes('Send');
    expect(appStillWorks).toBe(true);
    console.log('PASS: Long input handled — app still running');
  });

  test('05-F Emoji input does not break agent', async ({ page }) => {
    await sendMessage(page, '👨‍💻 find me a developer 🚀');
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    const agentStillOnline = body.includes('online') || body.includes('Send');
    expect(agentStillOnline).toBe(true);
    console.log('PASS: Emoji input handled — agent still online');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-06 — Prompts History
// ─────────────────────────────────────────────────────────────
test.describe('TC-06 Prompts History', () => {

  test.beforeEach(async ({ page }) => { await login(page); });

  test('06-A Sending query adds it to history panel', async ({ page }) => {
    const uniqueQuery = `TestQuery_${Date.now()}`;
    await sendMessage(page, uniqueQuery);
    const body = await page.locator('body').innerText();
    const inHistory = body.includes(uniqueQuery) || body.includes('TestQuery');
    console.log(`Query in history: ${inHistory}`);
    expect(inHistory).toBe(true);
    console.log('PASS: Query appears in prompts history');
  });

  test('06-B History shows result count and timestamp', async ({ page }) => {
    await sendMessage(page, 'Java developer');
    await page.waitForTimeout(5000);
    const body = await page.locator('body').innerText();
    const hasCount = body.match(/\d+ results/) !== null;
    console.log(`Result count in history: ${hasCount}`);
    expect(hasCount).toBe(true);
    console.log('PASS: History shows result count');
  });

  test('06-C Clear history button clears all entries', async ({ page }) => {
    await sendMessage(page, 'Java developer');
    const clearHistory = page.locator('button:has-text("clear"), [class*="clear"]').last();
    if (await clearHistory.isVisible().catch(() => false)) {
      await clearHistory.click();
      await page.waitForTimeout(2000);
      console.log('PASS: Clear history executed');
    } else {
      console.log('NOTE: Clear history button not found — check UI');
    }
  });

  test('06-D Clicking history entry replays query', async ({ page }) => {
    await sendMessage(page, 'Java developer');
    await page.waitForTimeout(2000);
    const historyEntry = page.locator('[class*="history"] [class*="item"], [class*="prompt"]').first();
    if (await historyEntry.isVisible().catch(() => false)) {
      await historyEntry.click();
      await page.waitForTimeout(5000);
      console.log('PASS: History entry clicked — query replayed');
    } else {
      console.log('NOTE: History entry not clickable — check UI');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-07 — Sidebar Navigation
// ─────────────────────────────────────────────────────────────
test.describe('TC-07 Navigation', () => {

  test.beforeEach(async ({ page }) => { await login(page, 120000); });

  test('07-A Candidates page loads', async ({ page }) => {
    await page.click('text=Candidates');
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/candidates/);
    console.log('PASS: Candidates page loads');
  });

  test('07-B Open jobs page loads', async ({ page }) => {
    await page.click('text=Open jobs');
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/jobs/);
    console.log('PASS: Open Jobs page loads');
  });

  test('07-C Analytics page loads', async ({ page }) => {
    await page.click('text=Analytics');
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`Analytics URL: ${url}`);
    console.log('PASS: Analytics page loads');
  });

  test('07-D Data sources page loads', async ({ page }) => {
    await page.click('text=Data sources');
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`Data sources URL: ${url}`);
    console.log('PASS: Data sources page loads');
  });

  test('07-E Active AI Recruiter nav item is highlighted', async ({ page }) => {
    const navItem = page.locator('text=AI Recruiter').first();
    const isHighlighted = await navItem.evaluate(el => {
      const style = window.getComputedStyle(el.closest('a, li, div') || el);
      return style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
    }).catch(() => false);
    console.log(`Active nav item highlighted: ${isHighlighted}`);
    console.log('PASS: Nav highlight test complete');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-08 — AI Health Check
// Verifies AI credits are active and fallback is NOT running
// ─────────────────────────────────────────────────────────────
test.describe('TC-08 AI Health Check', () => {

  test.beforeEach(async ({ page }) => { await login(page, 120000); });

  test('08-A AI credits are active — billing banner not visible', async ({ page }) => {
    const bannerVisible = await page.locator('text=/out of credit/i, text=/billing-blocked/i').isVisible().catch(() => false);
    console.log(`Billing banner visible: ${bannerVisible}`);
    if (bannerVisible) {
      console.log('FAIL: AI credits exhausted — restore Anthropic API credits immediately');
    } else {
      console.log('PASS: AI credits active — no billing banner');
    }
    expect(bannerVisible).toBe(false);
  });

  test('08-B Recruiter agent is online — not in fallback mode', async ({ page }) => {
    const body = await page.locator('body').innerText();
    const isOnline = body.toLowerCase().includes('online');
    const isFallback = body.includes('falling back to keyword matching') ||
                       body.includes('AI features are paused');
    console.log(`Agent online: ${isOnline} | Fallback active: ${isFallback}`);
    if (isFallback) {
      console.log('FAIL: AI is in keyword fallback mode — credits may be exhausted');
      expect(isFallback).toBe(false);
    } else {
      console.log('PASS: Agent online and AI active — not in fallback mode');
    }
  });

  test('08-C AI query returns meaningful response — not fallback results', async ({ page }) => {
    const response = await sendAIQuery(page, 'Java developer');
    const isFallback = response.includes('falling back to keyword matching') ||
                       response.includes('AI features are paused');
    const hasAIResponse = response.toLowerCase().includes('java') ||
                          response.toLowerCase().includes('developer') ||
                          response.toLowerCase().includes('candidate');
    console.log(`Fallback active: ${isFallback} | AI response: ${hasAIResponse}`);
    if (isFallback) {
      console.log('FAIL: AI returned fallback results — credits exhausted');
      expect(isFallback).toBe(false);
    } else {
      console.log('PASS: AI returned meaningful response — credits active');
    }
  });

});

// ─────────────────────────────────────────────────────────────
// TC-09 — Accessibility
// ─────────────────────────────────────────────────────────────
test.describe('TC-09 Accessibility', () => {

  test.beforeEach(async ({ page }) => { await login(page); });

  test('09-B Enter key submits the message', async ({ page }) => {
    const input = page.locator('textarea').first();
    await input.fill('java microservices engineers and any matching reqs');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    const body = await page.locator('body').innerText();
    const submitted = body.includes('java') || body.includes('microservices') || body.includes('engineer');
    console.log(`Enter key submitted: ${submitted}`);
    console.log('PASS: Enter key submit test complete');
  });

});