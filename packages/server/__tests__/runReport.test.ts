import ms from 'ms'
import type {ReportSpec} from '../../client/shared/reports/reportCatalog'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import getKysely from '../postgres/getKysely'
import runReport from '../reports/runReport'
import {createPGTables, truncatePGTables} from './common'

const TEST_DB = 'runReportTest'
const TABLES = [
  'Organization',
  'OrganizationUser',
  'OrganizationUserAudit',
  'Team',
  'TeamMember',
  'NewMeeting',
  'MeetingMember',
  'Discussion',
  'Task',
  'TeamMemberIntegrationAuth',
  'SlackAuth',
  'User',
  'MeetingTemplate',
  'RetroReflectionGroup',
  'AgendaItem'
]

const ORG_ID = 'reportOrg'
const STARTER_ORG_ID = 'starterOrg'
const LEADER = 'leader'
const ALEX = 'alex'
const BLAIR = 'blair'
const CASEY = 'casey'
const DREW = 'drew'
const EMERY = 'emery'
const APOLLO = 'apollo'
const BOREALIS = 'borealis'
const CYGNUS = 'cygnus'
const DORADO = 'dorado'

const now = Date.now()
const daysAgo = (days: number) => new Date(now - days * ms('1d'))

const pg = getKysely(TEST_DB)

const addOrg = async (id: string, tier: 'starter' | 'team') => {
  await pg
    .insertInto('Organization')
    .values({id, name: id, tier, createdAt: daysAgo(400)})
    .execute()
}

const addOrgUsers = async (orgId: string, userIds: string[], leaderId: string) => {
  await pg
    .insertInto('OrganizationUser')
    .values(
      userIds.map((userId) => ({
        id: `${orgId}:${userId}`,
        orgId,
        userId,
        role: userId === leaderId ? ('BILLING_LEADER' as const) : null,
        joinedAt: daysAgo(60)
      }))
    )
    .execute()
}

const addTeam = async (orgId: string, id: string, userIds: string[], createdDaysAgo = 300) => {
  await pg
    .insertInto('Team')
    .values({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      orgId,
      createdAt: daysAgo(createdDaysAgo)
    })
    .execute()
  await pg
    .insertInto('TeamMember')
    .values(
      userIds.map((userId) => ({
        id: `${id}::${userId}`,
        teamId: id,
        userId,
        createdAt: daysAgo(20),
        updatedAt: daysAgo(20)
      }))
    )
    .execute()
}

