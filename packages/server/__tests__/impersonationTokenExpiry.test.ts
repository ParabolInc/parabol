import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import generateUID from '../generateUID'
import {getFreshTokenIfNeeded} from '../getFreshTokenIfNeeded'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {sendPublic, signUp} from './common'

const createImposterToken = (sub: string, tms: string[]) =>
  new AuthToken({sub, tms, rol: 'impersonate', lifespan_ms: ms('2h')})

const toAuthCookie = (authToken: AuthToken) => `__Host-Http-authToken=${encodeAuthToken(authToken)}`

const getAuthTokenFromSetCookie = (setCookie: string) =>
  getVerifiedAuthToken(setCookie.split('__Host-Http-authToken=')[1]?.split(';')[0])

describe('re-issuing a token', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-10-31T12:00:00.000Z')))
  afterEach(() => jest.useRealTimers())

  test('keeps the expiry of an impersonation token', () => {
    const imposterToken = createImposterToken('user:customer', ['team:first'])
    jest.advanceTimersByTime(ms('2m'))
    const {tms, sub, rol, exp} = imposterToken
    const nextAuthToken = new AuthToken({tms: [...tms, 'team:second'], sub, rol, exp})
    expect(nextAuthToken.exp).toBe(imposterToken.exp)
  })

  test('does not let a longer lifespan extend an impersonation', () => {
    const imposterToken = createImposterToken('user:customer', ['team:first'])
    const nextAuthToken = new AuthToken({...imposterToken, lifespan_ms: ms('30d')})
    expect(nextAuthToken.exp).toBe(imposterToken.exp)
  })

  test('in getFreshTokenIfNeeded keeps the expiry of an impersonation token', () => {
    const imposterToken = createImposterToken('user:customer', ['team:first'])
    jest.advanceTimersByTime(ms('2m'))
    const freshToken = getFreshTokenIfNeeded(imposterToken, imposterToken.tms)
    expect(freshToken?.exp).toBe(imposterToken.exp)
  })

  test('in getFreshTokenIfNeeded still extends a regular session', () => {
    const authToken = new AuthToken({sub: 'user:customer', tms: ['team:first']})
    jest.advanceTimersByTime(ms('16d'))
    const freshToken = getFreshTokenIfNeeded(authToken, authToken.tms)
    expect(freshToken?.exp).toBe(authToken.exp + ms('16d') / 1000)
  })
})

test('addTeam keeps the expiry of an impersonation cookie', async () => {
  const {userId, teamId, orgId} = await signUp()
  const imposterToken = createImposterToken(userId, [teamId])
  const addTeam = await sendPublic({
    query: `
      mutation AddTeam($newTeam: NewTeamInput!) {
        addTeam(newTeam: $newTeam) {
          team {
            id
          }
        }
      }
    `,
    variables: {newTeam: {name: `Team ${generateUID()}`, orgId, isPublic: false}},
    cookie: toAuthCookie(imposterToken)
  })
  expect(addTeam.data.addTeam.team.id).toEqual(expect.any(String))
  expect(getAuthTokenFromSetCookie(addTeam.cookie)?.exp).toBe(imposterToken.exp)
})

test('acceptTeamInvitation keeps the expiry of an impersonation cookie', async () => {
  const [inviter, invitee] = await Promise.all([signUp(), signUp()])
  await sendPublic({
    query: `
      mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
        inviteToTeam(teamId: $teamId, invitees: $invitees) {
          team {
            id
          }
        }
      }
    `,
    variables: {teamId: inviter.teamId, invitees: [invitee.email]},
    cookie: inviter.cookie
  })
  const {token: invitationToken} = await getKysely()
    .selectFrom('TeamInvitation')
    .select('token')
    .where('email', '=', invitee.email)
    .where('teamId', '=', inviter.teamId)
    .executeTakeFirstOrThrow()
  const imposterToken = createImposterToken(invitee.userId, [invitee.teamId])
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
    variables: {invitationToken},
    cookie: toAuthCookie(imposterToken)
  })
  expect(accepted.data.acceptTeamInvitation.error).toBeNull()
  expect(getAuthTokenFromSetCookie(accepted.cookie)?.exp).toBe(imposterToken.exp)
})
