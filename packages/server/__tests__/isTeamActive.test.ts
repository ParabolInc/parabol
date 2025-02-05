import {ThresholdTest as Threshold} from '~/types/constEnums'
import isTeamActive from '../graphql/public/types/helpers/isTeamActive'
import getKysely from '../postgres/getKysely'

// Mock data
const mockOrgId = 'org123'
const mockTeamId = 'team123'
const mockUserId1 = 'user1'
const mockUserId2 = 'user2'

describe('isTeamActive', () => {
  const pg = getKysely()

  const cleanupTestData = async () => {
    await pg.deleteFrom('NewMeeting').where('teamId', '=', mockTeamId).execute()
    await pg.deleteFrom('TeamMember').where('teamId', '=', mockTeamId).execute()
    await pg.deleteFrom('Team').where('id', '=', mockTeamId).execute()
    await pg.deleteFrom('User').where('id', 'in', [mockUserId1, mockUserId2]).execute()
    await pg.deleteFrom('Organization').where('id', '=', mockOrgId).execute()
  }

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
          email: `test${member.userId}@test.com`,
          picture: '',
          preferredName: `Test User ${member.userId}`,
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

  beforeEach(async () => {
    await cleanupTestData()
    await setupBaseTestData()
  })

  afterAll(cleanupTestData)

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
