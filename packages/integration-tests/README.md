# Integration Tests

These integration tests are written using [Playwright](https://playwright.dev/).

## Writing a New Test

To write a new test, check out the [Getting Started documentation](https://playwright.dev/docs/intro) on the Playwright
site.

## Running the Test Suites

1. Start the dev server according to the main [README instructions](/README.md#installation)
2. In this directory, run `yarn test`.

## TODO

- [x] Add eslint, especially for [no-floating-promises](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-floating-promises.md) rule
- [x] Run these tests in CircleCI (see also [https://github.com/ParabolInc/parabol/pull/5481](https://github.com/ParabolInc/parabol/pull/5481), which is related).
- [x] Junit reporting for CircleCI
- [ ] Add authenticated tests
- [ ] Write a test that utilizes multiple [`page` objects](https://playwright.dev/docs/pages#multiple-pages) to test real-time behaviors.
