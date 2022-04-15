import {drainRethink, sendPublic, signUp} from './common'

afterAll(() => {
  return drainRethink()
})

test('Login after signup', async () => {
  const {email, password} = await signUp()

  const login = await sendPublic({
    query: `
      mutation LoginWithPasswordMutation(
        $email: ID!
        $password: String!
        $invitationToken: ID
      ) {
        loginWithPassword(email: $email, password: $password) {
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
            lastSeenAt
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
    `,
    variables: {
      email,
      password,
      invitationToken: null
    }
  })
  expect(login).toMatchObject({
    data: {
      loginWithPassword: {
        error: null,
        authToken: expect.anything(),
        user: {
          id: expect.anything(),
          email
        }
      }
    }
  })
  const lastSeenAt = Date.parse(login.data.loginWithPassword.user.lastSeenAt)
  expect(lastSeenAt).toBeGreaterThan(Date.now() - 1000 * 60) // lastSeenAt should be more recent than 1 minute ago
  expect(lastSeenAt).toBeLessThan(Date.now())
})
