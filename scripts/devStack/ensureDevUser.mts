import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import type {Client} from 'pg'
import getProjectRoot from '../webpack/utils/getProjectRoot.js'
import type {DevStack} from './readStack.mts'

type GraphQLResponse<TData> = {data: TData; errors?: {message: string}[]}
type SignUpData = {signUpWithPassword: {error?: {message: string} | null}}

const callMutation = async <TData,>(
  stack: DevStack,
  name: string,
  variables: Record<string, unknown>
) => {
  const queryMap: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(getProjectRoot(), 'queryMap.json'), 'utf8')
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

// The user with that email on the running dev stack, signed up first if there is none yet
const ensureDevUser = async (stack: DevStack, client: Client, email: string) => {
  if (!(await getUser(client, email))) await signUp(stack, client, email)
  const user = await getUser(client, email)
  if (!user) throw new Error(`Could not sign up ${email}`)
  return user
}

export default ensureDevUser
