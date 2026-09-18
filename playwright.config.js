import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/archive/**'],
  timeout: 60000,
  retries: 1,
  reporter: [['list'], ['allure-playwright']],
  use: {
    baseURL: 'https://app.nxthire.ai',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    // Runs once before the main tests: logs in and saves the
    // authenticated session to playwright/.auth/user.json.
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Every test in this project starts already logged in,
        // reusing the session saved by the 'setup' project above —
        // instead of each test submitting the login form itself.
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});