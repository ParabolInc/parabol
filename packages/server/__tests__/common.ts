require('../../../scripts/webpack/utils/dotenv')
import axios from 'axios'
import faker from 'faker'
import ServerAuthToken from '../database/types/ServerAuthToken'
import encodeAuthToken from '../utils/encodeAuthToken'

export async function sendIntranet(req: {
  query: string
  variables?: Record<string, any>
  isPrivate?: boolean
}) {
  const authToken = encodeAuthToken(new ServerAuthToken())
  const headers: any = {
    'content-type': 'application/json',
    'x-application-authorization': `Bearer ${authToken}`
  }

  const client = axios.create({
    baseURL: 'http://localhost:3000/',
    responseType: 'json'
  })

  const response = await client.post(
    'intranet-graphql',
    {
      isPrivate: req.isPrivate,
      query: req.query,
      variables: req.variables
    },
    {
      headers
    }
  )
  return response.data
}

export async function sendPublic(req: {
  query: string
  variables?: Record<string, any>
  authToken?: string
}) {
  const authToken = req.authToken ?? ''
  const headers: any = {
    'content-type': 'application/json',
    'x-application-authorization': `Bearer ${authToken}`
  }

  const client = axios.create({
    baseURL: 'http://localhost:3000/',
    responseType: 'json'
  })

  const response = await client.post(
    '/graphql',
    {
      type: 'start',
      payload: {
        query: req.query,
        variables: req.variables
      }
    },
    {
      headers
    }
  )
  return response.data.payload
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
