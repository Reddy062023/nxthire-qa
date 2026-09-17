// ============================================================
// edge-case-discovery.spec.js
// Walks every major page (recruiter + seeker), dumps every form
// field's constraints (type, maxlength, required, pattern, min/max)
// plus every button/link found, to a single JSON report.
// This tells us WHICH edge cases are worth testing per feature,
// instead of guessing blind.
//
// Run:  npx playwright test tests/edge-case-discovery.spec.js
// Output: audit-output/edge-case-inventory.json (also printed to console)
// ============================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://nxthire.ai';
const OUT_DIR = path.join(__dirname, '..', 'audit-output');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

test.describe.configure({ retries: 0 });

// Pages to inventory as the recruiter (Sundar's session, reuses whatever
// login pattern the other specs use — adjust if your login differs)
const RECRUITER_PAGES = [
  { name: 'candidates', url: '/candidates' },
  { name: 'open_jobs', url: '/open-jobs' },
  { name: 'interviews', url: '/interviews' },
  { name: 'sales_crm', url: '/crm' },
  { name: 'requirements', url: '/requirements' },
  { name: 'vendors', url: '/vendors' },
  { name: 'analytics', url: '/analytics' },
  { name: 'settings', url: '/settings' },
];

async function loginRecruiter(page) {
  await page.goto(`${BASE_URL}/candidates`, { timeout: 60000 });
  const loggedIn = await page.locator('button:has-text("New candidate")').first().isVisible().catch(() => false);
  if (!loggedIn) {
    await page.goto(`${BASE_URL}/login`, { timeout: 60000 });
    await page.fill('input[type="email"]', process.env.NXTHIRE_EMAIL);
    await page.fill('input[type="password"]', process.env.NXTHIRE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }
}

// Pulls every input/select/textarea's constraints from the current page,
// plus every visible button/link's accessible name.
async function inventoryPage(page) {
  return page.evaluate(() => {
    function fieldInfo(el) {
      return {
        tag: el.tagName.toLowerCase(),
        type: el.type || null,
        name: el.name || null,
        id: el.id || null,
        placeholder: el.placeholder || null,
        required: el.required || false,
        maxlength: el.maxLength && el.maxLength > 0 ? el.maxLength : null,
        minlength: el.minLength && el.minLength > 0 ? el.minLength : null,
        min: el.min || null,
        max: el.max || null,
        pattern: el.pattern || null,
        step: el.step || null,
        // nearest preceding text as a rough label guess
        nearbyText: (() => {
          let node = el.previousElementSibling;
          for (let i = 0; i < 3 && node; i++) {
            const t = node.textContent && node.textContent.trim();
            if (t && t.length < 60) return t;
            node = node.previousElementSibling;
          }
          const parent = el.closest('div');
          if (parent) {
            const label = parent.querySelector('label');
            if (label) return label.textContent.trim();
          }
          return null;
        })(),
      };
    }

    const fields = Array.from(document.querySelectorAll('input, select, textarea'))
      .filter(el => el.offsetParent !== null) // visible only
      .map(fieldInfo);

    const buttons = Array.from(document.querySelectorAll('button'))
      .filter(el => el.offsetParent !== null)
      .map(el => el.textContent.trim())
      .filter(t => t.length > 0 && t.length < 60);

    const links = Array.from(document.querySelectorAll('a'))
      .filter(el => el.offsetParent !== null)
      .map(el => ({ text: el.textContent.trim(), href: el.getAttribute('href') }))
      .filter(l => l.text.length > 0);

    return { fields, buttons: [...new Set(buttons)], links };
  });
}

test('Discover recruiter-side field constraints and actions', async ({ page }) => {
  test.setTimeout(180000);
  const report = { generated: new Date().toISOString(), recruiter: {}, seeker: {} };

  await loginRecruiter(page);

  for (const p of RECRUITER_PAGES) {
    try {
      await page.goto(`${BASE_URL}${p.url}`, { timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.locator('button:has-text("Dismiss")').first().click({ timeout: 2000 }).catch(() => {});
      const data = await inventoryPage(page);
      report.recruiter[p.name] = data;
      console.log(`[${p.name}] fields: ${data.fields.length}, buttons: ${data.buttons.length}, links: ${data.links.length}`);
    } catch (err) {
      report.recruiter[p.name] = { error: String(err) };
      console.log(`[${p.name}] ERROR:`, err.message);
    }
  }

  // Also open the "New candidate" modal specifically -- most edge-case-relevant form in the app
  try {
    await page.goto(`${BASE_URL}/candidates`, { timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("Dismiss")').first().click({ timeout: 2000 }).catch(() => {});
    await page.getByRole('button', { name: 'New candidate', exact: true }).click();
    await page.waitForTimeout(1500);
    const modalData = await inventoryPage(page);
    report.recruiter['new_candidate_modal'] = modalData;
    console.log(`[new_candidate_modal] fields: ${modalData.fields.length}`);
  } catch (err) {
    console.log('[new_candidate_modal] ERROR:', err.message);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'edge-case-inventory.json'), JSON.stringify(report, null, 2));
  console.log('\nFull report written to audit-output/edge-case-inventory.json');
});

test('Discover seeker-side field constraints', async ({ page }) => {
  test.setTimeout(60000);
  const report = { generated: new Date().toISOString(), seeker: {} };

  await page.goto(`${BASE_URL}/seeker-register`, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const regData = await inventoryPage(page);
  report.seeker['seeker_register'] = regData;
  console.log(`[seeker_register] fields: ${regData.fields.length}`);

  const outPath = path.join(OUT_DIR, 'edge-case-inventory-seeker.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('Seeker report written to audit-output/edge-case-inventory-seeker.json');
});