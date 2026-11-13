import {getTestEmail, sendPublic, signUpWithPasswordMutation} from './common'

test('Login after signup', async () => {
  const {email, password} = await signUpWithPasswordMutation(getTestEmail())

  const login = await sendPublic({
    query: `
      mutation LoginWithPasswordMutation(
        $email: ID!
        $password: String!
        $invitationToken: ID! = ""
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
      invitationToken: ''
    }
  })
  expect(login).toMatchObject({
    cookie: expect.anything(),
    data: {
      loginWithPassword: {
        error: null,
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

test('A failed login sent with an invitation returns user errors for both, not a top-level error', async () => {
  const {email} = await signUpWithPasswordMutation(getTestEmail())

  const login = await sendPublic({
    query: `
      mutation LoginWithPasswordMutation($email: ID!, $password: String!, $invitationToken: ID!) {
        loginWithPassword(email: $email, password: $password) {
          userErrors {
            code
            message
          }
          userId
        }
        acceptTeamInvitation(invitationToken: $invitationToken) {
          userErrors {
            code
          }
          team {
            id
          }
        }
      }
    `,
    variables: {email, password: 'not-the-password', invitationToken: 'not-a-token'}
  })

  expect(login).toEqual({
    data: {
      loginWithPassword: {
        userErrors: [{code: 'INVALID_CREDENTIALS', message: 'Invalid email or password'}],
        userId: null
      },
      acceptTeamInvitation: {userErrors: [{code: 'NOT_SIGNED_IN'}], team: null}
    }
  })
})
