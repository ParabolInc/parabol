import getKysely from '../../getKysely'
import deactivateGlobalIntegrationProvider from '../deactivateGlobalIntegrationProvider'

const pg = getKysely()
const suffix = `dgip-${Date.now()}`
const orgId = `org-${suffix}`
const teamId = `team-${suffix}`
let providerIds: number[] = []

const isActiveById = async (id: number) => {
  const row = await pg
    .selectFrom('IntegrationProvider')
    .select('isActive')
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
  return row.isActive
}

beforeAll(async () => {
  await pg.insertInto('Organization').values({id: orgId, name: 'Deactivate Provider Org'}).execute()
  await pg
    .insertInto('Team')
    .values({id: teamId, name: 'Deactivate Provider Team', orgId})
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('IntegrationProvider').where('id', 'in', providerIds).execute()
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.destroy()
})

describe('deactivateGlobalIntegrationProvider', () => {
  it('deactivates only the global row for the given service and auth strategy', async () => {
    const rows = await pg
      .insertInto('IntegrationProvider')
      .values([
        {service: 'jira', authStrategy: 'pat', scope: 'global', serverBaseUrl: 'https://a.example'},
        {
          service: 'jira',
          authStrategy: 'pat',
          scope: 'team',
          teamId,
          serverBaseUrl: 'https://b.example'
        },
        {
          service: 'github',
          authStrategy: 'pat',
          scope: 'global',
          serverBaseUrl: 'https://c.example'
        }
      ])
      .returning(['id', 'scope', 'service'])
      .execute()
    providerIds = rows.map(({id}) => id)
    const globalJira = rows.find((r) => r.service === 'jira' && r.scope === 'global')!
    const teamJira = rows.find((r) => r.service === 'jira' && r.scope === 'team')!
    const globalGitHub = rows.find((r) => r.service === 'github')!

    await deactivateGlobalIntegrationProvider({service: 'jira', authStrategy: 'pat'})

    expect(await isActiveById(globalJira.id)).toBe(false)
    expect(await isActiveById(teamJira.id)).toBe(true)
    expect(await isActiveById(globalGitHub.id)).toBe(true)
  })
})
