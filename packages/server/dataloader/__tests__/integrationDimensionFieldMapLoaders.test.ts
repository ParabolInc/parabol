import getKysely from '../../postgres/getKysely'
import {integrationDimensionFieldMaps} from '../integrationDimensionFieldMapLoaders'
import type RootDataLoader from '../RootDataLoader'

const pg = getKysely()
const suffix = `idfml-${Date.now()}`
const userId = `user-${suffix}`
const orgId = `org-${suffix}`
const teamId = `team-${suffix}`
const repoId = 'cloud-1:PROJ'
const now = Date.now()

const makeRow = (
  workItemType: string,
  updatedAt: Date,
  overrides: {service?: 'jira' | 'github'; dimensionName?: string} = {}
) => ({
  teamId,
  service: overrides.service ?? ('jira' as const),
  repoId,
  workItemType,
  dimensionName: overrides.dimensionName ?? 'Effort',
  fieldId: 'customfield_10016',
  fieldName: 'Story Points',
  fieldType: 'number',
  updatedAt
})

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/p.png',
      preferredName: 'Field Map Loader Tester'
    })
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Field Map Loader Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'Field Map Loader Team', orgId}).execute()
  await pg
    .insertInto('IntegrationDimensionFieldMap')
    .values([
      makeRow('Story', new Date(now - 2 * 60 * 60 * 1000)),
      makeRow('', new Date(now - 60 * 60 * 1000)),
      makeRow('Bug', new Date(now)),
      makeRow('', new Date(now), {dimensionName: 'Risk'}),
      makeRow('', new Date(now), {service: 'github'})
    ])
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  await pg.destroy()
})

const loader = integrationDimensionFieldMaps({dataLoaderOptions: {}} as unknown as RootDataLoader)

describe('integrationDimensionFieldMaps', () => {
  it('returns every work item type for the repo/dimension, newest first', async () => {
    const rows = await loader.load({teamId, service: 'jira', repoId, dimensionName: 'Effort'})
    expect(rows.map((row) => row.workItemType)).toEqual(['Bug', '', 'Story'])
  })

  it('does not mix dimensions or services', async () => {
    const risk = await loader.load({teamId, service: 'jira', repoId, dimensionName: 'Risk'})
    expect(risk).toHaveLength(1)
    const github = await loader.load({teamId, service: 'github', repoId, dimensionName: 'Effort'})
    expect(github).toHaveLength(1)
  })

  it('returns [] for an unmapped repo', async () => {
    await expect(
      loader.load({teamId, service: 'jira', repoId: 'nope', dimensionName: 'Effort'})
    ).resolves.toEqual([])
  })
})
