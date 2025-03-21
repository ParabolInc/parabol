import {ThresholdTest as Threshold} from '~/types/constEnums'
import isTeamActive from '../graphql/public/types/helpers/isTeamActive'
import getKysely from '../postgres/getKysely'
import {createPGTables, truncatePGTables} from './common'

const TEST_DB = 'isTeamActiveTest'

// Mock data
const mockOrgId = 'org123'
const mockTeamId = 'team123'
const mockUserId1 = 'user1'
const mockUserId2 = 'user2'

describe('isTeamActive', () => {
  const pg = getKysely(TEST_DB)

  beforeAll(async () => {
    await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
    await createPGTables('Organization', 'Team', 'User', 'TeamMember', 'NewMeeting')
  })

  beforeEach(async () => {
    await truncatePGTables('Organization', 'Team', 'User', 'TeamMember', 'NewMeeting')
    await setupBaseTestData()
  })

  afterAll(async () => {
    await pg.schema.dropSchema(TEST_DB).cascade().execute()
    await pg.destroy()
    console.log('isTeamActive destroy')
  })

  const setupBaseTestData = async () => {
    await pg
      .insertInto('Organization')
      .values({
        id: mockOrgId,
        name: 'Test Org',
        tier: 'team',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .execute()

    await pg
      .insertInto('Team')
      .values({
        id: mockTeamId,
        name: 'Test Team',
        isArchived: false,
        orgId: mockOrgId,
        tier: 'team',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .execute()

    await pg
      .insertInto('User')
      .values([
        {
          id: mockUserId1,
          inactive: false,
          email: 'test1@test.com',
          picture: '',
          preferredName: 'Test User 1',
          lastSeenAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          tms: [mockTeamId]
        },
        {
          id: mockUserId2,
          inactive: false,
          email: 'test2@test.com',
          picture: '',
          preferredName: 'Test User 2',
          lastSeenAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          tms: [mockTeamId]
        }
      ])
      .execute()
  }

  const addTeamMembers = async (members: Array<{userId: string; isNotRemoved: boolean}>) => {
    await pg
      .insertInto('TeamMember')
      .values(
        members.map((member) => ({
          id: `${mockTeamId}::${member.userId}`,
          teamId: mockTeamId,
          userId: member.userId,
          isNotRemoved: member.isNotRemoved,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      )
      .execute()
  }

  const addMeeting = async (date: Date, endedAt?: Date) => {
    await pg
      .insertInto('NewMeeting')
      .values({
        id: 'meeting1',
        teamId: mockTeamId,
        createdAt: date,
        facilitatorStageId: 'stage1',
        meetingType: 'retrospective',
        name: 'Test Meeting',
        meetingCount: 1,
        meetingNumber: 1,
        facilitatorUserId: mockUserId1,
        ...(endedAt && {endedAt}),
        phases: JSON.stringify([
          {
            id: 'phase1',
            phaseType: 'lobby',
            stages: [
              {
                id: 'stage1',
                startAt: date.toISOString(),
                endAt: date.toISOString(),
                isComplete: true
              }
            ]
          }
        ])
      })
      .execute()
  }

  it('should return false for archived team', async () => {
    await addTeamMembers([
      {userId: mockUserId1, isNotRemoved: true},
      {userId: mockUserId2, isNotRemoved: true}
    ])
    const recentDate = new Date(Date.now() - Threshold.STICKY_TEAM_LAST_MEETING_TIMEFRAME / 2)
    await addMeeting(recentDate)
    await pg.updateTable('Team').set({isArchived: true}).where('id', '=', mockTeamId).execute()
    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })

  it('should return false when team has less than 2 active members', async () => {
    await addTeamMembers([{userId: mockUserId1, isNotRemoved: true}])
    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })

  it('should return false when team has no recent meetings', async () => {
    await addTeamMembers([
      {userId: mockUserId1, isNotRemoved: true},
      {userId: mockUserId2, isNotRemoved: true}
    ])
    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })

  it('should return false when team has old meetings only', async () => {
    await addTeamMembers([
      {userId: mockUserId1, isNotRemoved: true},
      {userId: mockUserId2, isNotRemoved: true}
    ])
    const oldDate = new Date(Date.now() - (Threshold.STICKY_TEAM_LAST_MEETING_TIMEFRAME + 86400000))
    await addMeeting(oldDate, oldDate)
    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })

  it('should return true for active team with recent meeting', async () => {
    await addTeamMembers([
      {userId: mockUserId1, isNotRemoved: true},
      {userId: mockUserId2, isNotRemoved: true}
    ])
    const recentDate = new Date(Date.now() - Threshold.STICKY_TEAM_LAST_MEETING_TIMEFRAME / 2)
    await addMeeting(recentDate)
    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(true)
  })

  it('should return false when team has inactive members', async () => {
    await addTeamMembers([
      {userId: mockUserId1, isNotRemoved: true},
      {userId: mockUserId2, isNotRemoved: true}
    ])
    await pg.updateTable('User').set({inactive: true}).where('id', '=', mockUserId2).execute()
    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })

  it('should return false when team has removed members', async () => {
    await addTeamMembers([
      {userId: mockUserId1, isNotRemoved: true},
      {userId: mockUserId2, isNotRemoved: false}
    ])
    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })
})
