import getKysely from '../../getKysely'
import upsertIntegrationDimensionFieldMap from '../upsertIntegrationDimensionFieldMap'

const pg = getKysely()
const suffix = `idfm-${Date.now()}`
const userId = `user-${suffix}`
const orgId = `org-${suffix}`
const teamId = `team-${suffix}`

const baseRow = {
  teamId,
  service: 'jira' as const,
  repoId: 'cloud-1:PROJ',
  workItemType: 'Story',
  dimensionName: 'Effort',
  fieldId: 'customfield_10016',
  fieldName: 'Story Points',
  fieldType: 'number'
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/p.png',
      preferredName: 'Field Map Tester'
    })
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Field Map Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'Field Map Team', orgId}).execute()
})

afterAll(async () => {
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  await pg.destroy()
})

const load = () =>
  pg
    .selectFrom('IntegrationDimensionFieldMap')
    .selectAll()
    .where('teamId', '=', teamId)
    .orderBy('workItemType')
    .execute()

describe('upsertIntegrationDimensionFieldMap', () => {
  it('inserts a row keyed by team, service, repo, work item type and dimension', async () => {
    await upsertIntegrationDimensionFieldMap(baseRow)
    const rows = await load()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject(baseRow)
  })

  it('updates fieldId/fieldName/fieldType on conflict instead of duplicating', async () => {
    await upsertIntegrationDimensionFieldMap({
      ...baseRow,
      fieldId: '__comment',
      fieldName: '__comment',
      fieldType: 'string'
    })
    const rows = await load()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      fieldId: '__comment',
      fieldName: '__comment',
      fieldType: 'string'
    })
  })

  it('stores the empty-string NULL sentinel as a real fieldId', async () => {
    await upsertIntegrationDimensionFieldMap({
      ...baseRow,
      fieldId: '',
      fieldName: '',
      fieldType: 'string'
    })
    const rows = await load()
    expect(rows[0]!.fieldId).toBe('')
  })

  it('keeps one row per work item type', async () => {
    await upsertIntegrationDimensionFieldMap({...baseRow, workItemType: 'Bug'})
    const rows = await load()
    expect(rows.map((row) => row.workItemType)).toEqual(['Bug', 'Story'])
  })
})
