# Integration Tests

These integration tests are written using [Playwright](https://playwright.dev/). Currently, this is a prototype and only
runs locally.

## Running the Test Suites

1. Start the dev server according to the main [README instructions](/README.md#installation)
2. In this directory, run `yarn test`.

## TODO

- [ ] Add eslint, especially for [no-floating-promises](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-floating-promises.md) rule
- [ ] Run these tests in CircleCI (see also [https://github.com/ParabolInc/parabol/pull/5481](https://github.com/ParabolInc/parabol/pull/5481), which is related).
- [ ] Junit reporting for CircleCI
- [ ] Add authenticated tests
