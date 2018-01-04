import child_process from 'child_process'; // eslint-disable-line
import fs from 'fs';
import https from 'https';
import path from 'path';
import {promisify} from 'util';

import {DRIVERS_DIR} from './constants';
import {DRIVERS, Driver, getOsName, getOsArch} from './drivers';

const execP = promisify(child_process.exec);

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
    await execP(`mkdir -p ${DRIVERS_DIR} && unzip ${filePath} -d ${DRIVERS_DIR}`);
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

function ensureDrivers() {
  return Promise.all(DRIVERS.map(ensureDriver));
}

ensureDrivers();
