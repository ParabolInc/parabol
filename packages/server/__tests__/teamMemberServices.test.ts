import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const SERVICES_QUERY = `
  query TeamMemberServices($userId: ID!, $teamId: ID!) {
    viewer {
      teamMember(userId: $userId, teamId: $teamId) {
        services {
          service
          isConnected
          auth {
            ... on TeamMemberIntegrationAuthOAuth2 {
              accessToken
            }
          }
        }
      }
    }
  }
`

const INTEGRATIONS_QUERY = `
  query TeamMemberIntegrations($userId: ID!, $teamId: ID!) {
    viewer {
      teamMember(userId: $userId, teamId: $teamId) {
        integrations {
          id
        }
      }
    }
  }
`

const joinTeam = async (
  host: {cookie: string; teamId: string},
  guest: {cookie: string; email: string}
) => {
  const invited = await sendPublic({
    query: `
      mutation InviteToTeam($teamId: ID!, $invitees: [Email!]!) {
        inviteToTeam(teamId: $teamId, invitees: $invitees) {
          invitees
        }
      }
    `,
    variables: {teamId: host.teamId, invitees: [guest.email]},
    cookie: host.cookie
  })
  expect(invited.data.inviteToTeam.invitees).toEqual([guest.email])
  const invitation = await getKysely()
    .selectFrom('TeamInvitation')
    .select('token')
    .where('teamId', '=', host.teamId)
    .where('email', '=', guest.email)
    .executeTakeFirstOrThrow()
  const accepted = await sendPublic({
    query: `
      mutation AcceptTeamInvitation($invitationToken: ID!) {
        acceptTeamInvitation(invitationToken: $invitationToken) {
          error {
            message
          }
          team {
            id
          }
        }
      }
    `,
    variables: {invitationToken: invitation.token},
    cookie: guest.cookie
  })
  expect(accepted.data.acceptTeamInvitation.error).toBeNull()
  const refreshedCookie: string = accepted.cookie ?? guest.cookie
  const token = refreshedCookie.split('__Host-Http-authToken=')[1]?.split(';')[0]
  expect(token).toBeTruthy()
  return token!
}

test('a teammate cannot read services or integrations of another member', async () => {
  const [owner, teammate] = await Promise.all([signUp(), signUp()])
  const teammateToken = await joinTeam(owner, teammate)
  const variables = {userId: owner.userId, teamId: owner.teamId}

  const services = await sendPublic({
    query: SERVICES_QUERY,
    variables,
    bearerToken: teammateToken
  })
  expect(services.data?.viewer?.teamMember ?? null).toBeNull()
  expect(services.errors?.length).toBeGreaterThan(0)

  const integrations = await sendPublic({
    query: INTEGRATIONS_QUERY,
    variables,
    bearerToken: teammateToken
  })
  expect(integrations.data.viewer.teamMember).toBeNull()
  expect(integrations.errors?.length).toBeGreaterThan(0)
})

test('a non-member cannot read services', async () => {
  const [owner, stranger] = await Promise.all([signUp(), signUp()])
  const res = await sendPublic({
    query: SERVICES_QUERY,
    variables: {userId: owner.userId, teamId: owner.teamId},
    cookie: stranger.cookie
  })
  expect(res.errors?.length).toBeGreaterThan(0)
  expect(res.data?.viewer?.teamMember ?? null).toBeNull()
})

test('the member themselves can read their own services', async () => {
  const owner = await signUp()
  const res = await sendPublic({
    query: SERVICES_QUERY,
    variables: {userId: owner.userId, teamId: owner.teamId},
    cookie: owner.cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.viewer.teamMember.services).toHaveLength(6)
})
