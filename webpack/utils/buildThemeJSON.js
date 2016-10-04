import fs from 'fs';
import lockfile from 'lockfile';
import theme from '../../src/universal/styles/theme/theme';

const BUILD_DIR = './build';
const OUTPUT_FILE = `${BUILD_DIR}/appTheme.json`;
const LOCK_WAIT_MS = 1000 * 60 * 2; // 2 minutes

const outputLockFile = `${OUTPUT_FILE}.lock`;

if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR);
}
if (lockfile.checkSync(outputLockFile)) {
  // this is only so we can print a nice message:
  console.log(`waiting on ${outputLockFile}...`);
}
lockfile.lock(outputLockFile, {wait: LOCK_WAIT_MS}, (err) => {
  if (err) {
    console.error(`unable to acquire ${outputLockFile}: ${err}`);
    process.exit(1);
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(theme));
  lockfile.unlock(outputLockFile, (unlockErr) => {
    if (unlockErr) {
      console.error(`unable to unlock ${outputLockFile}: ${unlockErr}`);
      process.exit(1);
    }
  });
});
