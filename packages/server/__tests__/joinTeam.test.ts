import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const VIEWER_TEAMS_QUERY = `
  query ViewerTeams {
    viewer {
      teams {
        id
        sortOrder
      }
    }
  }
`

const toCookieHeader = (setCookie: string) => {
  const token = setCookie.split('__Host-Http-authToken=')[1]?.split(';')[0]
  return `__Host-Http-authToken=${token}`
}

test('Joining a public team over HTTP sets a cookie that is on the team', async () => {
  const [owner, joiner] = await Promise.all([signUp(), signUp()])

  const publicTeam = await sendPublic({
    query: `
      mutation AddTeam($newTeam: NewTeamInput!) {
        addTeam(newTeam: $newTeam) {
          error {
            message
          }
          team {
            id
          }
        }
      }
    `,
    variables: {newTeam: {name: 'Public team', orgId: owner.orgId, isPublic: true}},
    cookie: owner.cookie
  })
  expect(publicTeam.data.addTeam.error).toBeNull()
  const publicTeamId = publicTeam.data.addTeam.team.id

  const invited = await sendPublic({
    query: `
      mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
        inviteToTeam(teamId: $teamId, invitees: $invitees) {
          invitees {
            status
          }
        }
      }
    `,
    variables: {teamId: owner.teamId, invitees: [joiner.email]},
    cookie: owner.cookie
  })
  expect(invited.errors).toBeUndefined()
  const invitation = await getKysely()
    .selectFrom('TeamInvitation')
    .select('token')
    .where('teamId', '=', owner.teamId)
    .where('email', '=', joiner.email)
    .executeTakeFirstOrThrow()
  const accepted = await sendPublic({
    query: `
      mutation AcceptTeamInvitation($invitationToken: ID!) {
        acceptTeamInvitation(invitationToken: $invitationToken) {
          error {
            message
          }
        }
      }
    `,
    variables: {invitationToken: invitation.token},
    cookie: joiner.cookie
  })
  expect(accepted.data.acceptTeamInvitation.error).toBeNull()
  const orgMemberCookie = toCookieHeader(accepted.cookie)

  const joined = await sendPublic({
    query: `
      mutation JoinTeam($teamId: ID!) {
        joinTeam(teamId: $teamId) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on JoinTeamSuccess {
            team {
              id
            }
          }
        }
      }
    `,
    variables: {teamId: publicTeamId},
    cookie: orgMemberCookie
  })
  expect(joined.errors).toBeUndefined()
  expect(joined.data.joinTeam.team.id).toBe(publicTeamId)

  const teams = await sendPublic({
    query: VIEWER_TEAMS_QUERY,
    cookie: joined.cookie ? toCookieHeader(joined.cookie) : orgMemberCookie
  })
  expect(teams.errors).toBeUndefined()
  expect(teams.data.viewer.teams).toContainEqual(expect.objectContaining({id: publicTeamId}))
})
