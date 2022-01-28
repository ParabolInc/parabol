require('../../../scripts/webpack/utils/dotenv')
import fetch from 'node-fetch'
import faker from 'faker'
import ServerAuthToken from '../database/types/ServerAuthToken'
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

export async function sendPublic(req: {
  query: string
  variables?: Record<string, any>
  authToken?: string
}) {
  const authToken = req.authToken ?? ''

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
        query: req.query,
        variables: req.variables
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
    $invitationToken: ID
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

export const signUpWithEmail = async (emailInput: string) => {
  //FIXME #1402 email addresses are case sensitive
  const email = emailInput.toLowerCase()

  const password = faker.internet.password()
  const signUp = await sendIntranet({
    query: SIGNUP_WITH_PASSWORD_MUTATION,
    variables: {
      email,
      password,
      invitationToken: null,
      segmentId: null
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
