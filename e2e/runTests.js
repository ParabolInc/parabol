import child_process from 'child_process'; // eslint-disable-line
import fs from 'fs';
import https from 'https';
import os from 'os';
import path from 'path';
import {promisify} from 'util';

import glob from 'glob';
import Mocha from 'mocha';

const execP = promisify(child_process.exec);
const globP = promisify(glob);

const SERVER_TIME_TO_START = 10000;
const driversDir = path.join(process.cwd(), 'webdrivers');
const chromedriverFilename = 'chromedriver';

process.env.NODE_ENV = 'e2e';

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

function getPathToDriver(driverFilename) {
  return path.join(driversDir, driverFilename);
}

function addDriversToPATH() {
  process.env.PATH = `${process.env.PATH}:${driversDir}`;
}

function getChromedriver() {
  const osName = getOsName();
  const osArch = getOsArch();
  console.log(
    `Chrome driver not found. Downloading driver for ${osName}${osArch}...`
  );
  const zipFilename = `chromedriver_${getOsName()}${getOsArch()}.zip`;
  const zipFilePath = path.join('/tmp', zipFilename);
  const zipFile = fs.createWriteStream(zipFilePath);
  return new Promise((resolve, reject) => {
    https.get(
      `https://chromedriver.storage.googleapis.com/2.33/${zipFilename}`,
      (res) => {
        res.pipe(zipFile);
        res.on('end', () => {
          console.log('Finished downloading chrome driver.');
          resolve();
        });
        res.on('error', (e) => {
          console.log('Error downloading chrome driver.');
          console.error(e);
          reject(e);
        });
      }
    );
  }).then(() => execP(`unzip -d ${driversDir} ${zipFilePath}`)); // TODO: use a cross-platform alternative to `unzip`
}

async function ensureChromedriver() {
  if (!fs.existsSync(getPathToDriver(chromedriverFilename))) {
    await getChromedriver();
  }
  addDriversToPATH();
}

function main() {
  ensureChromedriver();
  const serverProc = child_process.exec('npm start', {
    env: Object.assign(process.env, {NODE_ENV: 'e2e'})
  });
  serverProc.stdout.on('data', console.log);
  serverProc.stderr.on('data', console.error);
  serverProc.on('close', (exitCode) =>
    console.log(`Server exiting with exit code: ${exitCode}`)
  );

  console.log('Waiting for server to start...');

  setTimeout(async () => {
    const mocha = new Mocha({
      // Note that 20 seconds is a reasonably long timeout.  I'm betting that
      // tests will generally fail due to errors rather than timeouts.
      timeout: 20000,
      ui: 'bdd'
    });
    const files = await globP('e2e/tests/**/*.test.js');
    files.forEach(mocha.addFile.bind(mocha));
    mocha.run((failures) => {
      serverProc.kill('SIGINT');
      process.exit(failures);
    });
  }, SERVER_TIME_TO_START);
}

main();
