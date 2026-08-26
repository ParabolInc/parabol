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

type ServiceEntry = {service: string; isConnected: boolean; auth: unknown}

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

const connectGitHub = async (userId: string, teamId: string) => {
  const pg = getKysely()
  const provider = await pg
    .selectFrom('IntegrationProvider')
    .select('id')
    .where('service', '=', 'github')
    .where('scope', '=', 'global')
    .executeTakeFirstOrThrow()
  const {id} = await pg
    .insertInto('TeamMemberIntegrationAuth')
    .values({
      providerId: provider.id,
      service: 'github',
      teamId,
      userId,
      accessToken: 'test-token',
      providerUserId: `test-${userId}`
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  return () => pg.deleteFrom('TeamMemberIntegrationAuth').where('id', '=', id).execute()
}

test('a teammate can read services but not the auth or integrations of another member', async () => {
  const [owner, teammate] = await Promise.all([signUp(), signUp()])
  const teammateToken = await joinTeam(owner, teammate)
  const variables = {userId: owner.userId, teamId: owner.teamId}

  const services = await sendPublic({query: SERVICES_QUERY, variables, bearerToken: teammateToken})
  const authPaths = services.errors.map(({path}: {path: unknown[]}) => path.at(-1))
  expect(authPaths).toEqual(Array(6).fill('auth'))
  const entries: ServiceEntry[] = services.data.viewer.teamMember.services
  expect(entries.map(({service}) => service).sort()).toEqual([
    'azureDevOps',
    'github',
    'gitlab',
    'jira',
    'jiraServer',
    'linear'
  ])
  expect(entries.every(({isConnected}) => isConnected === false)).toBe(true)
  expect(entries.every(({auth}) => auth === null)).toBe(true)

  const integrations = await sendPublic({
    query: INTEGRATIONS_QUERY,
    variables,
    bearerToken: teammateToken
  })
  expect(integrations.data.viewer.teamMember).toBeNull()
  expect(integrations.errors?.length).toBeGreaterThan(0)
})

test("a teammate sees another member's connection state", async () => {
  const [owner, teammate] = await Promise.all([signUp(), signUp()])
  const teammateToken = await joinTeam(owner, teammate)
  const disconnect = await connectGitHub(owner.userId, owner.teamId)
  try {
    const services = await sendPublic({
      query: SERVICES_QUERY,
      variables: {userId: owner.userId, teamId: owner.teamId},
      bearerToken: teammateToken
    })
    const entries: ServiceEntry[] = services.data.viewer.teamMember.services
    const github = entries.find(({service}) => service === 'github')
    expect(github).toMatchObject({isConnected: true, auth: null})
  } finally {
    await disconnect()
  }
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
