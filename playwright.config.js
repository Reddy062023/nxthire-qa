const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir:   '.',
  timeout:   120000,
  retries:   2,
  workers:   1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['allure-playwright', {
      outputFolder:        'allure-results',
      suiteTitle:          false,
      detail:              false,
      duplicateRemovedOn:  'retry',
    }]
  ],
  use: {
    baseURL:    'https://nxthire.ai',
    headless:   true,
    slowMo:     100,
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    trace:      'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    
  ],
});
