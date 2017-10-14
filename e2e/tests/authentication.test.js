/**
 * Tests that users can sign in and sign out.
 */

/* eslint-env mocha */

import expect from 'expect';
import { By, until } from 'selenium-webdriver';
import shortid from 'shortid';

import { all, newUserSession } from '../lib';

const BASE_URL = global.E2E_APP_SERVER_URL;
const BASE_URL_REGEX = BASE_URL.endsWith('/')
  ? new RegExp(`^${BASE_URL}?$`)
  : new RegExp(`^${BASE_URL}(/)?$`);

function generateCredentials() {
  // Note that we want to generate unique credentials, since we're testing
  // against a live auth0.  If we try to log in with fake credentials too
  // often, we'll get different error messages about getting blocked from
  // logging in.
  return {
    email: `e2e_test_account_${shortid.generate()}@parabol.co`,
    password: 'test'
  };
}

const actions = {
  goToHomepage: (driver) => () => driver.get(BASE_URL),

  openLoginModal: (driver) => async () => {
    await driver
      .findElement(By.css('button[title="Log In"]'))
      .click();
    const modalContainerSelector = '#a0-onestep';
    const loginSignupToggleSelector = '.a0-sign-up';
    await all(
      driver
        .wait(until.elementLocated(By.css(modalContainerSelector))),
      driver
        .wait(until.elementLocated(By.css(loginSignupToggleSelector)))
    );
  },

  login: (driver) => async ({ email, password }) => {
    await driver
      .findElement(By.id('a0-signin_easy_email'))
      .sendKeys(email);
    await driver
      .findElement(By.id('a0-signin_easy_password'))
      .sendKeys(password);
    await driver
      .findElement(By.css('button[type="submit"]'))
      .click();
  },

  signUp: (driver) => async ({ email, password }) => {
    await driver
      .findElement(By.css('.a0-sign-up'))
      .click();
    await driver
      .findElement(By.id('a0-signup_easy_email'))
      .sendKeys(email);
    await driver
      .findElement(By.id('a0-signup_easy_password'))
      .sendKeys(password);
    await driver
      .findElement(By.css('button[type="submit"]'))
      .click();
  },

  logout: (driver) => async () => {
    await driver
      .findElement(By.css('a[title="Sign Out"]'))
      .click();
    await all(
      driver
        .wait(until.urlMatches(BASE_URL_REGEX), 2000, 'Logging out did not redirect to the base URL'),
      driver
        .wait(until.titleMatches(/Parabol/), 2000, 'Logging out did not redirect to the Parabol Homepage')
    );
  }
};

const expectations = {
  shouldSeeLoginWarning: (driver) => async (warningRegex) => {
    const warningElement = await driver.findElement(By.css('h2.a0-error'));
    await driver.wait(
      () => warningElement.getText().then((txt) => !!(txt.trim().length)),
      2000,
      'Warning area did not display warning text'
    );
    const warningText = await warningElement.getText();
    return expect(warningText).toMatch(warningRegex);
  },

  shouldSeeWelcomeWizard: (driver) => async () => {
    await driver.wait(
      until.titleMatches(/Welcome/),
      5000,
      'Sign up did not redirect to welcome wizard'
    );
    const url = await driver.getCurrentUrl();
    return expect(url).toMatch(/welcome/);
  },

  shouldSeeHomepage: (driver) => async () => {
    const title = await driver.getTitle();
    expect(title).toMatch(/Parabol/);
    const url = await driver.getCurrentUrl();
    expect(url).toMatch(BASE_URL_REGEX);
    const headingEl = await driver.findElement(By.css('h1'));
    const headingText = await headingEl.getText();
    expect(headingText.trim()).toEqual('The Unified Dashboard for All Disciplines');
  }
};

const behaviors = {
  ...actions,
  ...expectations
};

describe('Authentication', () => {
  let user;
  // We'll use a little cache to save user credentials between tests.
  // Note that mocha runs tests serially, which is important for type of
  // stateful testing.
  let cache;
  const resetCache = () => { cache = {}; };

  before(resetCache);

  after(resetCache);

  beforeEach(async () => {
    user = await newUserSession({ browser: 'chrome', behaviors });
  });

  afterEach(async () => {
    return user.quit();
  });

  it('shows an error when the incorrect credentials are provided', async () => {
    await user.goToHomepage();
    await user.openLoginModal();
    await user.login(generateCredentials());
    await user.shouldSeeLoginWarning(/Wrong email or password/);
  });

  it('can sign up', async () => {
    await user.goToHomepage();
    await user.openLoginModal();
    const credentials = generateCredentials();
    await user.signUp(credentials);
    await user.shouldSeeWelcomeWizard();
    cache.credentials = credentials;
  });

  it('can log in (and out) with valid credentials', async () => {
    const { credentials } = cache;
    expect(credentials).toBeTruthy();
    await user.goToHomepage();
    await user.openLoginModal();
    await user.login(credentials);
    await user.shouldSeeWelcomeWizard();
    await user.logout();
    await user.shouldSeeHomepage();
  });
});
