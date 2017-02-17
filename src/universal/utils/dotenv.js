
/*
 * getDotenv()
 * processes .env file (if it exists). Sets process.env[VARS] as a
 * side-effect.
 *
 * Returns true.
 */
export function getDotenv() {
  const dotenv = require('dotenv');              // eslint-disable-line
  const dotenvExpand = require('dotenv-expand'); // eslint-disable-line
  const myConfig = {silent: true};
  if (process.env.NODE_ENV === 'testing') {
    myConfig.path = '.env.testing';
  }
  const myEnv = dotenv.config(myConfig);
  dotenvExpand(myEnv);

  return true;
}
