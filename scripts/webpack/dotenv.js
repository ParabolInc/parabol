/*
 * Sets .env in process.env[VARS] as aside-effect.
 */
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const path = require('path')

// webpack global
const PROJECT_ROOT = path.join(__dirname, '../')
console.log('PROJECT_ROOT', PROJECT_ROOT)
const envPath = path.join(PROJECT_ROOT, '.env')
const myEnv = dotenv.config({ path: envPath })
dotenvExpand(myEnv)
