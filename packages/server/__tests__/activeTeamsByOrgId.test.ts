import ms from 'ms'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import getKysely from '../postgres/getKysely'
import {createPGTables, truncatePGTables} from './common'

const TEST_DB = 'activeTeamsByOrgIdTest'
const TABLES = ['Organization', 'Team', 'User', 'TeamMember', 'NewMeeting', 'MeetingMember']

// Mock data
const mockOrgId = 'org123'
const mockTeamId = 'team123'
const mockUserId1 = 'user1'
const mockUserId2 = 'user2'

const twoMembers = [
  {userId: mockUserId1, isNotRemoved: true},
  {userId: mockUserId2, isNotRemoved: true}
]
const bothUserIds = [mockUserId1, mockUserId2]

const daysAgo = (days: number) => new Date(Date.now() - days * ms('1d'))

describe('activeTeamsByOrgId', () => {
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

  const loadActiveTeams = async (orgId: string) => {
    const dataLoader = getNewDataLoader('activeTeamsByOrgIdTest')
    try {
      return await dataLoader.get('activeTeamsByOrgId').load(orgId)
    } finally {
      dataLoader.dispose()
    }
  }

  const addOrgWithTeam = async (orgId: string, teamId: string) => {
    await pg
      .insertInto('Organization')
      .values({
        id: orgId,
        name: 'Test Org',
        tier: 'team',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .execute()

    await pg
      .insertInto('Team')
      .values({
        id: teamId,
        name: 'Test Team',
        isArchived: false,
        orgId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .execute()
  }

  const setupBaseTestData = async () => {
    await addOrgWithTeam(mockOrgId, mockTeamId)

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
          updatedAt: new Date()
        },
        {
          id: mockUserId2,
          inactive: false,
          email: 'test2@test.com',
          picture: '',
          preferredName: 'Test User 2',
          lastSeenAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      .execute()
  }

  const addTeamMembers = async (
    members: Array<{userId: string; isNotRemoved: boolean}>,
    teamId = mockTeamId
  ) => {
    await pg
      .insertInto('TeamMember')
      .values(
        members.map((member) => ({
          id: `${teamId}::${member.userId}`,
          teamId,
          userId: member.userId,
          isNotRemoved: member.isNotRemoved,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      )
      .execute()
  }

  const addMeeting = async ({
    id = 'meeting1',
    teamId = mockTeamId,
    createdAt,
    endedAt,
    attendeeIds
  }: {
    id?: string
    teamId?: string
    createdAt: Date
    endedAt?: Date
    attendeeIds: string[]
  }) => {
    await pg
      .insertInto('NewMeeting')
      .values({
        id,
        teamId,
        createdAt,
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
          meetingType: 'retrospective' as const,
          teamId,
          userId
        }))
      )
      .execute()
  }

  it('should return a team whose 2 members joined a meeting started 29 days ago', async () => {
    await addTeamMembers(twoMembers)
    await addMeeting({createdAt: daysAgo(29), attendeeIds: bothUserIds})
    const result = await loadActiveTeams(mockOrgId)
    expect(result).toEqual([{id: mockTeamId, orgId: mockOrgId}])
  })

  it('should return a team whose meeting started 40 days ago and ended 29 days ago', async () => {
    await addTeamMembers(twoMembers)
    await addMeeting({createdAt: daysAgo(40), endedAt: daysAgo(29), attendeeIds: bothUserIds})
    const result = await loadActiveTeams(mockOrgId)
    expect(result).toEqual([{id: mockTeamId, orgId: mockOrgId}])
  })

  it('should skip an archived team', async () => {
    await addTeamMembers(twoMembers)
    await addMeeting({createdAt: daysAgo(29), attendeeIds: bothUserIds})
    await pg.updateTable('Team').set({isArchived: true}).where('id', '=', mockTeamId).execute()
    const result = await loadActiveTeams(mockOrgId)
    expect(result).toEqual([])
  })

  it('should skip a team with less than 2 current members', async () => {
    await addTeamMembers([
      {userId: mockUserId1, isNotRemoved: true},
      {userId: mockUserId2, isNotRemoved: false}
    ])
    await addMeeting({createdAt: daysAgo(29), attendeeIds: bothUserIds})
    const result = await loadActiveTeams(mockOrgId)
    expect(result).toEqual([])
  })

  it('should skip a team whose recent meeting only 1 person joined', async () => {
    await addTeamMembers(twoMembers)
    await addMeeting({createdAt: daysAgo(29), attendeeIds: [mockUserId1]})
    const result = await loadActiveTeams(mockOrgId)
    expect(result).toEqual([])
  })

  it('should skip a team that has never met', async () => {
    await addTeamMembers(twoMembers)
    const result = await loadActiveTeams(mockOrgId)
    expect(result).toEqual([])
  })

  it('should skip a team whose meeting started 31 days ago and is still open', async () => {
    await addTeamMembers(twoMembers)
    await addMeeting({createdAt: daysAgo(31), attendeeIds: bothUserIds})
    const result = await loadActiveTeams(mockOrgId)
    expect(result).toEqual([])
  })

  it('should skip a team whose meeting ended 31 days ago', async () => {
    await addTeamMembers(twoMembers)
    await addMeeting({createdAt: daysAgo(32), endedAt: daysAgo(31), attendeeIds: bothUserIds})
    const result = await loadActiveTeams(mockOrgId)
    expect(result).toEqual([])
  })

  it('should not require members to be unpaused', async () => {
    await addTeamMembers(twoMembers)
    await addMeeting({createdAt: daysAgo(29), attendeeIds: bothUserIds})
    await pg.updateTable('User').set({inactive: true}).where('id', '=', mockUserId2).execute()
    const result = await loadActiveTeams(mockOrgId)
    expect(result).toEqual([{id: mockTeamId, orgId: mockOrgId}])
  })

  it('should only return teams in the requested orgs', async () => {
    const otherOrgId = 'org456'
    const otherTeamId = 'team456'
    await addTeamMembers(twoMembers)
    await addMeeting({createdAt: daysAgo(29), attendeeIds: bothUserIds})
    await addOrgWithTeam(otherOrgId, otherTeamId)
    await addTeamMembers(twoMembers, otherTeamId)
    await addMeeting({
      id: 'meeting2',
      teamId: otherTeamId,
      createdAt: daysAgo(29),
      attendeeIds: bothUserIds
    })
    const result = await loadActiveTeams(otherOrgId)
    expect(result).toEqual([{id: otherTeamId, orgId: otherOrgId}])
  })
})
