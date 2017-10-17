/**
 * Runs the e2e test suite.  For usage information, run with the `--help`
 * flag.
 */
import child_process from 'child_process'; // eslint-disable-line
import {promisify} from 'util';

import commander from 'commander';
import glob from 'glob';
import Mocha from 'mocha';

import {MOCHA_TIMEOUT, SERVER_TIMEOUT} from './constants';
import {addDriversToPATH, hasDrivers} from './drivers';

const globP = promisify(glob);

commander
  .version('1.0.0')
  .description('Runs end-to-end tests against the Action app')
  .option(
    '-u',
    '--url <url>',
    'URL of the application under test.  If not provided, runs a prod-like server locally.'
  )
  .option('-i', '--inspect', 'Run the test process under the node inspector')
  .option('-m', '--mocha-timeout', `Timeout (in milliseconds) for individual tests.  (Default ${MOCHA_TIMEOUT})`)
  .option('-s', '--server-timeout', `Only applies Time (in milliseconds) for individual tests.  (Default ${SERVER_TIMEOUT})`)
  .parse(process.argv);

function startAppServer(serverTimeout) {
  return new Promise((resolve) => {
    const serverProc = child_process.exec('npm start', {
      env: {...process.env, NODE_ENV: 'production'}
    });
    serverProc.stdout.on('data', console.log);
    serverProc.stderr.on('data', console.error);
    serverProc.on('close', (exitCode) =>
      console.log(`Server exiting with exit code: ${exitCode}`)
    );

    setTimeout(() => {
      resolve(serverProc);
    }, serverTimeout);

    console.log('Waiting for server to start...');
  });
}

function declareAppServerUrl(url) {
  global.E2E_APP_SERVER_URL = url;
}

async function main({ url, inspect, mochaTimeout = MOCHA_TIMEOUT, serverTimeout = SERVER_TIMEOUT}) {
  if (inspect) {
    // sending the SIGUSR1 signal to the current process activates the debugger
    // see https://nodejs.org/en/docs/inspector/
    process.kill('SIGUSR1');
  }

  if (!(await hasDrivers())) {
    console.log('No webdrivers detected.  Run `npm run test:e2e-deps` to install the drivers locally.');
    process.exit(1);
  }

  addDriversToPATH();

  let appServerProc;
  const kill = (proc) => {
    if (proc) {
      proc.kill('SIGINT');
    }
  };
  if (url) {
    declareAppServerUrl(url);
  } else {
    appServerProc = await startAppServer(serverTimeout);
    declareAppServerUrl('http://localhost:3000');
  }

  try {
    const mocha = new Mocha({
      timeout: mochaTimeout,
      ui: 'bdd'
    });
    const files = await globP('e2e/tests/**/*.test.js');
    files.forEach(mocha.addFile.bind(mocha));
    mocha.run((failures) => {
      kill(appServerProc);
      process.exit(failures);
    });
  } catch (error) {
    console.error(error);
    kill(appServerProc);
  }
}

main(commander);
