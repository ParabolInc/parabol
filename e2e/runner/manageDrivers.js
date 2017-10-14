import child_process from 'child_process'; // eslint-disable-line
import fs from 'fs';
import https from 'https';
import os from 'os';
import path from 'path';
import {promisify} from 'util';

const execP = promisify(child_process.exec);

const driversDir = path.join(process.cwd(), 'webdrivers');

class Driver {
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
    return path.join(driversDir, this.driverFilename);
  }
}

function getOsName() {
  return {
    Darwin: 'mac',
    Linux: 'linux',
    Windows_NT: 'win'
  }[os.type()];
}

function getOsArch() {
  return os.arch().slice(1);
}

function addDriversToPATH() {
  process.env.PATH = `${process.env.PATH}:${driversDir}`;
}

async function getDriver({url, downloadFilename}) {
  const filePath = path.join('/tmp', downloadFilename);
  const fileStream = fs.createWriteStream(filePath);
  await new Promise((resolve, reject) => {
    https.get(
      url,
      (res) => {
        res.pipe(fileStream);
        res.on('end', () => {
          console.log(`Finished downloading ${url}`);
          resolve(filePath);
        });
        res.on('error', (e) => {
          console.log(`Error downloading ${url}`);
          console.error(e);
          reject(e);
        });
      }
    );
  });
  if (filePath.endsWith('.zip')) {
    await execP(`mkdir -p ${driversDir} && tar -xvf ${filePath} -C ${driversDir}`);
  }
}

async function ensureDriver(driver) {
  const {browser, pathTo, url} = driver;
  if (!fs.existsSync(pathTo)) {
    console.log(
      `${browser} driver not found. Downloading from ${url}...`
    );
    await getDriver(driver);
  }
}

export default async function ensureDrivers() {
  const drivers = [
    new Driver({
      browser: 'chrome',
      url: `https://chromedriver.storage.googleapis.com/2.33/chromedriver_${getOsName()}${getOsArch()}.zip`,
      driverFilename: 'chromedriver'
    })
  ];
  await Promise.all(drivers.map(ensureDriver));
  addDriversToPATH();
}
