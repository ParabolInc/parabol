import AuthToken from '../database/types/AuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import {sendPublic, signUp} from './common'

const VIEWER_TEAMS_QUERY = `
  query ViewerTeams {
    viewer {
      teams {
        id
        name
        sortOrder
      }
    }
  }
`

const TEAM_QUERY = `
  query Team($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        id
        name
      }
    }
  }
`

const toCookieHeader = (setCookie: string) => {
  const token = setCookie.split('__Host-Http-authToken=')[1]?.split(';')[0]
  return `__Host-Http-authToken=${token}`
}

const readTokenTeamIds = (cookie: string) => {
  const token = cookie.split('__Host-Http-authToken=')[1]!.split(';')[0]!
  const payload = JSON.parse(Buffer.from(token.split('.')[1]!, 'base64url').toString())
  return payload.tms as string[]
}

const joinTeamInAnotherSession = async () => {
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
  const otherSessionCookie = toCookieHeader(member.cookie)
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
    cookie: otherSessionCookie
  })
  expect(accepted.data.acceptTeamInvitation.error).toBeNull()
  return {owner, member, staleCookie: toCookieHeader(member.cookie)}
}

test('A session that started before the viewer joined a team lists that team and gets a token on it', async () => {
  const {owner, member, staleCookie} = await joinTeamInAnotherSession()
  expect(readTokenTeamIds(staleCookie)).not.toContain(owner.teamId)

  const teams = await sendPublic({query: VIEWER_TEAMS_QUERY, cookie: staleCookie})
  expect(teams.errors).toBeUndefined()
  expect(teams.data.viewer.teams).toEqual(
    expect.arrayContaining([
      expect.objectContaining({id: member.teamId, name: expect.any(String)}),
      expect.objectContaining({id: owner.teamId, name: expect.any(String)})
    ])
  )
  expect(teams.data.viewer.teams).toHaveLength(2)
  expect(readTokenTeamIds(teams.cookie).sort()).toEqual([member.teamId, owner.teamId].sort())

  const team = await sendPublic({
    query: TEAM_QUERY,
    variables: {teamId: owner.teamId},
    cookie: toCookieHeader(teams.cookie)
  })
  expect(team.errors).toBeUndefined()
  expect(team.data.viewer.team.id).toBe(owner.teamId)
})

test('A session whose token lists every team of the viewer keeps its token', async () => {
  const member = await signUp()
  const cookie = toCookieHeader(member.cookie)
  const teams = await sendPublic({query: VIEWER_TEAMS_QUERY, cookie})
  expect(teams.errors).toBeUndefined()
  expect(teams.data.viewer.teams).toEqual([expect.objectContaining({id: member.teamId})])
  expect(teams.cookie).toBeUndefined()
})

test("A super user reading another user's teams keeps their own token", async () => {
  const {owner, member} = await joinTeamInAnotherSession()
  const superUserToken = encodeAuthToken(new AuthToken({sub: owner.userId, tms: [], rol: 'su'}))
  const user = await sendPublic({
    query: `
      query User($userId: ID!) {
        user(userId: $userId) {
          teams {
            id
          }
        }
      }
    `,
    variables: {userId: member.userId},
    bearerToken: superUserToken
  })
  expect(user.errors).toBeUndefined()
  expect(user.data.user.teams.map(({id}: {id: string}) => id).sort()).toEqual(
    [member.teamId, owner.teamId].sort()
  )
  expect(user.cookie).toBeUndefined()
})
