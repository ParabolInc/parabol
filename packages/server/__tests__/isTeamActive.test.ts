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

  beforeEach(async () => {
    // Clean up any existing test data
    await pg.deleteFrom('NewMeeting').where('teamId', '=', mockTeamId).execute()
    await pg.deleteFrom('TeamMember').where('teamId', '=', mockTeamId).execute()
    await pg.deleteFrom('Team').where('id', '=', mockTeamId).execute()
    await pg.deleteFrom('User').where('id', 'in', [mockUserId1, mockUserId2]).execute()
    await pg.deleteFrom('Organization').where('id', '=', mockOrgId).execute()

    // Set up base test data
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
  })

  afterAll(async () => {
    // Clean up all test data
    await pg.deleteFrom('NewMeeting').where('teamId', '=', mockTeamId).execute()
    await pg.deleteFrom('TeamMember').where('teamId', '=', mockTeamId).execute()
    await pg.deleteFrom('Team').where('id', '=', mockTeamId).execute()
    await pg.deleteFrom('User').where('id', 'in', [mockUserId1, mockUserId2]).execute()
    await pg.deleteFrom('Organization').where('id', '=', mockOrgId).execute()
  })

  it('should return false for archived team', async () => {
    await pg.updateTable('Team').set({isArchived: true}).where('id', '=', mockTeamId).execute()

    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })

  it('should return false when team has less than 2 active members', async () => {
    // Add only one active member
    await pg
      .insertInto('TeamMember')
      .values({
        id: `${mockTeamId}::${mockUserId1}`,
        teamId: mockTeamId,
        userId: mockUserId1,
        isNotRemoved: true,
        email: 'test1@test.com',
        picture: '',
        preferredName: 'Test User 1',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .execute()

    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })

  it('should return false when team has no recent meetings', async () => {
    // Add two active members
    await pg
      .insertInto('TeamMember')
      .values([
        {
          id: `${mockTeamId}::${mockUserId1}`,
          teamId: mockTeamId,
          userId: mockUserId1,
          isNotRemoved: true,
          email: 'test1@test.com',
          picture: '',
          preferredName: 'Test User 1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `${mockTeamId}::${mockUserId2}`,
          teamId: mockTeamId,
          userId: mockUserId2,
          isNotRemoved: true,
          email: 'test2@test.com',
          picture: '',
          preferredName: 'Test User 2',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      .execute()

    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })

  it('should return false when team has old meetings only', async () => {
    // Add two active members
    await pg
      .insertInto('TeamMember')
      .values([
        {
          id: `${mockTeamId}::${mockUserId1}`,
          teamId: mockTeamId,
          userId: mockUserId1,
          isNotRemoved: true,
          email: 'test1@test.com',
          picture: '',
          preferredName: 'Test User 1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `${mockTeamId}::${mockUserId2}`,
          teamId: mockTeamId,
          userId: mockUserId2,
          isNotRemoved: true,
          email: 'test2@test.com',
          picture: '',
          preferredName: 'Test User 2',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      .execute()

    // Add an old meeting
    const oldDate = new Date(Date.now() - (Threshold.STICKY_TEAM_LAST_MEETING_TIMEFRAME + 86400000)) // 1 day older than threshold
    await pg
      .insertInto('NewMeeting')
      .values({
        id: 'meeting1',
        teamId: mockTeamId,
        createdAt: oldDate,
        facilitatorStageId: 'stage1',
        meetingType: 'retrospective',
        name: 'Test Meeting',
        meetingCount: 1,
        meetingNumber: 1,
        facilitatorUserId: mockUserId1,
        endedAt: oldDate,
        phases: JSON.stringify([
          {
            id: 'phase1',
            phaseType: 'lobby',
            stages: [
              {
                id: 'stage1',
                startAt: oldDate.toISOString(),
                endAt: oldDate.toISOString(),
                isComplete: true
              }
            ]
          }
        ])
      })
      .execute()

    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })

  it('should return true for active team with recent meeting', async () => {
    // Add two active members
    await pg
      .insertInto('TeamMember')
      .values([
        {
          id: `${mockTeamId}::${mockUserId1}`,
          teamId: mockTeamId,
          userId: mockUserId1,
          isNotRemoved: true,
          email: 'test1@test.com',
          picture: '',
          preferredName: 'Test User 1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `${mockTeamId}::${mockUserId2}`,
          teamId: mockTeamId,
          userId: mockUserId2,
          isNotRemoved: true,
          email: 'test2@test.com',
          picture: '',
          preferredName: 'Test User 2',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      .execute()

    // Add a recent meeting
    const recentDate = new Date(Date.now() - Threshold.STICKY_TEAM_LAST_MEETING_TIMEFRAME / 2) // Half of threshold
    await pg
      .insertInto('NewMeeting')
      .values({
        id: 'meeting1',
        teamId: mockTeamId,
        createdAt: recentDate,
        facilitatorStageId: 'stage1',
        meetingType: 'retrospective',
        name: 'Test Meeting',
        meetingCount: 1,
        meetingNumber: 1,
        facilitatorUserId: mockUserId1,
        phases: JSON.stringify([
          {
            id: 'phase1',
            phaseType: 'lobby',
            stages: [
              {
                id: 'stage1',
                startAt: recentDate.toISOString(),
                endAt: recentDate.toISOString(),
                isComplete: true
              }
            ]
          }
        ])
      })
      .execute()

    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(true)
  })

  it('should return false when team has inactive members', async () => {
    // Add two members but one is inactive
    await pg
      .insertInto('TeamMember')
      .values([
        {
          id: `${mockTeamId}::${mockUserId1}`,
          teamId: mockTeamId,
          userId: mockUserId1,
          isNotRemoved: true,
          email: 'test1@test.com',
          picture: '',
          preferredName: 'Test User 1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `${mockTeamId}::${mockUserId2}`,
          teamId: mockTeamId,
          userId: mockUserId2,
          isNotRemoved: true,
          email: 'test2@test.com',
          picture: '',
          preferredName: 'Test User 2',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      .execute()

    // Make one user inactive
    await pg.updateTable('User').set({inactive: true}).where('id', '=', mockUserId2).execute()

    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })

  it('should return false when team has removed members', async () => {
    // Add two members but one is removed
    await pg
      .insertInto('TeamMember')
      .values([
        {
          id: `${mockTeamId}::${mockUserId1}`,
          teamId: mockTeamId,
          userId: mockUserId1,
          isNotRemoved: true,
          email: 'test1@test.com',
          picture: '',
          preferredName: 'Test User 1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `${mockTeamId}::${mockUserId2}`,
          teamId: mockTeamId,
          userId: mockUserId2,
          isNotRemoved: false, // removed member
          email: 'test2@test.com',
          picture: '',
          preferredName: 'Test User 2',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      .execute()

    const result = await isTeamActive(mockTeamId)
    expect(result).toBe(false)
  })
})
