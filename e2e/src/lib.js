/**
 * Defines the core API for creating selenium test sessions.
 *
 * @flow
 */
import type { WebDriver } from 'selenium-webdriver';

import { Builder } from 'selenium-webdriver';

export type BrowserSession<Actions, Expectations> = {
  quit: () => Promise<void>,
  actions: Actions,
  expectations: Expectations
};

export default async function newBrowserSession<Actions, Expectations>(
  browser: string,
  actionsCreator: (driver: WebDriver) => Actions,
  expectationsCreator: (driver: WebDriver) => Expectations
): Promise<BrowserSession<Actions, Expectations>> {
  const driver = await new Builder().forBrowser(browser).build();
  return {
    actions: actionsCreator(driver),
    expectations: expectationsCreator(driver),
    quit: driver.quit.bind(driver)
  };
}
