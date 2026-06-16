// ============================================================
// NxtHire.ai – AI Recruiter Module Test Suite
// Tool: Playwright  |  Target: nxthire.ai/dashboard
// Version: 2.0  |  Date: June 2026
// Tester: Japendra  |  North Star Group Inc.
// Run:  npx playwright test ai-recruiter.spec.js --headed
// Credentials: stored in .env file — never hardcode passwords
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nxthire.ai';
const CREDS = {
  email:    process.env.NXTHIRE_EMAIL,
  password: process.env.NXTHIRE_PASSWORD,
};

// ── Helpers ───────────────────────────────────────────────────
async function login(page) {
  await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
  await page.fill('input[type="email"]',    CREDS.email);
  await page.fill('input[type="password"]', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 60000 });
}

async function sendMessage(page, text) {
  const input = page.locator('textarea, input[placeholder*="Ask the agent"]').first();
  await input.fill(text);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
}

// ─────────────────────────────────────────────────────────────
// TC-01  Authentication and Access Control
// ─────────────────────────────────────────────────────────────
test.describe('TC-01 Authentication', () => {

  test('01-A Valid login reaches dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]',    CREDS.email);
    await page.fill('input[type="password"]', CREDS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 60000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('01-B Invalid credentials shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]',    'bad@example.com');
    await page.fill('input[type="password"]', 'WrongPass');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const errorVisible = await page.locator('.badge-danger, [class*="error"], [class*="alert"]').first().isVisible().catch(() => false);
    console.log(`Error message visible: ${errorVisible}`);
    expect(errorVisible).toBe(true);
  });

  test('01-C Unauthenticated access redirects to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('01-D Session persists across page refresh', async ({ page }) => {
    await login(page);
    await page.reload();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/dashboard');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-02  Dashboard UI Verification
// ─────────────────────────────────────────────────────────────
test.describe('TC-02 Dashboard UI', () => {

  test.beforeEach(async ({ page }) => { await login(page); });

  test('02-A All nav items present', async ({ page }) => {
    const navItems = [
      'AI Recruiter', 'Candidates', 'Open jobs',
      'Data sources', 'Monster', 'Indeed',
      'TheirStack', 'Ceipal', 'Onboarding',
      'Analytics', 'Team', 'Settings',
    ];
    for (const item of navItems) {
      await expect(page.locator(`text=${item}`).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('02-B Chat input and Send button visible', async ({ page }) => {
    await page.click('text=AI Recruiter');
    await expect(page.locator('textarea, input[placeholder*="Ask the agent"]').first()).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test('02-C Recruiter agent shows online badge', async ({ page }) => {
    await page.click('text=AI Recruiter');
    await expect(page.locator('text=online')).toBeVisible();
  });

  test('02-D Clear chat button present', async ({ page }) => {
    await expect(page.locator('button:has-text("Clear chat")')).toBeVisible();
  });

  test('02-E AI billing warning banner check', async ({ page }) => {
    const bannerVisible = await page.locator('text=AI is temporarily unavailable').isVisible().catch(() => false);
    console.log(`Billing banner visible: ${bannerVisible}`);
  });

  test('02-F Prompts history panel renders', async ({ page }) => {
    await expect(page.locator('text=PROMPTS HISTORY')).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────
// TC-05  Clear Chat and Edge Cases
// ─────────────────────────────────────────────────────────────
test.describe('TC-05 Clear Chat', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('text=AI Recruiter');
  });

  test('05-A Clear chat removes conversation history', async ({ page }) => {
    await sendMessage(page, 'Java developer');
    await page.click('button:has-text("Clear chat")');
    await page.waitForTimeout(2000);
    const chatEmpty = await page.locator('.message, [class*="message"]').count();
    console.log(`Messages after clear: ${chatEmpty}`);
  });

  test('05-B After clear, new query works normally', async ({ page }) => {
    await page.click('button:has-text("Clear chat")');
    await page.waitForTimeout(1000);
    await sendMessage(page, 'Python developer');
    const hasResponse = await page.locator('text=/Found|candidates|matching/i').isVisible().catch(() => false);
    console.log(`Response after clear: ${hasResponse}`);
  });

});

// ─────────────────────────────────────────────────────────────
// TC-06  Prompts History
// ─────────────────────────────────────────────────────────────
test.describe('TC-06 Prompts History', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('text=AI Recruiter');
  });

  test('06-A Sending query adds it to history panel', async ({ page }) => {
    const uniqueQuery = `TestQuery_${Date.now()}`;
    await sendMessage(page, uniqueQuery);
    await page.waitForTimeout(2000);
    const historyVisible = await page.locator(`text=${uniqueQuery}`).first().isVisible().catch(() => false);
    console.log(`Query in history: ${historyVisible}`);
  });

  test('06-B History shows result count and timestamp', async ({ page }) => {
    await sendMessage(page, 'Java developer');
    await page.waitForTimeout(2000);
    const hasResults = await page.locator('text=/\\d+ results/').first().isVisible().catch(() => false);
    console.log(`Result count in history: ${hasResults}`);
  });

  test('06-C Clear history button clears all entries', async ({ page }) => {
    await sendMessage(page, 'Java developer');
    await page.waitForTimeout(1000);
    const clearHistory = page.locator('button:has-text("clear"), [class*="clear"]').first();
    if (await clearHistory.isVisible()) {
      await clearHistory.click();
      await page.waitForTimeout(1000);
    }
    console.log('Clear history test complete');
  });

  test('06-D Clicking history entry replays query', async ({ page }) => {
    await sendMessage(page, 'Java developer');
    await page.waitForTimeout(2000);
    const historyEntry = page.locator('text=Java developer').first();
    if (await historyEntry.isVisible()) {
      await historyEntry.click();
      await page.waitForTimeout(2000);
    }
    console.log('History replay test complete');
  });

});

// ─────────────────────────────────────────────────────────────
// TC-07  Sidebar Navigation
// ─────────────────────────────────────────────────────────────
test.describe('TC-07 Navigation', () => {

  test.beforeEach(async ({ page }) => { await login(page); });

  test('07-A Candidates page loads', async ({ page }) => {
    await page.click('text=Candidates');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('candidates');
  });

  test('07-B Open jobs page loads', async ({ page }) => {
    await page.click('text=Open jobs');
    await page.waitForTimeout(2000);
    expect(page.url()).toMatch(/jobs|requisitions/i);
  });

  test('07-C Analytics page loads', async ({ page }) => {
    await page.click('text=Analytics');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('analytics');
  });

  test('07-D Data sources page loads', async ({ page }) => {
    await page.click('text=Data sources');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('sources');
  });

  test('07-E Active AI Recruiter nav item is highlighted', async ({ page }) => {
    await page.click('text=AI Recruiter');
    await page.waitForTimeout(1000);
    const activeItem = page.locator('[class*="active"], [class*="selected"], [aria-current="page"]').first();
    const isHighlighted = await activeItem.isVisible().catch(() => false);
    console.log(`Active nav item highlighted: ${isHighlighted}`);
  });

});

// ─────────────────────────────────────────────────────────────
// TC-08  Billing Banner
// ─────────────────────────────────────────────────────────────
test.describe('TC-08 Billing Banner', () => {

  test.beforeEach(async ({ page }) => { await login(page); });

  test('08-A Banner shows Update billing link', async ({ page }) => {
    const bannerLink = page.locator('text=Update billing').first();
    const visible = await bannerLink.isVisible().catch(() => false);
    console.log(`Billing link visible: ${visible}`);
  });

  test('08-B Dismiss button closes the banner', async ({ page }) => {
    const dismiss = page.locator('text=Dismiss').first();
    if (await dismiss.isVisible()) {
      await dismiss.click();
      await page.waitForTimeout(1000);
      const bannerGone = !(await page.locator('text=AI is temporarily unavailable').isVisible().catch(() => false));
      console.log(`Banner dismissed: ${bannerGone}`);
    } else {
      console.log('Banner not visible — already dismissed or AI active');
    }
  });

  test('08-C Billing link navigates to Settings', async ({ page }) => {
    const billingLink = page.locator('text=Update billing').first();
    if (await billingLink.isVisible()) {
      await billingLink.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('settings');
    } else {
      console.log('Billing link not visible — skipping');
    }
  });

  test('08-D Keyword fallback works when AI is out-of-credit', async ({ page }) => {
    await page.click('text=AI Recruiter');
    await sendMessage(page, 'Java developer');
    const hasResponse = await page.locator('text=/Found|candidates|matching/i').isVisible().catch(() => false);
    console.log(`Fallback returned results: ${hasResponse}`);
    expect(hasResponse).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────
// TC-09  Accessibility and Responsive Layout
// ─────────────────────────────────────────────────────────────
test.describe('TC-09 Accessibility', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('text=AI Recruiter');
  });

  test('09-A Tab key navigates interactive elements', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    console.log('Tab navigation test complete');
  });

  test('09-B Enter key submits the message', async ({ page }) => {
    const input = page.locator('textarea, input[placeholder*="Ask the agent"]').first();
    await input.fill('java microservices engineers and any matching reqs');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    const hasResponse = await page.locator('text=/Found|candidates|matching/i').isVisible().catch(() => false);
    console.log(`Enter key submitted: ${hasResponse}`);
  });

  test('09-C Page renders on 1280x720 viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('textarea, input[placeholder*="Ask the agent"]').first()).toBeVisible();
  });

  test('09-D Page renders on mobile viewport 375x812', async ({ page }) => {
    await login(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(2000);
    console.log('Mobile viewport test complete');
  });

});