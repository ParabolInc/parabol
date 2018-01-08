/**
 * Utilities for writing tests.
 *
 * @flow
 */

import shortid from 'shortid';

export type Credentials = {|
  email: string,
  password: string
|};

export const BASE_URL: string = global.E2E_APP_SERVER_URL;
export const BASE_URL_REGEX: RegExp = BASE_URL.endsWith('/')
  ? new RegExp(`^${BASE_URL}?$`)
  : new RegExp(`^${BASE_URL}(/)?$`);

/**
 * Wait times, in milliseconds, for interactions which take some time to
 * complete.  For use with WebDriver.prototype.wait.
 * (https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_ThenableWebDriver.html)
 */
export const waitTimes = {
  short: 2000,
  long: 5000
};

export const all = <T>(...promises: Array<Promise<T>>) => Promise.all(promises);

// Note that we want to generate unique credentials, since we're testing
// against a live auth0.  If we try to log in with fake credentials too
// often, we'll get different error messages about getting blocked from
// logging in.
export const generateCredentials = (): Credentials => ({
  email: `e2e_test_account_${shortid.generate()}@parabol.co`,
  password: 'test'
});
