/*
 * Sets .env in process.env[VARS] as aside-effect.
 */
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import path from 'path'

const name = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
// const envPath = path.join(__dirname, '../../', name)
const myEnv = dotenv.config({path: path.resolve('./.env')})
dotenvExpand(myEnv)
