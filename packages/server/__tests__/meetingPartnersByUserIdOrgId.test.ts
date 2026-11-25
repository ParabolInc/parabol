import ms from 'ms'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import getKysely from '../postgres/getKysely'
import type {MeetingTypeEnum} from '../postgres/types/Meeting'
import {createPGTables, truncatePGTables} from './common'

const TEST_DB = 'meetingPartnersByUserIdOrgIdTest'
const TABLES = [
  'Organization',
  'Team',
  'User',
  'TeamMember',
  'OrganizationUser',
  'NewMeeting',
  'MeetingMember'
]

const now = Date.now()
const daysAgo = (days: number) => new Date(now - days * ms('1d'))

describe('meetingPartnersByUserIdOrgId', () => {
  const pg = getKysely(TEST_DB)

  beforeAll(async () => {
    await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
    await createPGTables(...TABLES)
  })

  beforeEach(async () => {
    await truncatePGTables(...TABLES)
    await setupBaseTestData()
  })

  afterAll(async () => {
    await pg.schema.dropSchema(TEST_DB).cascade().execute()
    await pg.destroy()
  })

  const load = async (userId: string, orgId: string) => {
    const dataLoader = getNewDataLoader('meetingPartnersByUserIdOrgIdTest')
    try {
      return await dataLoader.get('meetingPartnersByUserIdOrgId').load({userId, orgId})
    } finally {
      dataLoader.dispose()
    }
  }

  const setupBaseTestData = async () => {
    await pg
      .insertInto('Organization')
      .values(
        ['org1', 'org2'].map((id) => ({
          id,
          name: id,
          tier: 'team' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      )
      .execute()
    await pg
      .insertInto('Team')
      .values([
        {id: 'team1', name: 'Team 1', isArchived: false, orgId: 'org1'},
        {id: 'team2', name: 'Team 2', isArchived: false, orgId: 'org2'}
      ])
      .execute()
    const userIds = ['viewer', 'ana', 'ben']
    await pg
      .insertInto('User')
      .values(
        userIds.map((id) => ({
          id,
          inactive: false,
          email: `${id}@test.com`,
          picture: '',
          preferredName: id,
          lastSeenAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      )
      .execute()
    await pg
      .insertInto('OrganizationUser')
      .values(
        userIds.map((userId) => ({
          id: `org1::${userId}`,
          orgId: 'org1',
          userId,
          role: null,
          removedAt: null,
          suggestedTier: null
        }))
      )
      .execute()
    await pg
      .insertInto('TeamMember')
      .values(
        userIds.map((userId) => ({
          id: `team1::${userId}`,
          teamId: 'team1',
          userId,
          isNotRemoved: true
        }))
      )
      .execute()
  }

  const addMeeting = async ({
    id,
    teamId = 'team1',
    createdAt,
    meetingType = 'retrospective',
    attendeeIds
  }: {
    id: string
    teamId?: string
    createdAt: Date
    meetingType?: MeetingTypeEnum
    attendeeIds: string[]
  }) => {
    await pg
      .insertInto('NewMeeting')
      .values({
        id,
        teamId,
        createdAt,
        facilitatorStageId: 'stage1',
        meetingType,
        name: 'Test Meeting',
        meetingCount: 1,
        meetingNumber: 1,
        facilitatorUserId: attendeeIds[0]!,
        phases: JSON.stringify([
          {
            id: 'phase1',
            phaseType: 'lobby',
            stages: [
              {
                id: 'stage1',
                startAt: createdAt.toISOString(),
                endAt: createdAt.toISOString(),
                isComplete: true
              }
            ]
          }
        ])
      })
      .execute()
    await pg
      .insertInto('MeetingMember')
      .values(
        attendeeIds.map((userId) => ({
          id: `${id}::${userId}`,
          meetingId: id,
          meetingType,
          teamId,
          userId
        }))
      )
      .execute()
  }

  it('returns a partner from a meeting 10 days ago', async () => {
    await addMeeting({id: 'm1', createdAt: daysAgo(10), attendeeIds: ['viewer', 'ana']})
    expect(await load('viewer', 'org1')).toEqual([
      {userId: 'ana', lastMetAt: daysAgo(10), meetingType: 'retrospective'}
    ])
  })

  it('ignores meetings older than 30 days', async () => {
    await addMeeting({id: 'm1', createdAt: daysAgo(31), attendeeIds: ['viewer', 'ana']})
    expect(await load('viewer', 'org1')).toEqual([])
  })

  it('keeps the newest shared meeting per partner', async () => {
    await addMeeting({id: 'm1', createdAt: daysAgo(12), attendeeIds: ['viewer', 'ana']})
    await addMeeting({
      id: 'm2',
      createdAt: daysAgo(3),
      meetingType: 'poker',
      attendeeIds: ['viewer', 'ana']
    })
    expect(await load('viewer', 'org1')).toEqual([
      {userId: 'ana', lastMetAt: daysAgo(3), meetingType: 'poker'}
    ])
  })

  it('orders partners newest first', async () => {
    await addMeeting({id: 'm1', createdAt: daysAgo(12), attendeeIds: ['viewer', 'ana']})
    await addMeeting({id: 'm2', createdAt: daysAgo(3), attendeeIds: ['viewer', 'ben']})
    const result = await load('viewer', 'org1')
    expect(result.map(({userId}) => userId)).toEqual(['ben', 'ana'])
  })

  it('skips partners removed from the org', async () => {
    await addMeeting({id: 'm1', createdAt: daysAgo(10), attendeeIds: ['viewer', 'ana']})
    await pg
      .updateTable('OrganizationUser')
      .set({removedAt: new Date()})
      .where('userId', '=', 'ana')
      .execute()
    expect(await load('viewer', 'org1')).toEqual([])
  })

  it('skips partners removed from the meeting team', async () => {
    await addMeeting({id: 'm1', createdAt: daysAgo(10), attendeeIds: ['viewer', 'ana']})
    await pg
      .updateTable('TeamMember')
      .set({isNotRemoved: false})
      .where('userId', '=', 'ana')
      .execute()
    expect(await load('viewer', 'org1')).toEqual([])
  })

  it('skips meetings on another org', async () => {
    await addMeeting({
      id: 'm1',
      teamId: 'team2',
      createdAt: daysAgo(10),
      attendeeIds: ['viewer', 'ana']
    })
    expect(await load('viewer', 'org1')).toEqual([])
  })

  it('skips meetings the viewer was not in', async () => {
    await addMeeting({id: 'm1', createdAt: daysAgo(10), attendeeIds: ['ana', 'ben']})
    expect(await load('viewer', 'org1')).toEqual([])
  })
})
