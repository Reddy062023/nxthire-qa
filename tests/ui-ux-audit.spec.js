// ============================================================
// ui-ux-audit.spec.js
// Nxthire.ai - UI/UX Visual Design Audit
//
// Uses the existing authenticated Playwright session.
// Does NOT modify or replace existing feature tests.
//
// Run:
//   npx playwright test tests/ui-ux-audit.spec.js
//
// Output:
//   ./audit-output/ui-ux/
//     screenshots/
//     ui-analysis.json
//     summary.json
// ============================================================

const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(
  process.cwd(),
  'audit-output',
  'ui-ux'
);

const SCREENSHOT_DIR = path.join(
  OUTPUT_DIR,
  'screenshots'
);

// Pages we want to review.
// We will start with known application routes.
const PAGES = [
  {
    name: 'dashboard',
    url: '/dashboard'
  },
  {
    name: 'candidates',
    url: '/candidates'
  },
  {
    name: 'jobs',
    url: '/jobs'
  },
  {
    name: 'analytics',
    url: '/analytics'
  },
  {
    name: 'data-sources',
    url: '/data-sources'
  }
];

function unique(values) {
  return [...new Set(
    values
      .map(v => String(v || '').trim())
      .filter(Boolean)
  )];
}

test.describe('Nxthire UI/UX Design Audit', () => {

  test('Capture and analyze application UI', async ({ page }) => {

    test.setTimeout(300000);

    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

    const results = [];

    console.log('\n==========================================');
    console.log(' Nxthire.ai UI/UX AUDIT');
    console.log('==========================================\n');

    for (const pageInfo of PAGES) {

      console.log(`\nAuditing: ${pageInfo.name}`);
      console.log(`URL: ${pageInfo.url}`);

      try {

        await page.goto(pageInfo.url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });

        await page.waitForTimeout(2500);

        // ----------------------------------------------------
        // BASIC PAGE INFORMATION
        // ----------------------------------------------------

        const title = await page.title();

        const currentUrl = page.url();

        const viewport = page.viewportSize();

        const bodyText = await page.locator('body').innerText()
          .catch(() => '');

        // ----------------------------------------------------
        // HEADINGS
        // ----------------------------------------------------

        const headings = await page.locator(
          'h1, h2, h3, h4, h5, h6'
        ).allInnerTexts();

        // ----------------------------------------------------
        // BUTTONS
        // ----------------------------------------------------

        const buttons = await page.locator(
          'button, [role="button"]'
        ).evaluateAll(elements =>
          elements.map(el => ({
            text: (el.innerText || el.getAttribute('aria-label') || '').trim(),
            visible: !!(
              el.offsetWidth ||
              el.offsetHeight ||
              el.getClientRects().length
            ),
            disabled: !!el.disabled
          }))
        ).catch(() => []);

        // ----------------------------------------------------
        // LINKS
        // ----------------------------------------------------

        const links = await page.locator('a').evaluateAll(elements =>
          elements.map(el => ({
            text: (el.innerText || '').trim(),
            href: el.getAttribute('href')
          }))
        ).catch(() => []);

        // ----------------------------------------------------
        // FORM ELEMENTS
        // ----------------------------------------------------

        const inputs = await page.locator(
          'input, textarea, select'
        ).evaluateAll(elements =>
          elements.map(el => ({
            tag: el.tagName.toLowerCase(),
            type: el.getAttribute('type'),
            placeholder: el.getAttribute('placeholder'),
            ariaLabel: el.getAttribute('aria-label'),
            name: el.getAttribute('name'),
            required: !!el.required
          }))
        ).catch(() => []);

        // ----------------------------------------------------
        // TABLES
        // ----------------------------------------------------

        const tables = await page.locator('table').evaluateAll(
          tables =>
            tables.map(table => ({
              rows: table.querySelectorAll('tr').length,
              columns: table.querySelectorAll('tr:first-child th, tr:first-child td').length
            }))
        ).catch(() => []);

        // ----------------------------------------------------
        // CARDS
        // ----------------------------------------------------

        const cardCount = await page.locator(
          '[class*="card"], [class*="Card"]'
        ).count().catch(() => 0);

        // ----------------------------------------------------
        // IMAGES
        // ----------------------------------------------------

        const images = await page.locator('img').evaluateAll(
          elements =>
            elements.map(img => ({
              src: img.getAttribute('src'),
              alt: img.getAttribute('alt'),
              width: img.naturalWidth,
              height: img.naturalHeight
            }))
        ).catch(() => []);

        const imagesWithoutAlt = images.filter(
          img => !img.alt
        ).length;

        const brokenImages = images.filter(
          img => img.src && img.width === 0
        ).length;

        // ----------------------------------------------------
        // FONT INFORMATION
        // ----------------------------------------------------

        const fonts = await page.locator('body').evaluate(el => {
          const style = window.getComputedStyle(el);

          return {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            color: style.color,
            backgroundColor: style.backgroundColor
          };
        }).catch(() => ({}));

        // ----------------------------------------------------
        // COLOR / VISUAL INFORMATION
        // ----------------------------------------------------

        const visualInfo = await page.evaluate(() => {

          const elements = Array.from(
            document.querySelectorAll(
              'body, header, nav, main, section, button, input, table, th, td'
            )
          );

          const colors = {};

          for (const element of elements) {

            const style = window.getComputedStyle(element);

            const values = [
              style.color,
              style.backgroundColor,
              style.borderColor
            ];

            for (const value of values) {

              if (!value || value === 'rgba(0, 0, 0, 0)') {
                continue;
              }

              colors[value] = (colors[value] || 0) + 1;
            }
          }

          return colors;
        }).catch(() => ({}));

        // ----------------------------------------------------
        // NAVIGATION
        // ----------------------------------------------------

        const navigation = await page.locator(
          'nav, aside'
        ).evaluateAll(elements =>
          elements.map(el => ({
            text: (el.innerText || '').trim().substring(0, 2000)
          }))
        ).catch(() => []);

        // ----------------------------------------------------
        // ACCESSIBILITY BASICS
        // ----------------------------------------------------

        const accessibility = await page.evaluate(() => {

          const buttons = Array.from(
            document.querySelectorAll('button, [role="button"]')
          );

          const images = Array.from(
            document.querySelectorAll('img')
          );

          const inputs = Array.from(
            document.querySelectorAll('input, textarea, select')
          );

          return {

            buttonsWithoutAccessibleName:
              buttons.filter(el =>
                !(
                  (el.innerText || '').trim() ||
                  el.getAttribute('aria-label') ||
                  el.getAttribute('title')
                )
              ).length,

            imagesWithoutAlt:
              images.filter(el =>
                !el.getAttribute('alt')
              ).length,

            inputsWithoutLabel:
              inputs.filter(el => {

                const id = el.getAttribute('id');

                if (id && document.querySelector(
                  `label[for="${id}"]`
                )) {
                  return false;
                }

                if (
                  el.getAttribute('aria-label') ||
                  el.getAttribute('placeholder')
                ) {
                  return false;
                }

                return true;
              }).length
          };

        }).catch(() => ({}));

        // ----------------------------------------------------
        // SCREENSHOT
        // ----------------------------------------------------

        const screenshotPath = path.join(
          SCREENSHOT_DIR,
          `${pageInfo.name}.png`
        );

        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        }).catch(() => {});

        // ----------------------------------------------------
        // BUILD RECORD
        // ----------------------------------------------------

        const record = {

          page: pageInfo.name,

          requestedUrl: pageInfo.url,

          actualUrl: currentUrl,

          title,

          viewport,

          pageHeight: await page.evaluate(
            () => document.documentElement.scrollHeight
          ).catch(() => null),

          pageWidth: await page.evaluate(
            () => document.documentElement.scrollWidth
          ).catch(() => null),

          bodyTextLength: bodyText.length,

          headings: unique(headings),

          buttons,

          links,

          inputs,

          tables,

          cardCount,

          images,

          imagesWithoutAlt,

          brokenImages,

          fonts,

          visualInfo,

          navigation,

          accessibility,

          screenshot: `screenshots/${pageInfo.name}.png`
        };

        results.push(record);

        console.log(
          `  ✓ ${pageInfo.name} captured`
        );

        console.log(
          `    Headings: ${record.headings.length}`
        );

        console.log(
          `    Buttons: ${record.buttons.length}`
        );

        console.log(
          `    Inputs: ${record.inputs.length}`
        );

        console.log(
          `    Tables: ${record.tables.length}`
        );

        console.log(
          `    Cards: ${record.cardCount}`
        );

      } catch (error) {

        console.log(
          `  ✗ ${pageInfo.name} failed: ${error.message}`
        );

        results.push({
          page: pageInfo.name,
          requestedUrl: pageInfo.url,
          error: error.message
        });
      }
    }

    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    const summary = results.map(r => ({
      page: r.page,
      url: r.actualUrl || r.requestedUrl,
      title: r.title || '',
      headings: r.headings?.length || 0,
      buttons: r.buttons?.length || 0,
      inputs: r.inputs?.length || 0,
      tables: r.tables?.length || 0,
      cards: r.cardCount || 0,
      images: r.images?.length || 0,
      imagesWithoutAlt: r.imagesWithoutAlt || 0,
      brokenImages: r.brokenImages || 0,
      screenshot: r.screenshot || '',
      error: r.error || ''
    }));

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'ui-analysis.json'),
      JSON.stringify(results, null, 2)
    );

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('\n==========================================');
    console.log(' UI/UX AUDIT COMPLETE');
    console.log('==========================================');

    console.log(
      `\nResults: ${OUTPUT_DIR}`
    );

    console.log(
      `Screenshots: ${SCREENSHOT_DIR}`
    );

    console.log('\n');
  });

});