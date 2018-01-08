/**
 * A collection of user actions implemented on the webdriver.
 *
 * An `action` is a function of the signature:
 *     (driver: WebDriver) => (...args: any[]) => Promise<any>
 *
 * @flow
 */

import type { WebDriver, WebElement } from 'selenium-webdriver';
import type { Credentials } from './common';

import { By, until, Key } from 'selenium-webdriver';
import { BASE_URL, BASE_URL_REGEX, all, waitTimes } from './common';

export const goToHomepage = (driver: WebDriver) => async () => {
  return driver.get(BASE_URL);
};

export const openLoginModal = (driver: WebDriver) => async () => {
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
};

export const login = (driver: WebDriver) => async ({ email, password }: Credentials) => {
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
};


export const signUp = (driver: WebDriver) => async ({ email, password }: Credentials) => {
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

export const logout = (driver: WebDriver) => async () => {
  await driver
    .findElement(By.css('a[title="Sign Out"]'))
    .then((el) => el.click());
  await all(
    driver
      .wait(until.urlMatches(BASE_URL_REGEX), waitTimes.short, 'Logging out did not redirect to the base URL'),
    driver
      .wait(until.titleMatches(/Parabol/), waitTimes.short, 'Logging out did not redirect to the Parabol Homepage')
  );
};

type OnboardingArgs = {
  preferredName: string,
  teamName: string,
  inviteeEmails?: string[]
};

export const onboard = (driver: WebDriver) => async ({ preferredName, teamName, inviteeEmails }: OnboardingArgs) => {
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
};

export const goToTeamDashboard = (driver: WebDriver) => async (teamName: string) => {
  await driver.wait(
    until.urlMatches(/(\/me$|\/team\/)/),
    waitTimes.short,
    'Must be on the dashboard to find a link to the specific team dashboard'
  );
  await driver.wait(
    until.elementLocated(By.tagName('nav')),
    waitTimes.short,
    'Must have loaded the <nav> element to find a particualr team dashboard link'
  );
  await driver
    .findElement(By.css(`[title="${teamName}"]`))
    .then((navLink) => navLink.click());
  return driver.wait(
    until.titleContains(teamName),
    waitTimes.long,
    'Page title does not match the expected team name'
  );
};

// Composite Actions

export type AuthActions = {|
  goToHomepage: () => Promise<void>,
  login: (credentials: Credentials) => Promise<void>,
  logout: () => Promise<void>,
  openLoginModal: () => Promise<void>,
  signUp: (credentials: Credentials) => Promise<void>,
|};

export const createAuthActions = (driver: WebDriver) => ({
  goToHomepage: goToHomepage(driver),
  login: login(driver),
  logout: logout(driver),
  openLoginModal: openLoginModal(driver),
  signUp: signUp(driver)
});

export type OnboardingActions = {|
  onboard: (OnboardingArgs) => Promise<void>
|};

export const createOnboardingActions = (driver: WebDriver) => ({
  onboard: onboard(driver)
});

export type DashboardActions = {|
  goToTeamDashboard: (teamName: string) => Promise<void>
|};

export const createDashboardActions = (driver: WebDriver) => ({
  goToTeamDashboard: goToTeamDashboard(driver)
});
