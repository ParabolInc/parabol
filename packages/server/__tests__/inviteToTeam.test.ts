import {drainRethink, getUserTeams, sendPublic, signUp} from './common'

afterAll(() => {
  return drainRethink()
})

test('Invite to team', async () => {
  const {userId, authToken} = await signUp()
  const {email: inviteeEmail} = await signUp()

  const teamId = (await getUserTeams(userId))[0].id
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
