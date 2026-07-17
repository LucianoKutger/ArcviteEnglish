import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './e2e',

  fullyParallel: false,

  forbidOnly: Boolean(process.env.CI),

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : 2,

  projects: [
    {
      name: 'chromium',

      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',

      testMatch: /cross-browser\.spec\.js/,

      // Firefox can sporadically fail while Playwright removes an otherwise
      // successful test context. A retry uses a fresh worker/browser process.
      retries: process.env.CI ? 2 : 1,

      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',

      testMatch: /cross-browser\.spec\.js/,

      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],

  use: {
    baseURL,

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',
  },

  webServer: {
    command: 'npm run start -- --host 127.0.0.1 --strictPort',

    url: baseURL,

    reuseExistingServer: !process.env.CI,

    timeout: 120_000,

    stdout: 'ignore',

    stderr: 'pipe',
  },
});
