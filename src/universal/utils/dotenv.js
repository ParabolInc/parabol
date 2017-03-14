import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

/*
 * getDotenv()
 * processes .env file (if it exists). Sets process.env[VARS] as a
 * side-effect.
 *
 * Returns true.
 */
export default function getDotenv() {
  const myConfig = {};
  if (process.env.NODE_ENV === 'test') {
    myConfig.path = '.env.test';
  }
  const myEnv = dotenv.config(myConfig);
  console.log('ENV', myEnv, myEnv.parsed);
  const {parsed} = myEnv;
  if (parsed) {
    dotenvExpand(parsed);
  }

  return true;
}
