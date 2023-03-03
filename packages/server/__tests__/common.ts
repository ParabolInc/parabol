//@ts-ignore
import faker from 'faker'
import fetch from 'node-fetch'
import getRethink from '../database/rethinkDriver'
import ServerAuthToken from '../database/types/ServerAuthToken'
//@ts-ignore
import persistFunction from '../graphql/persistFunction'
import encodeAuthToken from '../utils/encodeAuthToken'

const HOST = process.env.GRAPHQL_HOST || 'localhost:3000'
const PROTOCOL = process.env.GRAPHQL_PROTOCOL || 'http'

export async function sendIntranet(req: {
  query: string
  variables?: Record<string, any>
  isPrivate?: boolean
}) {
  const authToken = encodeAuthToken(new ServerAuthToken())

  const response = await fetch(`${PROTOCOL}://${HOST}/intranet-graphql`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-application-authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      isPrivate: req.isPrivate,
      query: req.query,
      variables: req.variables
    })
  })
  return response.json()
}

export const drainRethink = async () => {
  const r = await getRethink()
  r.getPoolMaster()?.drain()
}

const persistQuery = async (query: string) => {
  const r = await getRethink()
  const id = await persistFunction(query.trim())
  const record = {
    id,
    query,
    createdAt: new Date()
  }
  await r.table('QueryMap').insert(record, {conflict: 'replace'}).run()
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
  const documentId = await persistQuery(query)
  const response = await fetch(`${PROTOCOL}://${HOST}/graphql`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-application-authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      type: 'start',
      payload: {
        documentId,
        variables
      }
    })
  })
  const body = await response.json()
  return body.payload
}

const SIGNUP_WITH_PASSWORD_MUTATION = `
  mutation SignUpWithPasswordMutation(
    $email: ID!
    $password: String!
    $invitationToken: ID! = ""
    $segmentId: ID
  ) {
    signUpWithPassword(email: $email, password: $password, invitationToken: $invitationToken, segmentId: $segmentId) {
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

export const signUpWithEmail = async (emailInput: string, invitationToken?: string) => {
  //FIXME #1402 email addresses are case sensitive
  const email = emailInput.toLowerCase()

  const password = faker.internet.password()
  const signUp = await sendIntranet({
    query: SIGNUP_WITH_PASSWORD_MUTATION,
    variables: {
      email,
      password,
      segmentId: null,
      invitationToken
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
    },
    isPrivate: true
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
  return user.data.user.teams
}
