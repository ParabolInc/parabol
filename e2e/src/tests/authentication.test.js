/**
 * Tests that users can sign in and sign out.
 *
 * @flow
 */

/* eslint-env mocha */

import type { WebDriver } from 'selenium-webdriver';
import type { AuthActions } from '../common';

import expect from 'expect';
import { By, until } from 'selenium-webdriver';

import { createAuthActions, BASE_URL_REGEX, generateCredentials, waitTimes } from '../common';
import newBrowserSession from '../lib';

type Expectations = {
  shouldSeeLoginWarning: (warningRegex: RegExp) => Promise<void>,
  shouldSeeWelcomeWizard: () => Promise<void>,
  shouldSeeHomepage: () => Promise<void>
};

const createExpectations = (driver: WebDriver): Expectations => ({
  async shouldSeeLoginWarning(warningRegex) {
    const warningElement = await driver.findElement(By.css('h2.a0-error'));
    await driver.wait(
      () => warningElement.getText().then((txt) => !!(txt.trim().length)),
      waitTimes.short,
      'Warning area did not display warning text'
    );
    const warningText = await warningElement.getText();
    return expect(warningText).toMatch(warningRegex);
  },

  async shouldSeeWelcomeWizard() {
    await driver.wait(
      until.titleMatches(/Welcome/),
      waitTimes.long,
      'Sign up did not redirect to welcome wizard'
    );
    const url = await driver.getCurrentUrl();
    return expect(url).toMatch(/welcome/);
  },

  async shouldSeeHomepage() {
    const title = await driver.getTitle();
    expect(title).toMatch(/Parabol/);
    const url = await driver.getCurrentUrl();
    expect(url).toMatch(BASE_URL_REGEX);
    const headingEl = await driver.findElement(By.css('h1'));
    const headingText = await headingEl.getText();
    expect(headingText.trim()).toEqual('The Unified Dashboard for All Disciplines');
  }
});

describe('Authentication', () => {
  let actions: AuthActions;
  let expectations: Expectations;
  let quit: () => Promise<void>;
  // We'll use a little cache to save user credentials between tests.
  // Note that mocha runs tests serially, which is important for this type of
  // stateful testing.
  const cache = new Map();

  beforeEach(async () => {
    const session = await newBrowserSession('chrome', createAuthActions, createExpectations);
    actions = session.actions;
    expectations = session.expectations;
    quit = session.quit;
  });

  afterEach(() => {
    return quit();
  });

  it('shows an error when the incorrect credentials are provided', async () => {
    await actions.goToHomepage();
    await actions.openLoginModal();
    await actions.login(generateCredentials());
    await expectations.shouldSeeLoginWarning(/Wrong email or password/);
  });

  it('can sign up', async () => {
    await actions.goToHomepage();
    await actions.openLoginModal();
    const credentials = generateCredentials();
    await actions.signUp(credentials);
    await expectations.shouldSeeWelcomeWizard();
    cache.set('credentials', credentials);
  });

  it('can log in (and out) with valid credentials', async () => {
    const credentials = cache.get('credentials');
    if (!credentials) {
      throw new Error('Credentials not stored from previous test');
    }
    await actions.goToHomepage();
    await actions.openLoginModal();
    await actions.login(credentials);
    await expectations.shouldSeeWelcomeWizard();
    await actions.logout();
    await expectations.shouldSeeHomepage();
  });
});
