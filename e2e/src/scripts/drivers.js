import fs from 'fs';
import os from 'os';
import path from 'path';
import {promisify} from 'util';

import {DRIVERS_DIR} from './constants';

export class Driver {
  constructor({browser, url, driverFilename}) {
    this.browser = browser;
    this.url = url;
    this._driverFilename = driverFilename;
  }

  get downloadFilename() {
    const urlPathSegments = this.url.split('/');
    return urlPathSegments[urlPathSegments.length - 1];
  }

  get driverFilename() {
    return this._driverFilename || this.downloadFilename;
  }

  get pathTo() {
    return path.join(DRIVERS_DIR, this.driverFilename);
  }
}

export function getOsName() {
  return {
    Darwin: 'mac',
    Linux: 'linux',
    Windows_NT: 'win'
  }[os.type()];
}

export function getOsArch() {
  return os.arch().slice(1);
}

export function addDriversToPATH() {
  process.env.PATH = `${process.env.PATH}:${DRIVERS_DIR}`;
}

export const DRIVERS = [
  new Driver({
    browser: 'chrome',
    url: `https://chromedriver.storage.googleapis.com/2.33/chromedriver_${getOsName()}${getOsArch()}.zip`,
    driverFilename: 'chromedriver'
  })
];

export async function hasDrivers() {
  try {
    const realDriverFilenames = new Set(await promisify(fs.readdir)(DRIVERS_DIR));
    return !DRIVERS.find((driver) => !realDriverFilenames.has(driver.driverFilename));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}
