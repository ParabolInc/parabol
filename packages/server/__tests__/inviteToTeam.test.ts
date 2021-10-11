import {sendIntranet, sendPublic, signUp} from './common'

test('Invite to team', async () => {
  const {email, userId, authToken} = await signUp()
  const {email: inviteeEmail} = await signUp()

  const user = await sendIntranet({
    query: `
      query User($email: String!) {
        user(email: $email) {
          id
          teams {
            id
          }
        }
      }
    `,
    variables: {
      email
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
  const teamId = user.data.user.teams[0].id

  await new Promise((resolve) => setTimeout(resolve, 3000))

  const inviteToTeam = await sendPublic({
    query: `
      mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
        inviteToTeam(teamId: $teamId, invitees: $invitees) {
          error {
            title
            message
          }
          invitees
        }
      }
    `,
    variables: {
      teamId,
      invitees: ['foo@example.com', inviteeEmail]
    },
    authToken
  })

  expect(inviteToTeam).toMatchObject({
    data: {
      inviteToTeam: {
        error: null,
        invitees: ['foo@example.com', inviteeEmail]
      }
    }
  })
})
