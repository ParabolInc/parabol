import getKysely from '../postgres/getKysely'
import loadAccountLogContext from '../utils/loadAccountLogContext'
import {createPGTables, truncatePGTables} from './common'

const TEST_DB = 'loadAccountLogContextTest'
const TABLES = ['Organization', 'OrganizationUser', 'FeatureFlagOwner', 'TeamMember']

describe('loadAccountLogContext', () => {
  const pg = getKysely(TEST_DB)

  beforeAll(async () => {
    await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
    await createPGTables(...TABLES)
    await truncatePGTables(...TABLES)
    const now = new Date()
    await pg
      .insertInto('Organization')
      .values([
        {
          id: 'orgEnterprise',
          name: 'Enterprise',
          tier: 'enterprise',
          createdAt: now,
          updatedAt: now
        },
        // a starter org on a trial has the team tier's features
        {
          id: 'orgTrial',
          name: 'Trial',
          tier: 'starter',
          trialStartDate: now,
          createdAt: now,
          updatedAt: now
        },
        {id: 'orgLeft', name: 'Left', tier: 'enterprise', createdAt: now, updatedAt: now}
      ])
      .execute()
    await pg
      .insertInto('OrganizationUser')
      .values([
        {id: 'ou1', orgId: 'orgEnterprise', userId: 'user1', role: null},
        {id: 'ou2', orgId: 'orgTrial', userId: 'user1', role: null},
        {id: 'ou3', orgId: 'orgLeft', userId: 'user1', role: null, removedAt: now},
        {id: 'ou4', orgId: 'orgTrial', userId: 'user2', role: null}
      ])
      .execute()
    await pg
      .insertInto('TeamMember')
      .values({id: 'team1::user1', teamId: 'team1', userId: 'user1', facilitatorOrder: 0})
      .execute()
    await pg
      .insertInto('FeatureFlagOwner')
      .values([
        {featureName: 'ConfluenceExport', orgId: 'orgEnterprise'},
        {featureName: 'ConfluenceExport', orgId: 'orgLeft'},
        {featureName: 'ConfluenceExport', userId: 'user1'},
        {featureName: 'Databases', teamId: 'team1'},
        {featureName: 'ConfluenceExport', userId: 'user2'},
        {featureName: 'noLongerAFlag', userId: 'user1'}
      ])
      .execute()
  })

  afterAll(async () => {
    await pg.schema.dropSchema(TEST_DB).cascade().execute()
    await pg.destroy()
  })

  test("a user's orgs, their tiers and the feature flags on for the user, a team or an org", async () => {
    const account = await loadAccountLogContext({userId: 'user1'})
    expect(account).toEqual({
      tier: 'enterprise',
      featureFlags: expect.arrayContaining(['ConfluenceExport', 'Databases']),
      orgs: [
        {id: 'orgEnterprise', tier: 'enterprise', featureFlags: ['ConfluenceExport']},
        {id: 'orgTrial', tier: 'team', featureFlags: []}
      ]
    })
    expect((account as {featureFlags: string[]}).featureFlags).toHaveLength(2)
  })

  test('a request with no user, like SCIM, gets its tenant org', async () => {
    expect(await loadAccountLogContext({orgId: 'orgEnterprise'})).toEqual({
      tier: 'enterprise',
      featureFlags: [],
      orgs: [{id: 'orgEnterprise', tier: 'enterprise', featureFlags: ['ConfluenceExport']}]
    })
  })

  test('a user seen again within a minute is not looked up again', async () => {
    const first = await loadAccountLogContext({userId: 'user2'})
    await pg.deleteFrom('FeatureFlagOwner').where('userId', '=', 'user2').execute()
    expect(await loadAccountLogContext({userId: 'user2'})).toEqual(first)
  })
})
