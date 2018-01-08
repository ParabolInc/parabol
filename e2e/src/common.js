/**
 * Utilities for writing tests.
 *
 * @flow
 */
import type { WebDriver, WebElement } from 'selenium-webdriver';

import { By, until, Key } from 'selenium-webdriver';
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

export function all<T>(...promises: Promise<T>[]) {
  return Promise.all(promises);
}

export function generateCredentials(): Credentials {
  // Note that we want to generate unique credentials, since we're testing
  // against a live auth0.  If we try to log in with fake credentials too
  // often, we'll get different error messages about getting blocked from
  // logging in.
  return {
    email: `e2e_test_account_${shortid.generate()}@parabol.co`,
    password: 'test'
  };
}

const signUp = (driver: WebDriver) => async ({ email, password }: Credentials) => {
  await driver
    .findElement(By.css('.a0-sign-up'))
    .then((el) => el.click());
  await driver
    .findElement(By.id('a0-signup_easy_email'))
    .then((el) => el.sendKeys(email));
  await driver
    .findElement(By.id('a0-signup_easy_password'))
    .then((el) => el.sendKeys(password));
  // save the current window handle, because an auth0 popup is about to be opened
  const mainWindowHandle = await driver.getWindowHandle();
  await driver
    .findElement(By.css('button[type="submit"]'))
    .then((el) => el.click());
  return driver.switchTo().window(mainWindowHandle);
};

export type AuthActions = {|
  goToHomepage: () => Promise<void>,
  openLoginModal: () => Promise<void>,
  login: (Credentials) => Promise<void>,
  signUp: (Credentials) => Promise<void>,
  logout: () => Promise<void>
|};

export const createAuthActions = (driver: WebDriver): AuthActions => ({
  async goToHomepage() {
    return driver.get(BASE_URL);
  },

  async openLoginModal() {
    await driver
      .findElement(By.css('button[title="Log In"]'))
      .then((el) => el.click());
    const modalContainerSelector = '#a0-onestep';
    const loginSignupToggleSelector = '.a0-sign-up';
    await all(
      driver
        .wait(until.elementLocated(By.css(modalContainerSelector))),
      driver
        .wait(until.elementLocated(By.css(loginSignupToggleSelector)))
    );
  },

  async login({ email, password }: Credentials) {
    await driver
      .findElement(By.id('a0-signin_easy_email'))
      .then((el) => el.sendKeys(email));
    await driver
      .findElement(By.id('a0-signin_easy_password'))
      .then((el) => el.sendKeys(password));
    // save the current window handle, because an auth0 popup is about to be opened
    const mainWindowHandle = await driver.getWindowHandle();
    await driver
      .findElement(By.css('button[type="submit"]'))
      .then((el) => el.click());
    return driver.switchTo().window(mainWindowHandle);
  },

  signUp: signUp(driver),

  // signUpAndOnboard: async ({
  //   credentials,
  //   preferredName,
  //   teamName,
  //   invitees
  // }: {
  //   credentials: Credentials,
  //   preferredName: string,
  //   teamName: string,
  //   invitees: string[]
  // }) => {
  //   await signUp(credentials);
  // },

  async logout() {
    await driver
      .findElement(By.css('a[title="Sign Out"]'))
      .then((el) => el.click());
    await all(
      driver
        .wait(until.urlMatches(BASE_URL_REGEX), waitTimes.short, 'Logging out did not redirect to the base URL'),
      driver
        .wait(until.titleMatches(/Parabol/), waitTimes.short, 'Logging out did not redirect to the Parabol Homepage')
    );
  }
});

export type OnboardingActions = {|
  // Assumes you've just signed in for the first time
  onboard: (
    options: {
      preferredName: string,
      teamName: string,
      inviteeEmails?: string[]
    }
  ) => Promise<void>
|};

export const createOnboardingActions = (driver: WebDriver): OnboardingActions => ({
  async onboard({ preferredName, teamName, inviteeEmails }) {
    const preferredNameLocator = By.name('preferredName');
    await driver.wait(
      until.urlMatches(/welcome/),
      waitTimes.long,
      'Must be on the onboarding page in order to execute the onboarding action'
    );
    await driver.wait(
      until.elementLocated(preferredNameLocator),
      waitTimes.short,
      'Preferred Name input must be present in order to enter preferred name'
    );
    const preferredNameInput: WebElement = await driver.findElement(preferredNameLocator);
    await preferredNameInput.clear();
    await preferredNameInput.sendKeys(preferredName, Key.ENTER);

    const teamNameLocator = By.name('teamName');
    await driver.wait(
      until.elementLocated(teamNameLocator),
      waitTimes.short,
      'Entering preferred name did not lead to team configuration step'
    );
    const teamNameInput: WebElement = await driver.findElement(teamNameLocator);
    await teamNameInput.sendKeys(teamName, Key.ENTER);

    const teamInviteesLocator = By.name('inviteesRaw');
    await driver.wait(
      until.elementLocated(teamInviteesLocator),
      waitTimes.short,
      'Entering team name did not lead to team invitation step'
    );
    const teamInviteesInput: WebElement = await driver.findElement(teamInviteesLocator);
    if (inviteeEmails) {
      await teamInviteesInput.sendKeys(
        inviteeEmails.join(', '),
        Key.ENTER
      );
    } else {
      await driver
        .findElement(By.partialLinkText('kick the tires'))
        .then((link) => link.click());
    }
    await driver.wait(
      until.titleIs(`${teamName} | Parabol`),
      waitTimes.short,
      'Entering optional team invitees did not complete the onboarding wizard'
    );
  }
});
