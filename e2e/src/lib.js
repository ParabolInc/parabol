/**
 * Defines the core API for creating selenium test sessions.
 *
 * @flow
 */
import type { WebDriver } from 'selenium-webdriver';

import { Builder } from 'selenium-webdriver';

export default async function getDriver(browser: string): Promise<WebDriver> {
  return new Builder().forBrowser(browser).build();
}
