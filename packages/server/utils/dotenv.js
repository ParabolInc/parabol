import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import path from 'path'
/*
 * getDotenv()
 * processes .env file (if it exists). Sets process.env[VARS] as a
 * side-effect.
 *
 * Returns true.
 */
export default function getDotenv () {
  const name = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
  const myEnv = dotenv.config({
    path: path.join(__dirname, '..', name)
  })
  dotenvExpand(myEnv)
}
