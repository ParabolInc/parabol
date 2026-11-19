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

const toCookieHeader = (setCookie: string) =>
  `__Host-Http-authToken=${setCookie.split('__Host-Http-authToken=')[1]!.split(';')[0]}`

test('A session from before the viewer joined a team lists the teams its token covers', async () => {
  const [owner, member] = await Promise.all([signUp(), signUp()])
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
    variables: {teamId: owner.teamId, invitees: [member.email]},
    cookie: owner.cookie
  })
  expect(invited.errors).toBeUndefined()
  const invitation = await getKysely()
    .selectFrom('TeamInvitation')
    .select('token')
    .where('teamId', '=', owner.teamId)
    .where('email', '=', member.email)
    .executeTakeFirstOrThrow()
  const staleCookie = toCookieHeader(member.cookie)
  const accepted = await sendPublic({
    query: `
      mutation AcceptTeamInvitation($invitationToken: ID!) {
        acceptTeamInvitation(invitationToken: $invitationToken) {
          team {
            id
          }
        }
      }
    `,
    variables: {invitationToken: invitation.token},
    cookie: staleCookie
  })
  expect(accepted.errors).toBeUndefined()

  const staleSession = await sendPublic({query: VIEWER_TEAMS_QUERY, cookie: staleCookie})
  expect(staleSession.errors).toBeUndefined()
  expect(staleSession.data.viewer.teams.map(({id}: {id: string}) => id)).toEqual([member.teamId])

  const currentSession = await sendPublic({
    query: VIEWER_TEAMS_QUERY,
    cookie: toCookieHeader(accepted.cookie)
  })
  expect(currentSession.errors).toBeUndefined()
  expect(currentSession.data.viewer.teams.map(({id}: {id: string}) => id).sort()).toEqual(
    [member.teamId, owner.teamId].sort()
  )
})
