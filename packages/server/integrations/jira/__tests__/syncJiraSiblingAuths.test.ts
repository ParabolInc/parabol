import getKysely from '../../../postgres/getKysely'
import syncJiraSiblingAuths from '../syncJiraSiblingAuths'

const pg = getKysely()
const suffix = `sjsa-${Date.now()}`
const userId = `user-${suffix}`
const orgId = `org-${suffix}`
const team1Id = `team1-${suffix}`
const team2Id = `team2-${suffix}`
const team3Id = `team3-${suffix}`

let providerId: number

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Sibling Sync Tester'
    })
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Sibling Sync Org'}).execute()
  await pg
    .insertInto('Team')
    .values([
      {id: team1Id, name: 'Sibling Sync Team 1', orgId},
      {id: team2Id, name: 'Sibling Sync Team 2', orgId},
      {id: team3Id, name: 'Sibling Sync Team 3', orgId}
    ])
    .execute()
  const provider = await pg
    .insertInto('IntegrationProvider')
    .values({
      service: 'jira',
      authStrategy: 'oauth2',
      scope: 'team',
      teamId: team1Id,
      serverBaseUrl: 'https://example.com',
      clientId: 'cid',
      clientSecret: 'secret'
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  providerId = provider.id

  await pg
    .insertInto('TeamMemberIntegrationAuth')
    .values([
      {
        teamId: team1Id,
        userId,
        providerId,
        service: 'jira',
        accessToken: 'old-access-team1',
        refreshToken: 'old-refresh-team1',
        scopes: 'read:jira-work',
        providerUserId: 'acct-A',
        isActive: true
      },
      {
        teamId: team2Id,
        userId,
        providerId,
        service: 'jira',
        accessToken: 'old-access-team2',
        refreshToken: 'old-refresh-team2',
        scopes: 'read:jira-work',
        providerUserId: 'acct-A',
        isActive: true
      },
      {
        teamId: team3Id,
        userId,
        providerId,
        service: 'jira',
        accessToken: 'old-access-acct-b',
        refreshToken: 'old-refresh-acct-b',
        scopes: 'repo',
        providerUserId: 'acct-B',
        isActive: true
      }
    ])
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('TeamMemberIntegrationAuth').where('userId', '=', userId).execute()
  await pg.deleteFrom('IntegrationProvider').where('id', '=', providerId).execute()
  await pg.deleteFrom('Team').where('orgId', '=', orgId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  await pg.destroy()
})

describe('syncJiraSiblingAuths', () => {
  it('updates every other active jira row for the same account, excluding the connecting team', async () => {
    await syncJiraSiblingAuths(pg, {
      userId,
      providerUserId: 'acct-A',
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      scopes: 'read:jira-work offline_access',
      expiresAt: null,
      excludeTeamId: team1Id
    })

    const rows = await pg
      .selectFrom('TeamMemberIntegrationAuth')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('teamId')
      .execute()
    const team1JiraRow = rows.find((r) => r.teamId === team1Id && r.service === 'jira')!
    const team2JiraRow = rows.find((r) => r.teamId === team2Id && r.service === 'jira')!
    const acctBRow = rows.find((r) => r.providerUserId === 'acct-B')!

    expect(team1JiraRow.accessToken).toBe('old-access-team1')
    expect(team1JiraRow.refreshToken).toBe('old-refresh-team1')

    expect(team2JiraRow.accessToken).toBe('new-access')
    expect(team2JiraRow.refreshToken).toBe('new-refresh')
    expect(team2JiraRow.scopes).toBe('read:jira-work offline_access')

    expect(acctBRow.accessToken).toBe('old-access-acct-b')
    expect(acctBRow.refreshToken).toBe('old-refresh-acct-b')
  })
})
