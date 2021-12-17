import {sendPublic, signUp} from './common'

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
})
