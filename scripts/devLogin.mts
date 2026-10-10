/*
  Signs a browser in to the running dev stack without going through the UI
  `pnpm dev:login someone@example.com` writes dev/auth/someone@example.com.json, which is a Playwright storageState:
    browser.newContext({storageState, ignoreHTTPSErrors: true})
  A user that does not exist yet is signed up with that email
  The cookies are signed with the SERVER_SECRET in .env, so this only works against a stack on this machine
*/
import crypto from 'crypto'
import fs from 'fs'
import {createRequire} from 'module'
import path from 'path'
import type {Client} from 'pg'
import connectToPostgres from './devStack/connectToPostgres.mts'
import readStack, {type DevStack} from './devStack/readStack.mts'
import getProjectRoot from './webpack/utils/getProjectRoot.js'

type AuthTokenModule = {default: new (fields: {sub: string; tms: string[]}) => object}
type AuthCookieModule = {createCookieHeaders: (authToken: object) => string[]}
type GraphQLResponse<TData> = {data: TData; errors?: {message: string}[]}
type SignUpData = {signUpWithPassword: {error?: {message: string} | null}}

const require = createRequire(import.meta.url)
const PROJECT_ROOT = getProjectRoot()

const callMutation = async <TData,>(
  stack: DevStack,
  name: string,
  variables: Record<string, unknown>
) => {
  const queryMap: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(PROJECT_ROOT, 'queryMap.json'), 'utf8')
  )
  const docId = Object.keys(queryMap).find((id) => queryMap[id]?.startsWith(`mutation ${name}(`))
  if (!docId) throw new Error(`${name} is not in queryMap.json`)
  const response = await fetch(`http://localhost:${stack.socketPort}/graphql`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({docId, variables})
  })
  const {data, errors} = (await response.json()) as GraphQLResponse<TData>
  if (errors?.[0]) throw new Error(`${name} failed: ${errors[0].message}`)
  return data
}

// tms mirrors the teamIdsByUserId dataloader: the teams the user is still on that are not archived
const getUser = async (client: Client, email: string) => {
  const {rows} = await client.query<{id: string; tms: string[]}>(
    `SELECT u.id, COALESCE(array_agg(t.id) FILTER (WHERE t.id IS NOT NULL), '{}') AS tms
    FROM "User" u
    LEFT JOIN "TeamMember" tm ON tm."userId" = u.id AND tm."isNotRemoved" = true
    LEFT JOIN "Team" t ON t.id = tm."teamId" AND t."isArchived" = false
    WHERE u.email = $1
    GROUP BY u.id`,
    [email]
  )
  return rows[0]
}

// The same 2 steps as the sign up form: ask for an account, then follow the link in the verification email
const signUp = async (stack: DevStack, client: Client, email: string) => {
  const password = crypto.randomBytes(24).toString('base64url')
  const invitation = {invitationToken: '', isInvitation: false}
  const {signUpWithPassword} = await callMutation<SignUpData>(stack, 'SignUpWithPasswordMutation', {
    ...invitation,
    email,
    password,
    pseudoId: null,
    params: ''
  })
  if (!(await getUser(client, email))) {
    const {rows} = await client.query<{token: string}>(
      'SELECT token FROM "EmailVerification" WHERE email = $1 ORDER BY expiration DESC LIMIT 1',
      [email]
    )
    const verificationToken = rows[0]?.token
    if (!verificationToken) {
      throw new Error(`Could not sign up ${email}: ${signUpWithPassword.error?.message}`)
    }
    await callMutation(stack, 'VerifyEmailMutation', {...invitation, verificationToken})
  }
  console.log(`Signed up ${email} with the password ${password}`)
}

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
  if (!(await getUser(client, email))) await signUp(stack, client, email)
  const user = await getUser(client, email)
  await client.end()
  if (!user) throw new Error(`Could not sign up ${email}`)

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
