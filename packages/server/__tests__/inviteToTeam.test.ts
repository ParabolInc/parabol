import {getUserTeams, sendPublic, signUp} from './common'

test('Invite to team, works for ordinary email domain', async () => {
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
      invitees: ['foo@example.com']
    },
    authToken
  })

  expect(inviteToTeam).toMatchObject({
    data: {
      inviteToTeam: {
        error: null,
        invitees: ['foo@example.com']
      }
    }
  })
})

test('Invite to team, deny for untrusted domain', async () => {
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
      invitees: ['foo@qq.com']
    },
    authToken
  })

  expect(inviteToTeam).toMatchObject({
    data: {
      inviteToTeam: {
        error: {
          message: 'Cannot invite by email. Try using invite link',
          title: null
        }
      }
    }
  })
})
