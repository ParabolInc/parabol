import getKysely from '../../getKysely'
import {up} from '../2026-08-20T00:00:00.000Z_unifyJiraGitHubAuth'

const pg = getKysely()
const suffix = `pa2-${Date.now()}`
const userId = `user-${suffix}`
const orgId = `org-${suffix}`
const teamId = `team-${suffix}`
const recent = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
const stale = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()

const ensureProvider = async (service: 'jira' | 'github') => {
  const {id} = await pg
    .insertInto('IntegrationProvider')
    .values({
      service,
      authStrategy: 'oauth2',
      scope: 'global',
      serverBaseUrl: 'https://example.com',
      clientId: 'cid',
      clientSecret: 'secret'
    })
    .onConflict((oc) =>
      oc.columns(['orgId', 'teamId', 'service', 'authStrategy']).doUpdateSet({isActive: true})
    )
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'PA2 Tester'
    })
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'PA2 Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'PA2 Team', orgId}).execute()
  await ensureProvider('jira')
  await ensureProvider('github')
  await pg
    .insertInto('AtlassianAuth')
    .values({
      userId,
      teamId,
      accountId: 'acct-1',
      accessToken: 'jira-token',
      refreshToken: 'jira-refresh',
      cloudIds: ['cloud-a', 'cloud-b'],
      scope: 'read:jira-work offline_access',
      jiraSearchQueries: [
        JSON.stringify({
          id: 'q1',
          queryString: 'project = ENG',
          isJQL: true,
          projectKeyFilters: ['cloud-a:ENG'],
          lastUsedAt: recent
        }),
        JSON.stringify({
          id: 'q2',
          queryString: 'old',
          isJQL: false,
          projectKeyFilters: [],
          lastUsedAt: stale
        })
      ]
    })
    .execute()
  await pg
    .insertInto('GitHubAuth')
    .values({
      userId,
      teamId,
      login: 'octocat',
      accessToken: 'gh-token',
      scope: 'repo,read:org',
      githubSearchQueries: [
        JSON.stringify({id: 'g1', queryString: 'is:issue is:open', lastUsedAt: recent})
      ]
    })
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('IntegrationSearchQuery').where('userId', '=', userId).execute()
  await pg.deleteFrom('TeamMemberIntegrationAuth').where('userId', '=', userId).execute()
  await pg.deleteFrom('AtlassianAuth').where('userId', '=', userId).execute()
  await pg.deleteFrom('GitHubAuth').where('userId', '=', userId).execute()
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  await pg.destroy()
})

describe('unifyJiraGitHubAuth migration', () => {
  it('backfills jira + github rows with providerUserId and meta, and is idempotent', async () => {
    await up(pg)
    await up(pg)
    const rows = await pg
      .selectFrom('TeamMemberIntegrationAuth')
      .selectAll()
      .where('userId', '=', userId)
      .where('teamId', '=', teamId)
      .orderBy('service')
      .execute()
    expect(rows.map((r) => r.service)).toEqual(['github', 'jira'])
    const [github, jira] = rows
    expect(jira!.accessToken).toBe('jira-token')
    expect(jira!.refreshToken).toBe('jira-refresh')
    expect(jira!.scopes).toBe('read:jira-work offline_access')
    expect(jira!.providerUserId).toBe('acct-1')
    expect(jira!.meta).toEqual({cloudIds: ['cloud-a', 'cloud-b']})
    expect(jira!.providerId).toBeGreaterThan(0)
    expect(github!.accessToken).toBe('gh-token')
    expect(github!.providerUserId).toBe('octocat')
    expect(github!.scopes).toBe('repo,read:org')
  })

  it('moves only unexpired search queries into IntegrationSearchQuery', async () => {
    const queries = await pg
      .selectFrom('IntegrationSearchQuery')
      .select(['service', 'query', 'providerId'])
      .where('userId', '=', userId)
      .where('teamId', '=', teamId)
      .orderBy('service')
      .execute()
    expect(queries).toHaveLength(2)
    expect(queries[0]!.service).toBe('github')
    expect(queries[0]!.query).toEqual({queryString: 'is:issue is:open'})
    expect(queries[1]!.service).toBe('jira')
    expect(queries[1]!.query).toEqual({
      queryString: 'project = ENG',
      isJQL: true,
      projectKeyFilters: ['cloud-a:ENG']
    })
    expect(queries[1]!.providerId).not.toBeNull()
  })
})
