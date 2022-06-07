# Integration Tests

These integration tests are written using [Playwright](https://playwright.dev/).

## Writing a New Test

To write a new test, check out the [Getting Started documentation](https://playwright.dev/docs/intro) on the Playwright
site.

## Running the Test Suites

1. Start the dev server according to the main [README instructions](/README.md#installation)
2. In this directory, run `yarn test`.

## Debugging a Test

Playwright supports several options to interactively debug a test.
Check out this [page in notion 🔒](https://www.notion.so/parabol/How-to-Debug-Playwright-Integration-Tests-051ab62e0a51488aaa37bce1bb0d5fce) for a walkthrough.

For non-Parabol employees, you can check out this video on Loom.

<a href="https://www.loom.com/share/d6165059a05a416ab954e9f885d08607">
    <p>Interactively Debugging a Playwright Integration Test - Watch Video</p>
    <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/d6165059a05a416ab954e9f885d08607-with-play.gif">
</a>

See [playwright.dev docs](https://playwright.dev/docs/debug)

## TODO

- [x] Add eslint, especially for [no-floating-promises](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-floating-promises.md) rule
- [x] Run these tests in CircleCI (see also [https://github.com/ParabolInc/parabol/pull/5481](https://github.com/ParabolInc/parabol/pull/5481), which is related).
- [x] Junit reporting for CircleCI
- [ ] Add authenticated tests
- [ ] Write a test that utilizes multiple [`page` objects](https://playwright.dev/docs/pages#multiple-pages) to test real-time behaviors.
