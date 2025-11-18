import {HocuspocusProvider, HocuspocusProviderWebsocket} from '@hocuspocus/provider'
import base64url from 'base64url'
import crypto from 'crypto'
import faker from 'faker'
import {sql} from 'kysely'
import {Doc} from 'yjs'
import AuthToken from '../database/types/AuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'

const HOST = `${process.env.HOST}:${process.env.PORT}` || 'localhost:3000'
const PROTOCOL = process.env.PROTO || 'http'
const WS_PROTOCOL = PROTOCOL === 'https' ? 'wss' : 'ws'

export async function sendIntranet(req: {query: string; variables?: Record<string, any>}) {
  // getUserId looks out to make sure aGhostUser is not used, so we use the other userId that is available
  const authToken = encodeAuthToken(new AuthToken({sub: 'parabolAIUser', tms: [], rol: 'su'}))

  const response = await fetch(`${PROTOCOL}://${HOST}/graphql`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      query: req.query,
      variables: req.variables
    })
  })
  return response.json()
}

const persistFunction = (text: string) => {
  const hasher = crypto.createHash('md5')
  hasher.update(text)
  const unsafeId = hasher.digest('base64')
  const safeId = base64url.fromBase64(unsafeId)
  const prefix = text[0]
  const id = `${prefix}_${safeId}`
  return id
}

const persistQuery = async (query: string) => {
  const pg = getKysely()
  const id = persistFunction(query.trim())
  const record = {
    id,
    query,
    createdAt: new Date()
  }
  await pg
    .insertInto('QueryMap')
    .values(record)
    .onConflict((oc) => oc.doNothing())
    .execute()
  return id
}

export async function sendTipTap<T>(
  {cookie, pageId}: {cookie: string; pageId: string},
  cb: (doc: Doc) => Promise<T>
) {
  // The browser would normally set the cookie. The WebSocket API however does not allow to set custom headers
  const token = cookie.split('__Host-Http-authToken=')[1]?.split(';')[0]
  const socket = new HocuspocusProviderWebsocket({
    url: `${WS_PROTOCOL}://${HOST}/yjs?token=${token}`
  })
  const doc = new Doc()
  // update the URL to match the title
  const provider = new HocuspocusProvider({
    websocketProvider: socket,
    name: pageId,
    document: doc
  })
  provider.attach()
  return new Promise((resolve) => {
    provider.on('synced', async () => {
      const res = await cb(provider.document)
      // no great way to get these in an afterAll or globalTeardown, so we destroy them per-request
      socket.destroy()
      provider.destroy()
      resolve(res)
    })
  })
}
export async function sendPublic(req: {
  query: string
  variables?: Record<string, any>
  cookie?: string
}) {
  const cookie = req.cookie ?? ''
  const {query, variables} = req
  // the production build doesn't allow ad-hoc queries, so persist it

  const docId = await persistQuery(query)
  const response = await fetch(`${PROTOCOL}://${HOST}/graphql`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      cookie
    },
    body: JSON.stringify({
      docId,
      variables
    })
  })

  const authCookie = response.headers.get('set-cookie')
  const body = await response.json()
  // add the cookie directly on the body for convenience in tests
  return {
    ...body,
    ...(authCookie ? {cookie: authCookie} : {})
  }
}

export const SIGNUP_WITH_PASSWORD_MUTATION = `
  mutation SignUpWithPasswordMutation(
    $email: ID!
    $password: String!
    $invitationToken: ID!
    $pseudoId: ID
    $params: String!
  ) {
    signUpWithPassword(email: $email, password: $password, invitationToken: $invitationToken, pseudoId: $pseudoId, params: $params) {
      error {
        message
      }
      user {
        tms
        id
        email
        picture
        preferredName
        createdAt
        teams {
          id
        }
        organizations {
          id
        }
      }
    }
    acceptTeamInvitation(invitationToken: $invitationToken) {
      error {
        message
      }
      meetingId
      team {
        id
        activeMeetings {
          __typename
          id
        }
      }
    }
  }
`

export const signUpWithEmail = async (emailInput: string) => {
  //FIXME #1402 email addresses are case sensitive
  const email = emailInput.toLowerCase()

  const password = faker.internet.password()
  const signUp = await sendPublic({
    query: SIGNUP_WITH_PASSWORD_MUTATION,
    variables: {
      email,
      password,
      pseudoId: null,
      invitationToken: '',
      params: ''
    }
  })

  expect(signUp).toMatchObject({
    data: {
      signUpWithPassword: {
        error: {
          message: 'Verification required. Check your inbox.'
        },
        user: null
      }
    }
  })

  const pg = getKysely()
  const verification = await pg
    .selectFrom('EmailVerification')
    .selectAll()
    .where('email', '=', email)
    .where('expiration', '>', new Date())
    .executeTakeFirst()

  const verifyEmail = await sendPublic({
    query: `
      mutation VerifyEmailMutation(
        $verificationToken: ID!
      ) {
        verifyEmail(verificationToken: $verificationToken) {
          error {
            message
          }
          user {
            tms
            id
            email
            picture
            preferredName
            createdAt
            teams {
              id
            }
            organizations {
              id
            }
          }
        }
      }
    `,
    variables: {
      verificationToken: verification!.token
    }
  })

  expect(verifyEmail).toMatchObject({
    cookie: expect.anything(),
    data: {
      verifyEmail: {
        error: null,
        user: {
          id: expect.anything(),
          email
        }
      }
    }
  })

  const {data, cookie} = verifyEmail
  const {user} = data.verifyEmail
  const {id: userId, teams, organizations} = user
  const teamId = teams[0]!.id
  const orgId = organizations[0]!.id
  return {
    userId,
    email,
    password,
    teamId,
    orgId,
    cookie
  }
}

export const signUp = async () => {
  const email = faker.internet.email()
  return signUpWithEmail(email)
}

export const getUserTeams = async (userId: string) => {
  const user = await sendIntranet({
    query: `
      query User($userId: ID!) {
        user(userId: $userId) {
          id
          teams {
            id
          }
        }
      }
    `,
    variables: {
      userId
    }
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        teams: expect.arrayContaining([
          {
            id: expect.anything()
          }
        ])
      }
    }
  })
  return user.data.user.teams as [{id: string}, ...{id: string}[]]
}

export const getUserOrgs = async (userId: string) => {
  const user = await sendIntranet({
    query: `
      query User($userId: ID!) {
        user(userId: $userId) {
          id
          organizations {
            id
          }
        }
      }
    `,
    variables: {
      userId
    }
  })

  expect(user).toMatchObject({
    data: {
      user: {
        id: userId,
        organizations: expect.arrayContaining([
          {
            id: expect.anything()
          }
        ])
      }
    }
  })
  return user.data.user.organizations as [{id: string}, ...{id: string}[]]
}

export const createPGTables = async (...tables: string[]) => {
  const pg = getKysely()
  await Promise.all(
    tables.map(async (table) => {
      return sql`
      CREATE TABLE IF NOT EXISTS ${sql.table(table)} (like "public".${sql.table(table)} including ALL)`.execute(
        pg
      )
    })
  )
  await truncatePGTables(...tables)
}

export const truncatePGTables = async (...tables: string[]) => {
  const pg = getKysely()
  await Promise.all(
    tables.map(async (table) => {
      return sql`TRUNCATE TABLE ${sql.table(table)} CASCADE`.execute(pg)
    })
  )
}
