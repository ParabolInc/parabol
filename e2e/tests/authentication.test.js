/**
 * Tests that users can sign in and sign out.
 */
import assert from 'assert';

import { By, until } from 'selenium-webdriver';
import shortid from 'shortid';

import { newUser } from '../lib';

function generateUserCredentials() {
  // Note that we want to generate unique credentials, since we're testing
  // against a live auth0.  If we try to log in with fake credentials too
  // often, we'll get different error messages about getting blocked from
  // logging in.
  return [`e2e_test_account_${shortid.generate()}@parabol.co`, 'test'];
}

const actions = {
  goToHomepage: (driver) => () => driver.get('http://localhost:3000'),

  openLoginModal: (driver) => async () => {
    await driver
      .findElement({ css: 'button[title="Log In"]' })
      .click();
    await driver
      .wait(until.elementLocated(By.id('a0-signin_easy_password')));
  },

  login: (driver) => async (username, password) => {
    await driver
      .findElement(By.id('a0-signin_easy_email'))
      .sendKeys(username);
    await driver
      .findElement(By.id('a0-signin_easy_password'))
      .sendKeys(password);
    await driver
      .findElement(By.css('button[type="submit"]'))
      .click();
  }
};

const expectations = {
  shouldSeeLoginWarning: (driver) => async (warningRegex) => {
    const warningAreaSelector = 'h2.a0-error';
    const warningElement = await driver.findElement(By.css(warningAreaSelector));
    await driver.wait(
      () => warningElement.getText().then((txt) => !!(txt.trim().length)),
      2000,
      'Warning area did not display warning text'
    );
    const warningText = await warningElement.getText();
    return assert.ok(warningRegex.test(warningText));
  }
};

const behaviors = {
  ...actions,
  ...expectations
};

describe('Authentication', () => {
  let user;

  beforeEach(async () => {
    user = await newUser({ browser: 'chrome', behaviors });
  });

  afterEach(async () => {
    return user.quit();
  });

  it('shows an error when the incorrect credentials are provided', async () => {
    await user.goToHomepage();
    await user.openLoginModal();
    await user.login(...generateUserCredentials());
    await user.shouldSeeLoginWarning(/Wrong email or password/);
  });

  it('can log in with the correct credentials');

  it('can log out');
});
