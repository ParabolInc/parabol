import ms from 'ms'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import removeAllUsersFromOrg from '../graphql/mutations/helpers/removeAllUsersFromOrg'
import getKysely from '../postgres/getKysely'
import type {OrganizationUserAudit} from '../postgres/types/pg'
import {createPGTables, truncatePGTables} from './common'

const TEST_DB = 'activeUserCountsByOrgIdTest'
const TABLES = ['OrganizationUser', 'OrganizationUserAudit']

// Mock data
const mockOrgId = 'org1'
const otherOrgId = 'org2'

type AuditEvent = {
  userId: string
  eventDate: string
  eventType: OrganizationUserAudit['eventType']
  orgId?: string
}

// At the start of each month, org1 has 0 active members on May 1 2025, 3 on Sep 1, 2 on Oct 1, 2 on Nov 1, 3 on Dec 1
const sampleHistory: AuditEvent[] = [
  {userId: 'user1', eventDate: '2025-06-01', eventType: 'added'},
  {userId: 'user2', eventDate: '2025-06-01', eventType: 'added'},
  {userId: 'user2', eventDate: '2025-09-15', eventType: 'inactivated'},
  {userId: 'user3', eventDate: '2025-06-01', eventType: 'added'},
  {userId: 'user3', eventDate: '2025-08-01', eventType: 'inactivated'},
  {userId: 'user3', eventDate: '2025-10-20', eventType: 'activated'},
  {userId: 'user4', eventDate: '2025-06-01', eventType: 'added'},
  {userId: 'user4', eventDate: '2025-10-10', eventType: 'removed'},
  {userId: 'user5', eventDate: '2025-11-05', eventType: 'added'},
  {userId: 'user6', eventDate: '2025-10-31T23:00:00.000Z', eventType: 'added'},
  {userId: 'user6', eventDate: '2025-10-31T23:00:00.000Z', eventType: 'inactivated'},
  {userId: 'user7', eventDate: '2025-06-01', eventType: 'added', orgId: otherOrgId}
]

describe('activeUserCountsByOrgId', () => {
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

  const addAuditEvents = async (events: AuditEvent[]) => {
    await pg
      .insertInto('OrganizationUserAudit')
      .values(
        events.map(({orgId = mockOrgId, userId, eventDate, eventType}) => ({
          orgId,
          userId,
          eventDate: new Date(eventDate),
          eventType
        }))
      )
      .execute()
  }

  const countActiveUsers = async (orgId: string, times: Date[]) => {
    const dataLoader = getNewDataLoader('activeUserCountsByOrgIdTest')
    try {
      return await dataLoader.get('activeUserCountsByOrgId').load({orgId, times})
    } finally {
      dataLoader.dispose()
    }
  }

  it('should count the members who were active at each time', async () => {
    await addAuditEvents(sampleHistory)
    const times = ['2025-05-01', '2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01']
    const result = await countActiveUsers(
      mockOrgId,
      times.map((time) => new Date(time))
    )
    expect(result).toEqual([0, 3, 2, 2, 3])
  })

  it('should answer in the order the times were given', async () => {
    await addAuditEvents(sampleHistory)
    const times = ['2025-12-01', '2025-05-01', '2025-12-01']
    const result = await countActiveUsers(
      mockOrgId,
      times.map((time) => new Date(time))
    )
    expect(result).toEqual([3, 0, 3])
  })

  it('should stop counting members once their org is archived', async () => {
    await addAuditEvents([{userId: 'user1', eventDate: '2025-06-01', eventType: 'added'}])
    await pg
      .insertInto('OrganizationUser')
      .values([
        {id: 'orgUser1', orgId: mockOrgId, userId: 'user1'},
        {id: 'orgUser2', orgId: mockOrgId, userId: 'user2', removedAt: new Date('2025-07-01')}
      ])
      .execute()
    await removeAllUsersFromOrg(mockOrgId)
    const result = await countActiveUsers(mockOrgId, [
      new Date('2025-12-01'),
      new Date(Date.now() + ms('1m'))
    ])
    expect(result).toEqual([1, 0])
    const removals = await pg
      .selectFrom('OrganizationUserAudit')
      .select('userId')
      .where('eventType', '=', 'removed')
      .execute()
    expect(removals).toEqual([{userId: 'user1'}])
  })
})
