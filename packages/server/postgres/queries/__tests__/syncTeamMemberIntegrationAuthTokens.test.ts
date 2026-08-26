import getKysely from '../../getKysely'
import syncTeamMemberIntegrationAuthTokens from '../syncTeamMemberIntegrationAuthTokens'

const pg = getKysely()
const suffix = `stmat-${Date.now()}`
const userId = `user-${suffix}`
const orgId = `org-${suffix}`
const team1Id = `team1-${suffix}`
const team2Id = `team2-${suffix}`
const team3Id = `team3-${suffix}`
let jiraProviderId: number
let gitlabProviderId: number

const rowsForUser = () =>
  pg.selectFrom('TeamMemberIntegrationAuth').selectAll().where('userId', '=', userId).execute()

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Token Sync Tester'
    })
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Token Sync Org'}).execute()
  await pg
    .insertInto('Team')
    .values([
      {id: team1Id, name: 'Token Sync Team 1', orgId},
      {id: team2Id, name: 'Token Sync Team 2', orgId},
      {id: team3Id, name: 'Token Sync Team 3', orgId}
    ])
    .execute()
  const providers = await pg
    .insertInto('IntegrationProvider')
    .values([
      {
        service: 'jira',
        authStrategy: 'oauth2',
        scope: 'team',
        teamId: team1Id,
        serverBaseUrl: 'https://example.com',
        clientId: 'cid',
        clientSecret: 'secret'
      },
      {
        service: 'gitlab',
        authStrategy: 'oauth2',
        scope: 'team',
        teamId: team1Id,
        serverBaseUrl: 'https://gitlab.example.com',
        clientId: 'cid',
        clientSecret: 'secret'
      }
    ])
    .returning(['id', 'service'])
    .execute()
  jiraProviderId = providers.find(({service}) => service === 'jira')!.id
  gitlabProviderId = providers.find(({service}) => service === 'gitlab')!.id
  const jiraRow = (teamId: string, providerUserId: string) => ({
    teamId,
    userId,
    providerId: jiraProviderId,
    service: 'jira' as const,
    accessToken: `old-access-${teamId}`,
    refreshToken: `old-refresh-${teamId}`,
    scopes: 'read:jira-work',
    providerUserId,
    isActive: true
  })
  const gitlabRow = (teamId: string) => ({
    teamId,
    userId,
    providerId: gitlabProviderId,
    service: 'gitlab' as const,
    accessToken: `old-gitlab-access-${teamId}`,
    refreshToken: `old-gitlab-refresh-${teamId}`,
    scopes: 'api',
    providerUserId: null,
    isActive: true
  })
  await pg
    .insertInto('TeamMemberIntegrationAuth')
    .values([
      jiraRow(team1Id, 'acct-A'),
      jiraRow(team2Id, 'acct-A'),
      jiraRow(team3Id, 'acct-B'),
      gitlabRow(team1Id),
      gitlabRow(team2Id)
    ])
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('TeamMemberIntegrationAuth').where('userId', '=', userId).execute()
  await pg
    .deleteFrom('IntegrationProvider')
    .where('id', 'in', [jiraProviderId, gitlabProviderId])
    .execute()
  await pg.deleteFrom('Team').where('orgId', '=', orgId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  await pg.destroy()
})

describe('syncTeamMemberIntegrationAuthTokens', () => {
  it('updates every active row for the same provider account across teams', async () => {
    await syncTeamMemberIntegrationAuthTokens({
      userId,
      teamId: team1Id,
      providerId: jiraProviderId,
      providerUserId: 'acct-A',
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      scopes: 'read:jira-work offline_access',
      expiresAt: null
    })
    const rows = await rowsForUser()
    const jiraRow = (teamId: string) =>
      rows.find((row) => row.teamId === teamId && row.service === 'jira')!
    expect(jiraRow(team1Id).accessToken).toBe('new-access')
    expect(jiraRow(team2Id).accessToken).toBe('new-access')
    expect(jiraRow(team2Id).refreshToken).toBe('new-refresh')
    expect(jiraRow(team2Id).scopes).toBe('read:jira-work offline_access')
    expect(jiraRow(team3Id).accessToken).toBe(`old-access-${team3Id}`)
  })

  it('only writes the originating row when the provider account is unknown', async () => {
    await syncTeamMemberIntegrationAuthTokens({
      userId,
      teamId: team1Id,
      providerId: gitlabProviderId,
      providerUserId: null,
      accessToken: 'new-gitlab-access',
      refreshToken: 'new-gitlab-refresh',
      scopes: 'api',
      expiresAt: null
    })
    const rows = await rowsForUser()
    const gitlabRow = (teamId: string) =>
      rows.find((row) => row.teamId === teamId && row.service === 'gitlab')!
    expect(gitlabRow(team1Id).accessToken).toBe('new-gitlab-access')
    expect(gitlabRow(team2Id).accessToken).toBe(`old-gitlab-access-${team2Id}`)
    const jiraRows = rows.filter((row) => row.service === 'jira')
    expect(jiraRows.every((row) => row.accessToken !== 'new-gitlab-access')).toBe(true)
  })
})
