import {devices, PlaywrightTestConfig} from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const CI = process.env.CI === 'true'

const config: PlaywrightTestConfig = {
  testDir: './tests',

  /* Maximum time one test can run for. */
  timeout: 30 * 1000,

  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: CI ? 20_000 : 5_000 // ms
  },

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!CI,

  /* Retry failed tests */
  retries: 2,

  /* Opt out of parallel tests on CI. */
  // workers: CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html']],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,

    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect traces for all tests, but only retain tests that failed. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',

      /* Project-specific settings. */
      use: {
        ...devices['Desktop Chrome']
      }
    }

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox']
    //   }
    // },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari']
    //   }
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5']
    //   }
    // },
    // MOBILE SAFARI TESTS HAVE BEEN FLAKY, REMOVING FOR NOW...
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12']
    //   }
    // }

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/'

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
}
export default config
