import AuthToken from '../database/types/AuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
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

const getTokenFromSetCookie = (setCookie: string) =>
  setCookie.split('__Host-Http-authToken=')[1]!.split(';')[0]!

const toCookieHeader = (token: string) => `__Host-Http-authToken=${token}`

const joinTeamFromAnotherDevice = async () => {
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
  const otherDeviceToken = new AuthToken({sub: member.userId, tms: [member.teamId]})
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
    cookie: toCookieHeader(encodeAuthToken(otherDeviceToken))
  })
  expect(accepted.data.acceptTeamInvitation.error).toBeNull()
  return {owner, member}
}

test('A session from before the viewer joined a team loads that team and gets a cookie on it', async () => {
  const {owner, member} = await joinTeamFromAnotherDevice()
  const bothTeamIds = [member.teamId, owner.teamId].sort()

  const staleSession = await sendPublic({
    query: VIEWER_TEAMS_QUERY,
    cookie: toCookieHeader(getTokenFromSetCookie(member.cookie))
  })
  expect(staleSession.errors).toBeUndefined()
  expect(staleSession.data.viewer.teams.map(({id}: {id: string}) => id).sort()).toEqual(bothTeamIds)
  const freshToken = getTokenFromSetCookie(staleSession.cookie)
  expect(getVerifiedAuthToken(freshToken)?.tms.sort()).toEqual(bothTeamIds)

  const freshSession = await sendPublic({
    query: VIEWER_TEAMS_QUERY,
    cookie: toCookieHeader(freshToken)
  })
  expect(freshSession.errors).toBeUndefined()
  expect(freshSession.cookie).toBeUndefined()
})

test('A session signed out from another device stays signed out', async () => {
  const {userId, cookie} = await signUp()
  const staleToken = new AuthToken({sub: userId, tms: []})
  staleToken.iat -= 60

  const signedOutElsewhere = await sendPublic({
    query: `
      mutation InvalidateSessions {
        invalidateSessions {
          error {
            message
          }
        }
      }
    `,
    cookie: toCookieHeader(getTokenFromSetCookie(cookie))
  })
  expect(signedOutElsewhere.errors).toBeUndefined()

  const staleSession = await sendPublic({
    query: VIEWER_TEAMS_QUERY,
    cookie: toCookieHeader(encodeAuthToken(staleToken))
  })
  expect(staleSession.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
  expect(staleSession.cookie).toBeUndefined()
})
