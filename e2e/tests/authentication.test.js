/**
 * Tests that users can sign in and sign out.
 */

/* eslint-env mocha */

import expect from 'expect';
import {By, until} from 'selenium-webdriver';
import shortid from 'shortid';

import {all, newUserSession, waitTimes} from '../lib';

const BASE_URL = global.E2E_APP_SERVER_URL;

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
  goToSignInPage: (driver) => async () => {
    await driver.get(`${BASE_URL}/signin`);
    const signInFormSelector = '.signin-form';
    await driver
      .wait(until.elementLocated(By.css(signInFormSelector)));
  },

  goToSignUpPage: (driver) => async () => {
    await driver.get(`${BASE_URL}/signup`);
    const signUpFormSelector = '.signup-form';
    await driver
      .wait(until.elementLocated(By.css(signUpFormSelector)));
  },

  authenticate: (driver) => async ({email, password}) => {
    await driver
      .findElement(By.css('input[type="email"]'))
      .sendKeys(email);
    await driver
      .findElement(By.css('input[type="password"]'))
      .sendKeys(password);
    await driver
      .findElement(By.css('button[type="submit"]'))
      .click();
  },

  logout: (driver) => async () => {
    const signOutButtonSelector = 'a[title="Sign Out"]';
    await driver.wait(until.elementLocated(By.css(signOutButtonSelector)));
    await driver
      .findElement(By.css(signOutButtonSelector))
      .click();
  }
};

const expectations = {
  shouldSeeLoginWarning: (driver) => async (warningRegex) => {
    const warningElementSelector = '[role="alert"]';
    await driver.wait(until.elementLocated(By.css(warningElementSelector)));
    const warningElement = await driver.findElement(By.css(warningElementSelector));
    await driver.wait(
      () => warningElement.getText().then((txt) => !!(txt.trim().length)),
      waitTimes.short,
      'Warning area did not display warning text'
    );
    const warningText = await warningElement.getText();
    return expect(warningText).toMatch(warningRegex);
  },

  shouldSeeWelcomeWizard: (driver) => async () => {
    await driver.wait(
      until.titleMatches(/Welcome/),
      waitTimes.long,
      'Sign up did not redirect to welcome wizard'
    );
    const url = await driver.getCurrentUrl();
    return expect(url).toMatch(/welcome/);
  },

  shouldSeeHomepage: (driver) => async () => {
    await driver.wait(until.urlMatches(/\//), waitTimes.short, 'Logging out did not redirect to signin page');
    await driver.wait(until.titleMatches(/Sign In | Parabol/), waitTimes.short, 'Logging out did not redirect to the Parabol Homepage');
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
  const resetCache = () => {
    cache = {};
  };

  before(resetCache);

  after(resetCache);

  beforeEach(async () => {
    user = await newUserSession({browser: 'chrome', behaviors});
  });

  afterEach(async () => {
    return user.quit();
  });

  it('shows an error when the incorrect credentials are provided', async () => {
    await user.goToSignInPage();
    await user.authenticate(generateCredentials());
    await user.shouldSeeLoginWarning(/Wrong email or password/);
  });

  it('can sign up', async () => {
    await user.goToSignUpPage();
    const credentials = generateCredentials();
    await user.authenticate(credentials);
    await user.shouldSeeWelcomeWizard();
    cache.credentials = credentials;
  });

  it('can log in (and out) with valid credentials', async () => {
    const {credentials} = cache;
    expect(credentials).toBeTruthy();
    await user.goToSignInPage();
    await user.authenticate(credentials);
    await user.shouldSeeWelcomeWizard();
    await user.logout();
    await user.shouldSeeHomepage();
  });
});
