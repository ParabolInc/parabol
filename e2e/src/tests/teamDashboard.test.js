/**
 * Tests that users can perform various actions on the Team Dashboard
 *
 * @flow
 */

/* eslint-env mocha */

import type { WebDriver } from 'selenium-webdriver';
import type { AuthActions, DashboardActions, OnboardingActions } from '../actions';
import type { Credentials } from '../common';

import expect from 'expect';

import getDriver from '../lib';
import { generateCredentials } from '../common';

import {
  createAuthActions,
  createDashboardActions,
  createOnboardingActions
} from '../actions';

type Actions = {
  ...AuthActions,
  ...DashboardActions,
  ...OnboardingActions
};

const createActions = (driver: WebDriver): Actions => ({
  ...createAuthActions(driver),
  ...createOnboardingActions(driver),
  ...createDashboardActions(driver)
});

const createExpectations = (driver: WebDriver) => ({
  async shouldBeOnTeamDashboard(teamName) {
    const title = await driver.getTitle();
    expect(title).toContain(teamName);
  }
});

describe('Team Dashboard', () => {
  let driver: WebDriver;
  let actions;
  let expectations;
  let credentials: Credentials;
  let preferredName: string;
  let teamName: string;

  // note that `before` is called by mocha prior to `beforeEach`.
  before(async () => {
    credentials = generateCredentials();
    preferredName = 'Team Dashboard Test User';
    teamName = 'Team Dashboard Test Team';
    const onboardingDriver = await getDriver('chrome');
    const bootstrapActions = createActions(onboardingDriver);
    await bootstrapActions.goToHomepage();
    await bootstrapActions.openLoginModal();
    await bootstrapActions.signUp(credentials);
    await bootstrapActions.onboard({ preferredName, teamName });
    return onboardingDriver.quit();
  });

  beforeEach(async () => {
    driver = await getDriver('chrome');
    actions = createActions(driver);
    expectations = createExpectations(driver);
  });

  afterEach(() => {
    return driver.quit();
  });

  it('can navigate to the Team Dashboard', async () => {
    await actions.goToHomepage();
    await actions.openLoginModal();
    await actions.login(credentials);
    await actions.goToTeamDashboard(teamName);
    await expectations.shouldBeOnTeamDashboard(teamName);
  });
});
