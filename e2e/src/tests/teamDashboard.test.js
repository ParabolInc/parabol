/**
 * Tests that users can perform various actions on the Team Dashboard
 *
 * @flow
 */

/* eslint-env mocha */

import type { WebDriver } from 'selenium-webdriver';
import type { AuthActions, Credentials, OnboardingActions } from '../common';
import type { BrowserSession } from '../lib';

import { By, until } from 'selenium-webdriver';

import newBrowserSession from '../lib';
import { createAuthActions, createOnboardingActions, generateCredentials, waitTimes } from '../common';

type Actions = {
  ...AuthActions,
  ...OnboardingActions,

  goToTeamDashboard(teamName: string): Promise<void>
};
type Expectations = {
  shouldBeOnTeamDashboard: (teamName: string) => Promise<void>
};

const createActions = (driver: WebDriver): Actions => ({
  ...createAuthActions(driver),
  ...createOnboardingActions(driver),

  async goToTeamDashboard(teamName) {
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
  }
});

const createExpectations = (driver: WebDriver): Expectations => ({
  shouldBeOnTeamDashboard(teamName) {
    return driver.wait(
      until.titleContains(teamName),
      waitTimes.long,
      `Not on the team dashboard for team "${teamName}"`
    );
  }
});

describe('Team Dashboard', () => {
  let session: BrowserSession<Actions, Expectations>;
  let credentials: Credentials;
  let preferredName: string;
  let teamName: string;

  // note that `before` is called by mocha prior to `beforeEach`.
  before(async () => {
    credentials = generateCredentials();
    preferredName = 'Team Dashboard Test User';
    teamName = 'Team Dashboard Test Team';
    const onboardingSession = await newBrowserSession('chrome', createActions, createExpectations);
    await onboardingSession.actions.goToHomepage();
    await onboardingSession.actions.openLoginModal();
    await onboardingSession.actions.signUp(credentials);
    await onboardingSession.actions.onboard({ preferredName, teamName });
    return onboardingSession.quit();
  });

  beforeEach(async () => {
    session = await newBrowserSession('chrome', createActions, createExpectations);
  });

  afterEach(() => {
    return session.quit();
  });

  it('can navigate to the Team Dashboard', async () => {
    await session.actions.goToHomepage();
    await session.actions.openLoginModal();
    await session.actions.login(credentials);
    await session.actions.goToTeamDashboard(teamName);
    await session.expectations.shouldBeOnTeamDashboard(teamName);
  });
});
