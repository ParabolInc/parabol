import {getUserTeams, sendPublic, signUp} from './common'

test('Invite to team, works for valid email', async () => {
  const {userId, authToken} = await signUp()

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
      invitees: ['nick@parabol.co']
    },
    authToken
  })

  expect(inviteToTeam).toMatchObject({
    data: {
      inviteToTeam: {
        error: null,
        invitees: ['nick@parabol.co']
      }
    }
  })
})
