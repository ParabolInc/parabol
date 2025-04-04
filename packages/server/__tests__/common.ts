import base64url from 'base64url'
import crypto from 'crypto'
import faker from 'faker'
import {sql} from 'kysely'
import ServerAuthToken from '../database/types/ServerAuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'

const HOST = process.env.GRAPHQL_HOST || 'localhost:3000'
const PROTOCOL = process.env.GRAPHQL_PROTOCOL || 'http'

export async function sendIntranet(req: {query: string; variables?: Record<string, any>}) {
  const authToken = encodeAuthToken(new ServerAuthToken())

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

export async function sendPublic(req: {
  query: string
  variables?: Record<string, any>
  authToken?: string
}) {
  const authToken = req.authToken ?? ''
  const {query, variables} = req
  // the production build doesn't allow ad-hoc queries, so persist it
  const docId = await persistQuery(query)
  const response = await fetch(`${PROTOCOL}://${HOST}/graphql`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      docId,
      variables
    })
  })
  const body = await response.json()
  return body
}

const SIGNUP_WITH_PASSWORD_MUTATION = `
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
      authToken
      user {
        tms
        id
        email
        picture
        preferredName
        createdAt
      }
    }
    acceptTeamInvitation(invitationToken: $invitationToken) {
      authToken
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
  const signUp = await sendIntranet({
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
        error: null,
        authToken: expect.anything(),
        user: {
          id: expect.anything(),
          email
        }
      }
    }
  })
  const userId = signUp.data.signUpWithPassword.user.id
  const authToken = signUp.data.signUpWithPassword.authToken

  return {
    userId,
    email,
    password,
    authToken
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
