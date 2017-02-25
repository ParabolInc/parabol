import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

/*
 * getDotenv()
 * processes .env file (if it exists). Sets process.env[VARS] as a
 * side-effect.
 *
 * Returns true.
 */
export function getDotenv() {
  const myConfig = {silent: true};
  if (process.env.NODE_ENV === 'test') {
    myConfig.path = '.env.test';
  }
  const myEnv = dotenv.config(myConfig);
  dotenvExpand(myEnv);

  return true;
}
