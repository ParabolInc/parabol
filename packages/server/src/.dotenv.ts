/*
 * Sets .env in process.env[VARS] as aside-effect.
 * Starts with a . so organizaing imports puts it above all other relative paths
 */
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import path from 'path'

const name = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
const envPath = path.join(__dirname, '..', 'packages', 'server', name)
const myEnv = dotenv.config({path: envPath})
dotenvExpand(myEnv)