const addMeeting = async (
  id: string,
  teamId: string,
  meetingType: 'retrospective' | 'action' | 'poker',
  createdDaysAgo: number,
  attendeeIds: string[],
  templateId: string | null = null
) => {
  const createdAt = daysAgo(createdDaysAgo)
  await pg
    .insertInto('NewMeeting')
    .values({
      id,
      teamId,
      meetingType,
      createdAt,
      endedAt: new Date(createdAt.getTime() + ms('1h')),
      facilitatorStageId: 'stage1',
      templateId,
      name: id,
      meetingCount: 1,
      meetingNumber: 1,
      phases: JSON.stringify([])
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

const addDiscussion = async (
  id: string,
  teamId: string,
  meetingId: string,
  createdDaysAgo: number,
  discussionTopicType: 'reflectionGroup' | 'agendaItem' = 'reflectionGroup'
) => {
  await pg
    .insertInto('Discussion')
    .values({
      id,
      teamId,
      meetingId,
      discussionTopicId: id,
      discussionTopicType,
      createdAt: daysAgo(createdDaysAgo)
    })
    .execute()
}

interface TaskInput {
  id: string
  teamId: string
  status: 'active' | 'stuck' | 'done' | 'future'
  createdDaysAgo: number
  meetingId?: string
  doneDaysAgo?: number
  doneMeetingId?: string
  discussionId?: string
  service?: string
  isArchived?: boolean
  userId?: string
}

const addTasks = async (tasks: TaskInput[]) => {
  await pg
    .insertInto('Task')
    .values(
      tasks.map((task) => ({
        id: task.id,
        teamId: task.teamId,
        status: task.status,
        content: JSON.stringify({}),
        plaintextContent: task.id,
        createdBy: LEADER,
        userId: task.userId ?? null,
        createdAt: daysAgo(task.createdDaysAgo),
        updatedAt: daysAgo(task.doneDaysAgo ?? task.createdDaysAgo),
        meetingId: task.meetingId ?? null,
        doneAt: task.doneDaysAgo === undefined ? null : daysAgo(task.doneDaysAgo),
        doneMeetingId: task.doneMeetingId ?? null,
        discussionId: task.discussionId ?? null,
        integration: task.service ? JSON.stringify({service: task.service}) : null,
        integrationHash: task.service ? `${task.service}:${task.id}` : null,
        tags: task.isArchived ? ['archived'] : []
      }))
    )
    .execute()
}

// Apollo: leader, alex & emery, who left 3 days ago. Borealis: alex & blair. Cygnus: casey & drew. Dorado: drew
const seedOrg = async () => {
  await addOrg(ORG_ID, 'team')
  await addOrgUsers(ORG_ID, [LEADER, ALEX, BLAIR, CASEY, DREW, EMERY], LEADER)
  await addTeam(ORG_ID, APOLLO, [LEADER, ALEX, EMERY])
  await pg
    .updateTable('TeamMember')
    .set({isNotRemoved: false, updatedAt: daysAgo(3)})
    .where('id', '=', `${APOLLO}::${EMERY}`)
    .execute()
  await addTeam(ORG_ID, BOREALIS, [ALEX, BLAIR])
  await addTeam(ORG_ID, CYGNUS, [CASEY, DREW])
  await addTeam(ORG_ID, DORADO, [DREW])

  await addMeeting('apolloRetro', APOLLO, 'retrospective', 2, [LEADER, ALEX])
  await addMeeting('apolloCheckIn', APOLLO, 'action', 1, [LEADER])
  await addMeeting('borealisPoker', BOREALIS, 'poker', 3, [ALEX, BLAIR])
  await addMeeting('cygnusRetro', CYGNUS, 'retrospective', 10, [CASEY, DREW])

  await addDiscussion('topicWithTask', APOLLO, 'apolloRetro', 2)
  await addDiscussion('topicWithoutTask', APOLLO, 'apolloRetro', 2)
  await addDiscussion('checkInTopic', APOLLO, 'apolloCheckIn', 1)
  await addDiscussion('pokerStory', BOREALIS, 'borealisPoker', 3)

  await addTasks([
    {
      id: 'retroTask',
      teamId: APOLLO,
      status: 'active',
      createdDaysAgo: 2,
      meetingId: 'apolloRetro',
      discussionId: 'topicWithTask'
    },
    {
      id: 'retroTaskDone',
      teamId: APOLLO,
      status: 'done',
      createdDaysAgo: 2,
      meetingId: 'apolloRetro',
      doneDaysAgo: 1
    },
    {id: 'stuckTask', teamId: APOLLO, status: 'stuck', createdDaysAgo: 5},
    {id: 'doneTask', teamId: APOLLO, status: 'done', createdDaysAgo: 5, doneDaysAgo: 2},
    {
      id: 'pokerImport',
      teamId: BOREALIS,
      status: 'active',
      createdDaysAgo: 3,
      meetingId: 'borealisPoker',
      service: 'jira',
      isArchived: true
    },
    {
      id: 'pushedTask',
      teamId: BOREALIS,
      status: 'active',
      createdDaysAgo: 3,
      meetingId: 'borealisPoker',
      service: 'github'
    },
    // done before doneAt was recorded, so its done date comes from the meeting that archived it
    {
      id: 'oldDoneTask',
      teamId: CYGNUS,
      status: 'done',
      createdDaysAgo: 12,
      meetingId: 'cygnusRetro',
      doneMeetingId: 'cygnusRetro'
    }
  ])
  await pg
    .updateTable('Task')
    .set({updatedAt: daysAgo(10)})
    .where('id', '=', 'oldDoneTask')
    .execute()

  await pg
    .insertInto('TeamMemberIntegrationAuth')
    .values([
      {
        teamId: APOLLO,
        userId: LEADER,
        providerId: 1,
        service: 'jira',
        isActive: true,
        createdAt: daysAgo(10),
        updatedAt: daysAgo(10)
      },
      {
        teamId: APOLLO,
        userId: ALEX,
        providerId: 2,
        service: 'github',
        isActive: false,
        createdAt: daysAgo(10),
        updatedAt: daysAgo(2)
      }
    ])
    .execute()
  await pg
    .insertInto('SlackAuth')
    .values({
      id: 'blairSlack',
      teamId: BOREALIS,
      userId: BLAIR,
      botUserId: 'bot',
      defaultTeamChannelId: 'channel',
      slackTeamId: 'slackTeam',
      slackTeamName: 'Slack Team',
      slackUserId: 'slackUser',
      slackUserName: 'blair',
      isActive: true,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(10)
    })
    .execute()

  await pg
    .insertInto('OrganizationUserAudit')
    .values([
      ...[LEADER, ALEX, BLAIR, CASEY, DREW, EMERY].map((userId) => ({
        orgId: ORG_ID,
        userId,
        eventDate: daysAgo(60),
        eventType: 'added' as const
      })),
      {orgId: ORG_ID, userId: BLAIR, eventDate: daysAgo(2), eventType: 'inactivated' as const}
    ])
    .execute()
}

// The Starter org's busiest teams are first & second; third has the most members but never met
const seedStarterOrg = async () => {
  await addOrg(STARTER_ORG_ID, 'starter')
  await addOrgUsers(STARTER_ORG_ID, ['starterLeader'], 'starterLeader')
  await addTeam(STARTER_ORG_ID, 'first', ['s1', 's2'], 100)
  await addTeam(STARTER_ORG_ID, 'second', ['s1', 's2', 's3'], 50)
  await addTeam(STARTER_ORG_ID, 'third', ['s1', 's2', 's3', 's4', 's5'], 200)
  await addMeeting('firstRetro', 'first', 'retrospective', 4, ['s1', 's2'])
  await addMeeting('secondRetro', 'second', 'retrospective', 4, ['s1', 's2'])
}

const WORK_ORG_ID = 'workOrg'
const WREN = 'wren'
const WENDY = 'wendy'
const XAVIER = 'xavier'
const YARA = 'yara'
const WEB = 'web'
const YARD = 'yard'

// Wren leads the org from Web alone. Web: wren, wendy & xavier. Yard: xavier & yara, whose own retro
// template and topic Wren mustn't see named. Wendy went inactive 10 days ago
const seedWorkOrg = async () => {
  const people = [
    [WREN, 'Wren', 0],
    [WENDY, 'Wendy', 45],
    [XAVIER, 'Xavier', 2],
    [YARA, 'Yara', 90]
  ] as const
  await pg
    .insertInto('User')
    .values(
      people.map(([id, preferredName, lastSeenDaysAgo]) => ({
        id,
        preferredName,
        email: `${id}@example.com`,
        picture: '',
        lastSeenAt: daysAgo(lastSeenDaysAgo)
      }))
    )
    .execute()
  await addOrg(WORK_ORG_ID, 'team')
  await addOrgUsers(WORK_ORG_ID, [WREN, WENDY, XAVIER, YARA], WREN)
  await pg
    .insertInto('OrganizationUserAudit')
    .values([
      ...[WREN, WENDY, XAVIER, YARA].map((userId) => ({
        orgId: WORK_ORG_ID,
        userId,
        eventDate: daysAgo(60),
        eventType: 'added' as const
      })),
      {orgId: WORK_ORG_ID, userId: WENDY, eventDate: daysAgo(10), eventType: 'inactivated' as const}
    ])
    .execute()
  await addTeam(WORK_ORG_ID, WEB, [WREN, WENDY, XAVIER])
  await addTeam(WORK_ORG_ID, YARD, [XAVIER, YARA])
  await pg
    .insertInto('MeetingTemplate')
    .values([
      {
        id: 'startStopContinue',
        name: 'Start Stop Continue',
        scope: 'PUBLIC',
        orgId: 'aGhostOrg',
        teamId: 'aGhostTeam',
        type: 'retrospective',
        illustrationUrl: '',
        mainCategory: 'retrospective'
      },
      {
        id: 'yardTemplate',
        name: 'Yard retro',
        scope: 'TEAM',
        orgId: WORK_ORG_ID,
        teamId: YARD,
        type: 'retrospective',
        illustrationUrl: '',
        mainCategory: 'retrospective'
      }
    ])
    .execute()
  await addMeeting('webRetro', WEB, 'retrospective', 5, [WREN, WENDY], 'startStopContinue')
  await addMeeting('oldWebRetro', WEB, 'retrospective', 40, [WREN, XAVIER], 'startStopContinue')
  await addMeeting('webCheckIn', WEB, 'action', 4, [WREN, XAVIER])
  await addMeeting('yardRetro', YARD, 'retrospective', 6, [XAVIER, YARA], 'yardTemplate')

  await addDiscussion('techDebt', WEB, 'webRetro', 5)
  await addDiscussion('techDebtAgain', WEB, 'webRetro', 5)
  await addDiscussion('docs', WEB, 'webRetro', 5)
  await addDiscussion('hiring', WEB, 'webCheckIn', 4, 'agendaItem')
  await addDiscussion('yardTopic', YARD, 'yardRetro', 6)
  await pg
    .insertInto('RetroReflectionGroup')
    .values([
      {id: 'techDebt', meetingId: 'webRetro', promptId: 'prompt', title: 'Tech debt'},
      {id: 'techDebtAgain', meetingId: 'webRetro', promptId: 'prompt', title: 'tech debt'},
      {id: 'docs', meetingId: 'webRetro', promptId: 'prompt', smartTitle: 'Docs'},
      {id: 'yardTopic', meetingId: 'yardRetro', promptId: 'prompt', title: 'Reorg'}
    ])
    .execute()
  await pg
    .insertInto('AgendaItem')
    .values({
      id: 'hiring',
      content: 'Hiring plan ',
      sortOrder: 'a',
      teamId: WEB,
      teamMemberId: `${WEB}::${WREN}`
    })
    .execute()

  const webTask = (task: Omit<TaskInput, 'teamId'>): TaskInput => ({teamId: WEB, ...task})
  await addTasks([
    ...['debtTask', 'debtTaskToo'].map((id) =>
      webTask({
        id,
        status: 'active',
        createdDaysAgo: 5,
        meetingId: 'webRetro',
        discussionId: 'techDebt',
        userId: WENDY
      })
    ),
    webTask({
      id: 'debtTaskDone',
      status: 'done',
      createdDaysAgo: 5,
      doneDaysAgo: 4,
      meetingId: 'webRetro',
      discussionId: 'techDebtAgain',
      userId: XAVIER
    }),
    webTask({
      id: 'docsTask',
      status: 'done',
      createdDaysAgo: 5,
      doneDaysAgo: 3,
      meetingId: 'webRetro',
      discussionId: 'docs',
      userId: XAVIER
    }),
    webTask({
      id: 'hiringTask',
      status: 'active',
      createdDaysAgo: 4,
      meetingId: 'webCheckIn',
      discussionId: 'hiring',
      userId: WREN
    }),
    {
      id: 'yardTask',
      teamId: YARD,
      status: 'active',
      createdDaysAgo: 6,
      meetingId: 'yardRetro',
      discussionId: 'yardTopic',
      userId: YARA
    },
    webTask({id: 'slowTask', status: 'done', createdDaysAgo: 30, doneDaysAgo: 2}),
    webTask({id: 'task45Days', status: 'active', createdDaysAgo: 45, userId: WENDY}),
    webTask({id: 'task100Days', status: 'stuck', createdDaysAgo: 100}),
    webTask({id: 'task200Days', status: 'future', createdDaysAgo: 200}),
    webTask({id: 'task300Days', status: 'future', createdDaysAgo: 300})
  ])
}

const baseSpec: ReportSpec = {
  measures: ['MEETINGS'],
  breakdown: [],
  filters: [],
  where: [],
  period: {preset: 'LAST_7_DAYS'},
  showAs: 'NUMBER'
}

const report = async (
  overrides: Partial<ReportSpec>,
  {viewerId = LEADER, orgId = ORG_ID, timeZone = 'UTC'} = {}
) => {
  const dataLoader = getNewDataLoader('runReportTest')
  try {
    return await runReport({
      orgId,
      spec: {...baseSpec, ...overrides},
      timeZone,
      pagePeriod: null,
      viewerId,
      isSuperUser: false,
      dataLoader
    })
  } finally {
    dataLoader.dispose()
  }
}

const valuesOf = (result: Awaited<ReturnType<typeof report>>) =>
  result.rows.map(({values}) => values[0])

const byLabel = (result: Awaited<ReturnType<typeof report>>) =>
  Object.fromEntries(
    result.rows.map(({keys, values}) => [keys.map(({label}) => label).join(' / '), values[0]])
  )

const overDays: Partial<ReportSpec> = {showAs: 'LINE', breakdown: [{dimension: 'DAY'}]}
const byTeam: Partial<ReportSpec> = {showAs: 'BARS', breakdown: [{dimension: 'TEAM'}]}

beforeAll(async () => {
  await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
  await createPGTables(...TABLES)
  await truncatePGTables(...TABLES)
  await seedOrg()
  await seedStarterOrg()
  await seedWorkOrg()
})

afterAll(async () => {
  await pg.schema.dropSchema(TEST_DB).cascade().execute()
  await pg.destroy()
})

describe('meetings', () => {
  test('a meeting only one person joined is not counted', async () => {
    const result = await report({})
    expect(valuesOf(result)).toEqual([2])
    expect(result.step).toBeNull()
  })

  test('daily steps add up to the total', async () => {
    const result = await report(overDays)
    expect(result.step).toBe('DAY')
    expect(valuesOf(result)).toEqual([0, 0, 0, 1, 1, 0, 0])
    expect(result.rows.some(({keys}) => keys[0]!.isPartial)).toBe(false)
  })

  test('a leader sees every team, even ones with nothing to count', async () => {
    expect(byLabel(await report(byTeam))).toEqual({Apollo: 1, Borealis: 1, Cygnus: 0, Dorado: 0})
  })

  test('a member sees only the teams they are on', async () => {
    expect(byLabel(await report(byTeam, {viewerId: ALEX}))).toEqual({Apollo: 1, Borealis: 1})
    expect(valuesOf(await report({}, {viewerId: BLAIR}))).toEqual([1])
  })

  test('every meeting type gets a row', async () => {
    const result = await report({showAs: 'BARS', breakdown: [{dimension: 'MEETING_TYPE'}]})
    expect(byLabel(result)).toEqual({
      Retrospective: 1,
      'Sprint Poker': 1,
      'Check-in': 0,
      Standup: 0,
      'Team Health': 0
    })
  })

  test('the previous period lines up step by step', async () => {
    const total = await report({compareTo: 'PREVIOUS_PERIOD'})
    expect(total.rows[0]!.previousValues).toEqual([1])
    const daily = await report({...overDays, compareTo: 'PREVIOUS_PERIOD'})
    expect(daily.rows.map(({previousValues}) => previousValues![0])).toEqual([0, 0, 0, 1, 0, 0, 0])
  })

  test('only show, sort and limit shape the rows', async () => {
    const atLeastOne = await report({
      ...byTeam,
      showAs: 'TABLE',
      where: [{measure: 'MEETINGS', operator: 'AT_LEAST', value: 1}]
    })
    expect(Object.keys(byLabel(atLeastOne))).toEqual(['Apollo', 'Borealis'])
    expect(atLeastOne.totalRowCount).toBe(2)
    const byNameDescending = await report({...byTeam, sort: {by: 'NAME', order: 'DESC'}})
    expect(Object.keys(byLabel(byNameDescending))).toEqual([
      'Dorado',
      'Cygnus',
      'Borealis',
      'Apollo'
    ])
    const fewest = await report({...byTeam, sort: {by: 'VALUE', order: 'ASC'}, limit: 2})
    expect(Object.keys(byLabel(fewest))).toEqual(['Cygnus', 'Dorado'])
  })

  test('teams that have not met lately, including teams that never met', async () => {
    const result = await report({
      measures: ['LAST_MEETING'],
      showAs: 'TABLE',
      breakdown: [{dimension: 'TEAM'}],
      period: {preset: 'LAST_30_DAYS'},
      where: [{measure: 'LAST_MEETING', operator: 'OLDER_THAN_DAYS', value: 5}]
    })
    expect(byLabel(result)).toEqual({Cygnus: daysAgo(10).getTime(), Dorado: null})
  })

  test('teams that met need 2 members and a counted meeting', async () => {
    expect(valuesOf(await report({measures: ['TEAMS_THAT_MET']}))).toEqual([2])
    expect(
      valuesOf(await report({measures: ['TEAMS_THAT_MET'], period: {preset: 'LAST_30_DAYS'}}))
    ).toEqual([3])
    expect(
      valuesOf(
        await report({
          measures: ['TEAMS_THAT_MET'],
          filters: [{dimension: 'TEAM', values: [APOLLO, DORADO]}]
        })
      )
    ).toEqual([1])
  })

  test('discussions count in counted meetings', async () => {
    expect(valuesOf(await report({measures: ['DISCUSSIONS']}))).toEqual([3])
    expect(valuesOf(await report({measures: ['DISCUSSIONS_WITH_A_TASK']}))).toEqual([1])
  })
})

describe('tasks', () => {
  test('new tasks leave out Sprint Poker imports', async () => {
    expect(valuesOf(await report({measures: ['NEW_TASKS']}))).toEqual([5])
  })

  test('new tasks by the meeting they came from and their status', async () => {
    const result = await report({
      measures: ['NEW_TASKS'],
      showAs: 'HEATMAP',
      breakdown: [{dimension: 'MEETING_TYPE'}, {dimension: 'TASK_STATUS'}]
    })
    expect(result.rows).toHaveLength(24)
    const nonZero = Object.fromEntries(Object.entries(byLabel(result)).filter(([, value]) => value))
    expect(nonZero).toEqual({
      'Retrospective / Active': 1,
      'Retrospective / Done': 1,
      'Sprint Poker / Active': 1,
      'Outside meetings / Stuck': 1,
      'Outside meetings / Done': 1
    })
  })

  test('pushed tasks include Sprint Poker imports', async () => {
    const result = await report({
      measures: ['TASKS_PUSHED'],
      showAs: 'BARS',
      breakdown: [{dimension: 'INTEGRATION'}]
    })
    expect(byLabel(result)).toEqual({'Jira Cloud': 1, GitHub: 1})
  })

  test('done dates recorded before doneAt are estimated, and say so', async () => {
    const recent = await report({measures: ['DONE_TASKS']})
    expect(valuesOf(recent)).toEqual([2])
    expect(recent.notes).toEqual([])
    const month = await report({measures: ['DONE_TASKS'], period: {preset: 'LAST_30_DAYS'}})
    expect(valuesOf(month)).toEqual([3])
    expect(month.notes).toEqual([{kind: 'ESTIMATED_HISTORY', count: 1}])
  })

  test('open tasks are read at the end of each day', async () => {
    expect(valuesOf(await report({...overDays, measures: ['OPEN_TASKS']}))).toEqual([
      0, 2, 2, 3, 4, 3, 3
    ])
  })
})

describe('people', () => {
  test('members by team read each team as it is now', async () => {
    const result = await report({...byTeam, measures: ['MEMBERS']})
    expect(byLabel(result)).toEqual({Apollo: 2, Borealis: 2, Cygnus: 2, Dorado: 1})
  })

  test('a member who left counts until the day they left', async () => {
    const result = await report({
      ...overDays,
      measures: ['MEMBERS'],
      filters: [{dimension: 'TEAM', values: [APOLLO]}]
    })
    expect(valuesOf(result)).toEqual([3, 3, 3, 2, 2, 2, 2])
  })

  test('someone who left and came back counts while they were away, since the row is reused', async () => {
    await pg
      .updateTable('TeamMember')
      .set({isNotRemoved: true, updatedAt: daysAgo(1)})
      .where('id', '=', `${APOLLO}::${EMERY}`)
      .execute()
    try {
      const result = await report({
        ...overDays,
        measures: ['MEMBERS'],
        filters: [{dimension: 'TEAM', values: [APOLLO]}]
      })
      expect(valuesOf(result)).toEqual([3, 3, 3, 3, 3, 3, 3])
    } finally {
      await pg
        .updateTable('TeamMember')
        .set({isNotRemoved: false, updatedAt: daysAgo(3)})
        .where('id', '=', `${APOLLO}::${EMERY}`)
        .execute()
    }
  })

  test('a leader counts the whole organization', async () => {
    expect(valuesOf(await report({measures: ['MEMBERS']}))).toEqual([6])
    expect(valuesOf(await report({...overDays, measures: ['ACTIVE_PEOPLE']}))).toEqual([
      6, 6, 6, 6, 5, 5, 5
    ])
  })

  test('a member counts the active people on their teams', async () => {
    const result = await report({...overDays, measures: ['ACTIVE_PEOPLE']}, {viewerId: ALEX})
    expect(valuesOf(result)).toEqual([4, 4, 4, 3, 2, 2, 2])
  })

  test('user integrations count each person and service once, until disconnected', async () => {
    expect(valuesOf(await report({...overDays, measures: ['USER_INTEGRATIONS']}))).toEqual([
      3, 3, 3, 3, 2, 2, 2
    ])
  })
})

describe('limits', () => {
  test('Starter counts its 2 busiest teams and says how many were left out', async () => {
    const result = await report(byTeam, {viewerId: 'starterLeader', orgId: STARTER_ORG_ID})
    expect(byLabel(result)).toEqual({First: 1, Second: 1})
    expect(result.notes).toEqual([{kind: 'STARTER_LIMIT', count: 1}])
  })

  test('rows past the cap are cut, and the note says how many there were', async () => {
    const result = await report({
      showAs: 'TABLE',
      breakdown: [{dimension: 'DAY'}, {dimension: 'TEAM'}, {dimension: 'MEETING_TYPE'}],
      period: {
        startDate: daysAgo(400).toISOString().slice(0, 10),
        endDate: daysAgo(36).toISOString().slice(0, 10)
      }
    })
    expect(result.rows).toHaveLength(5000)
    expect(result.notes).toEqual([{kind: 'ROWS_TRUNCATED', count: 365 * 4 * 5}])
  })

  test('a spec that breaks the rules is refused', async () => {
    await expect(report({breakdown: [{dimension: 'TEAM'}]})).rejects.toThrow(
      'NUMBER takes 0 breakdowns'
    )
    await expect(report({}, {timeZone: 'Mars/Olympus_Mons'})).rejects.toThrow("isn't a time zone")
  })
})

describe('people and work', () => {
  const asWren = {orgId: WORK_ORG_ID, viewerId: WREN}
  const asXavier = {orgId: WORK_ORG_ID, viewerId: XAVIER}
  const recently: Partial<ReportSpec> = {showAs: 'TABLE', period: {preset: 'LAST_30_DAYS'}}

  test('active share is the percentage of members active at the reading', async () => {
    expect(byLabel(await report({measures: ['ACTIVE_SHARE'], ...byTeam}, asWren))).toEqual({
      Web: 66.7,
      Yard: 100
    })
    expect(valuesOf(await report({measures: ['ACTIVE_SHARE']}, asWren))).toEqual([75])
  })

  test('last seen lists the members not seen lately, oldest first, whatever the period', async () => {
    const notSeen: Partial<ReportSpec> = {
      measures: ['LAST_SEEN'],
      showAs: 'TABLE',
      breakdown: [{dimension: 'PERSON'}],
      where: [{measure: 'LAST_SEEN', operator: 'OLDER_THAN_DAYS', value: 30}],
      sort: {by: 'VALUE', order: 'ASC'}
    }
    const labelsOf = (result: Awaited<ReturnType<typeof report>>) =>
      result.rows.map(({keys}) => keys[0]!.label)
    expect(labelsOf(await report(notSeen, asWren))).toEqual(['Yara', 'Wendy'])
    expect(labelsOf(await report(notSeen, {orgId: WORK_ORG_ID, viewerId: WENDY}))).toEqual([
      'Wendy'
    ])
  })

  test('days to done is the median of the tasks finished in the period', async () => {
    const daysToDone: Partial<ReportSpec> = {measures: ['DAYS_TO_DONE']}
    expect(valuesOf(await report(daysToDone, asWren))).toEqual([2])
    expect(
      byLabel(
        await report({...daysToDone, showAs: 'TABLE', breakdown: [{dimension: 'PERSON'}]}, asWren)
      )
    ).toEqual({Xavier: 1.5, 'No one': 28})
    expect(byLabel(await report({...daysToDone, ...byTeam}, asWren))).toEqual({Web: 2, Yard: null})
  })

  test('open tasks by age keep the ages in order unless sorted', async () => {
    const byAge: Partial<ReportSpec> = {
      measures: ['OPEN_TASKS'],
      showAs: 'BARS',
      breakdown: [{dimension: 'TASK_AGE'}],
      period: {preset: 'ALL_TIME'}
    }
    const inOrder = await report(byAge, asWren)
    expect(inOrder.rows.map(({keys, values}) => `${keys[0]!.label} ${values[0]}`)).toEqual([
      'Under 30 days 4',
      '30 to 90 days 1',
      '90 to 180 days 1',
      'Over 180 days 2'
    ])
    const byValue = await report({...byAge, sort: {by: 'VALUE', order: 'DESC'}}, asWren)
    expect(byValue.rows.map(({keys}) => keys[0]!.label)).toEqual([
      'Under 30 days',
      'Over 180 days',
      '30 to 90 days',
      '90 to 180 days'
    ])
  })

  test('topics add up whatever their case, and only come from the teams the viewer is on', async () => {
    const byTopic: Partial<ReportSpec> = {
      ...recently,
      measures: ['NEW_TASKS'],
      breakdown: [{dimension: 'TOPIC'}]
    }
    const leader = await report(byTopic, asWren)
    expect(byLabel(leader)).toEqual({'Tech debt': 3, Docs: 1, 'Hiring plan': 1})
    expect(leader.notes).toEqual([{kind: 'TOPICS_FROM_OWN_TEAMS', count: 1}])
    const member = await report(byTopic, asXavier)
    expect(byLabel(member)).toEqual({'Tech debt': 3, Docs: 1, 'Hiring plan': 1, Reorg: 1})
    expect(member.notes).toEqual([])
  })

  test('a team’s own template is named only for the people on that team', async () => {
    const byTemplate: Partial<ReportSpec> = {...recently, breakdown: [{dimension: 'TEMPLATE'}]}
    expect(byLabel(await report(byTemplate, asWren))).toEqual({
      'Start Stop Continue': 1,
      'No template': 1,
      'Another team’s template': 1
    })
    expect(byLabel(await report(byTemplate, asXavier))).toEqual({
      'Start Stop Continue': 1,
      'No template': 1,
      'Yard retro': 1
    })
  })

  test('by person, a meeting counts for each person who joined it', async () => {
    expect(
      byLabel(await report({...recently, breakdown: [{dimension: 'PERSON'}]}, asWren))
    ).toEqual({Wren: 2, Wendy: 1, Xavier: 2, Yara: 1})
    expect(
      valuesOf(
        await report(
          {...recently, showAs: 'NUMBER', filters: [{dimension: 'PERSON', values: [WREN, XAVIER]}]},
          asWren
        )
      )
    ).toEqual([3])
  })

  test('a share or median can’t stack', async () => {
    await expect(
      report(
        {
          measures: ['ACTIVE_SHARE'],
          showAs: 'BARS',
          breakdown: [{dimension: 'TIME'}, {dimension: 'TEAM'}]
        },
        asWren
      )
    ).rejects.toThrow("ACTIVE_SHARE can't be stacked")
  })
})
