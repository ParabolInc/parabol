import ms from 'ms'
import getKysely from '../postgres/getKysely'
import recordUserActivity from '../utils/recordUserActivity'
import {createPGTables, truncatePGTables} from './common'

const TEST_DB = 'recordUserActivityTest'
const TABLES = ['Organization', 'OrganizationUser', 'OrganizationUserAudit', 'User']

// Mock data
const mockUserId = 'user1'
const mockOrgIds = ['org1', 'org2']

const activationInEachOrg = mockOrgIds.map((orgId) => ({orgId, eventType: 'activated'}))

describe('recordUserActivity', () => {
  const pg = getKysely(TEST_DB)

  beforeAll(async () => {
    await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
    await createPGTables(...TABLES)
  })

  beforeEach(async () => {
    await truncatePGTables(...TABLES)
  })

  afterAll(async () => {
    await pg.schema.dropSchema(TEST_DB).cascade().execute()
    await pg.destroy()
  })

  const addUserToOrgs = async (status: {inactive: boolean; lastSeenAt: Date}) => {
    await pg
      .insertInto('Organization')
      .values(
        mockOrgIds.map((id) => ({
          id,
          name: 'Test Org',
          tier: 'team' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      )
      .execute()

    await pg
      .insertInto('User')
      .values({
        id: mockUserId,
        email: 'test1@test.com',
        picture: '',
        preferredName: 'Test User 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...status
      })
      .execute()

    await pg
      .insertInto('OrganizationUser')
      .values(
        mockOrgIds.map((orgId) => ({
          id: `${orgId}::${mockUserId}`,
          orgId,
          userId: mockUserId
        }))
      )
      .execute()
    return {id: mockUserId, ...status}
  }

  const getUserStatus = () =>
    pg
      .selectFrom('User')
      .select(['inactive', 'lastSeenAt'])
      .where('id', '=', mockUserId)
      .executeTakeFirstOrThrow()

  const getAuditEvents = () =>
    pg
      .selectFrom('OrganizationUserAudit')
      .select(['orgId', 'eventType'])
      .where('userId', '=', mockUserId)
      .orderBy('orgId')
      .execute()

  it('should unpause a paused user and record the activation in each of their orgs', async () => {
    const user = await addUserToOrgs({inactive: true, lastSeenAt: new Date(Date.now() - ms('40d'))})
    await recordUserActivity(user)
    const {inactive, lastSeenAt} = await getUserStatus()
    expect(inactive).toBe(false)
    expect(Date.now() - lastSeenAt.getTime()).toBeLessThan(ms('1m'))
    expect(user).toMatchObject({inactive: false, lastSeenAt})
    expect(await getAuditEvents()).toEqual(activationInEachOrg)
  })

  it('should record one activation when several requests unpause the same user at once', async () => {
    const user = await addUserToOrgs({inactive: true, lastSeenAt: new Date(Date.now() - ms('40d'))})
    await Promise.all([
      recordUserActivity(user),
      recordUserActivity(user),
      recordUserActivity(user)
    ])
    expect(await getAuditEvents()).toEqual(activationInEachOrg)
  })

  it('should refresh lastSeenAt for an active user last seen over a minute ago', async () => {
    const user = await addUserToOrgs({inactive: false, lastSeenAt: new Date(Date.now() - ms('2m'))})
    await recordUserActivity(user)
    const {lastSeenAt} = await getUserStatus()
    expect(Date.now() - lastSeenAt.getTime()).toBeLessThan(ms('10s'))
    expect(user.lastSeenAt).toEqual(lastSeenAt)
    expect(await getAuditEvents()).toEqual([])
  })

  it('should not write for an active user seen within the last minute', async () => {
    const seenAt = new Date(Date.now() - ms('30s'))
    const user = await addUserToOrgs({inactive: false, lastSeenAt: seenAt})
    await recordUserActivity(user)
    const {lastSeenAt} = await getUserStatus()
    expect(lastSeenAt).toEqual(seenAt)
  })
})
