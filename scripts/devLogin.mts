/*
  Signs a browser in to the running dev stack without going through the UI
  `pnpm dev:login someone@example.com` writes dev/auth/someone@example.com.json, which is a Playwright storageState:
    browser.newContext({storageState, ignoreHTTPSErrors: true})
  A user that does not exist yet is signed up with that email
  The cookies are signed with the SERVER_SECRET in .env, so this only works against a stack on this machine
*/
import fs from 'fs'
import {createRequire} from 'module'
import path from 'path'
import connectToPostgres from './devStack/connectToPostgres.mts'
import ensureDevUser from './devStack/ensureDevUser.mts'
import readStack from './devStack/readStack.mts'
import getProjectRoot from './webpack/utils/getProjectRoot.js'

type AuthTokenModule = {default: new (fields: {sub: string; tms: string[]}) => object}
type AuthCookieModule = {createCookieHeaders: (authToken: object) => string[]}

const require = createRequire(import.meta.url)
const PROJECT_ROOT = getProjectRoot()

const parseCookie = (header: string, hostname: string) => {
  const [nameValue = '', ...attributes] = header.split('; ')
  const separatorIndex = nameValue.indexOf('=')
  const expires = attributes.find((attribute) => attribute.startsWith('Expires='))
  return {
    name: nameValue.slice(0, separatorIndex),
    value: nameValue.slice(separatorIndex + 1),
    domain: hostname,
    path: '/',
    expires: expires ? new Date(expires.slice('Expires='.length)).getTime() / 1000 : -1,
    httpOnly: attributes.includes('HttpOnly'),
    secure: attributes.includes('Secure'),
    sameSite: 'Lax'
  }
}

const devLogin = async () => {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: pnpm dev:login <email>')
    process.exit(1)
  }
  const stack = readStack()
  if (!stack) {
    console.error('The dev stack is not running. Start it with `pnpm dev`')
    process.exit(1)
  }
  // the token names the URL it was issued for & an isolated stack has its own database
  process.env.PORT = String(stack.port)
  process.env.SOCKET_PORT = String(stack.socketPort)
  process.env.POSTGRES_DB = stack.database
  require('./webpack/utils/dotenv.js')
  // The cookies come from the server's own code, which is app code that node cannot run by itself
  // (its imports have no extensions & it uses const enums), so sucrase loads it
  require('sucrase/register')
  const {
    default: AuthToken
  }: AuthTokenModule = require('../packages/server/database/types/AuthToken')
  const {createCookieHeaders}: AuthCookieModule = require('../packages/server/utils/authCookie')

  const client = await connectToPostgres()
  const user = await ensureDevUser(stack, client, email)
  await client.end()

  const {hostname} = new URL(stack.url)
  const authToken = new AuthToken({sub: user.id, tms: user.tms})
  const cookies = createCookieHeaders(authToken).map((header) => parseCookie(header, hostname))
  const storageStatePath = path.join(PROJECT_ROOT, 'dev', 'auth', `${email}.json`)
  fs.mkdirSync(path.dirname(storageStatePath), {recursive: true})
  fs.writeFileSync(storageStatePath, JSON.stringify({cookies, origins: []}, null, 2))
  console.log(JSON.stringify({url: stack.url, userId: user.id, storageState: storageStatePath}))
}

devLogin().catch((error: Error) => {
  console.error(error.message)
  process.exit(1)
})
