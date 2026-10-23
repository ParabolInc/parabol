/*
  Seeds Copper, a sample organization to try Reports with: 32 people on 11 teams with a year of retrospectives,
  check-ins, standups, Sprint Poker and Team Health checks, their discussions, tasks and integrations, Team Health
  comments and AI summaries, a team structure, and the Reports flag on. Every run adds another Copper
  `pnpm dev:seed someone@example.com` makes that person its billing leader, signing them up first if needed
  `--starter` puts it on the Starter plan, whose reports count its 2 busiest teams
*/
import crypto from 'crypto'
import {createRequire} from 'module'
import type {Client} from 'pg'
import connectToPostgres from './devStack/connectToPostgres.mts'
import ensureDevUser from './devStack/ensureDevUser.mts'
import readStack from './devStack/readStack.mts'

type MeetingType = 'retrospective' | 'action' | 'teamPrompt' | 'poker' | 'teamHealth'
type Row = Record<string, unknown>

interface SampleTeam {
  name: string
  // business unit, department and region, null where no one has placed the team yet
  places: [string | null, string | null, string | null]
  // indexes into PEOPLE
  members: number[]
  // each kind of meeting the team holds and the days between them
  meetings: [MeetingType, number][]
  firstMetDaysAgo: number
  lastMetDaysAgo: number
  pushesTo?: string
  viewer?: 'lead' | 'member'
  hasFewAnswersInLatestCheck?: boolean
  // the AI summary of one category in its latest check is still being written
  hasPendingSummaryInLatestCheck?: boolean
  // the categories, by position, that people answer far apart from each other in its latest check
  splitInLatestCheck?: number[]
  // how far its Team Health scores move over the year
  healthTrend?: number
}

interface Membership {
  userId: string
  joinedDaysAgo: number
  leftDaysAgo: number | null
  isLead: boolean
}

const require = createRequire(import.meta.url)
const DAY = 24 * 60 * 60 * 1000
const NOW = Date.now()

const PEOPLE = [
  'Avery Chen',
  'Blake Okafor',
  'Casey Nair',
  'Devon Reyes',
  'Emery Brandt',
  'Finley Mehta',
  'Gray Turner',
  'Harper Ito',
  'Indigo Park',
  'Jules Moreau',
  'Kai Lindqvist',
  'Logan Adeyemi',
  'Morgan Silva',
  'Noor Haddad',
  'Oakley Novak',
  'Parker Huang',
  'Quinn Dubois',
  'Riley Kowalski',
  'Sage Mwangi',
  'Taylor Rossi',
  'Uma Fischer',
  'Val Moreno',
  'Wren Sato',
  'Xander Olsen',
  'Yael Cohen',
  'Zion Baptiste',
  'Ari Takahashi',
  'Bea Lund',
  'Cruz Alvarez',
  'Dana Kim',
  'Eli Varga',
  'Fran Okoro'
]

const LEVELS = [
  ['Business unit', ['Platform', 'Custody', 'Trading', 'Corporate']],
  ['Department', ['Engineering', 'Infrastructure', 'Operations', 'Leadership']],
  ['Region', ['Americas', 'EMEA', 'APAC']]
] as const

const TEAMS: SampleTeam[] = [
  {
    name: 'Engineering Leads',
    places: ['Platform', 'Leadership', 'Americas'],
    members: [0, 4, 8, 12],
    meetings: [
      ['action', 7],
      ['retrospective', 28],
      ['teamHealth', 91]
    ],
    firstMetDaysAgo: 360,
    lastMetDaysAgo: 2,
    viewer: 'lead'
  },
  {
    name: 'Core Infra',
    places: ['Platform', 'Infrastructure', 'Americas'],
    members: [1, 2, 3, 13, 16, 20],
    meetings: [
      ['retrospective', 14],
      ['poker', 14],
      ['teamHealth', 91]
    ],
    firstMetDaysAgo: 360,
    lastMetDaysAgo: 1,
    pushesTo: 'github',
    viewer: 'member'
  },
  {
    name: 'Platform Apps',
    places: ['Platform', 'Engineering', 'Americas'],
    members: [5, 6, 7, 9, 14],
    meetings: [
      ['teamPrompt', 7],
      ['retrospective', 14],
      ['poker', 14],
      ['teamHealth', 91]
    ],
    firstMetDaysAgo: 360,
    lastMetDaysAgo: 3,
    pushesTo: 'jira',
    hasPendingSummaryInLatestCheck: true
  },
  {
    name: 'Data',
    places: ['Platform', 'Engineering', 'EMEA'],
    members: [3, 10, 11, 15],
    meetings: [
      ['teamPrompt', 7],
      ['retrospective', 21]
    ],
    firstMetDaysAgo: 330,
    lastMetDaysAgo: 4,
    pushesTo: 'linear'
  },
  {
    name: 'Custody Ops',
    places: ['Custody', 'Operations', 'APAC'],
    members: [17, 18, 19, 21, 22],
    meetings: [
      ['action', 14],
      ['retrospective', 28],
      ['teamHealth', 91]
    ],
    firstMetDaysAgo: 360,
    lastMetDaysAgo: 6,
    healthTrend: -1.2,
    splitInLatestCheck: [0, 2]
  },
  {
    name: 'Asset Servicing',
    places: ['Custody', 'Operations', 'EMEA'],
    members: [23, 24, 25],
    meetings: [
      ['retrospective', 21],
      ['action', 21]
    ],
    firstMetDaysAgo: 300,
    lastMetDaysAgo: 40
  },
  {
    name: 'Markets',
    places: ['Trading', 'Operations', 'APAC'],
    members: [26, 27, 28, 29],
    meetings: [
      ['teamPrompt', 7],
      ['retrospective', 14],
      ['teamHealth', 91]
    ],
    firstMetDaysAgo: 360,
    lastMetDaysAgo: 2,
    hasFewAnswersInLatestCheck: true
  },
  {
    name: 'Quality Eng',
    places: ['Trading', 'Engineering', 'EMEA'],
    members: [9, 30, 31, 16],
    meetings: [
      ['retrospective', 14],
      ['poker', 14]
    ],
    firstMetDaysAgo: 270,
    lastMetDaysAgo: 5,
    pushesTo: 'jira'
  },
  {
    name: 'Shared Services',
    places: ['Corporate', 'Infrastructure', 'Americas'],
    members: [12, 22, 24, 28],
    meetings: [
      ['action', 14],
      ['retrospective', 42]
    ],
    firstMetDaysAgo: 360,
    lastMetDaysAgo: 9
  },
  {
    name: 'Venues',
    places: [null, null, null],
    members: [20, 21, 27],
    meetings: [['retrospective', 21]],
    firstMetDaysAgo: 360,
    lastMetDaysAgo: 95
  },
  {
    name: 'New Ventures',
    places: ['Corporate', null, null],
    members: [8, 14, 19],
    meetings: [
      ['retrospective', 7],
      ['action', 7]
    ],
    firstMetDaysAgo: 28,
    lastMetDaysAgo: 3
  }
]

// people who stopped using Parabol and when, one of whom came back
const LAPSES: Record<number, {lapsedDaysAgo: number; returnedDaysAgo?: number}> = {
  6: {lapsedDaysAgo: 120},
  21: {lapsedDaysAgo: 80, returnedDaysAgo: 20},
  25: {lapsedDaysAgo: 35},
  31: {lapsedDaysAgo: 15}
}
const QUIET_PEOPLE = [3, 15, 24, 29]

// team, person, service, connected and disconnected days ago
const INTEGRATIONS: [string, number, string, number, number | null][] = [
  ['Core Infra', 1, 'github', 300, null],
  ['Core Infra', 2, 'github', 200, null],
  ['Core Infra', 13, 'jira', 150, 30],
  ['Platform Apps', 5, 'jira', 320, null],
  ['Platform Apps', 6, 'jira', 90, null],
  ['Platform Apps', 9, 'github', 40, null],
  ['Data', 10, 'linear', 250, null],
  ['Data', 11, 'linear', 25, null],
  ['Quality Eng', 30, 'jira', 180, null],
  ['Quality Eng', 31, 'azureDevOps', 60, 10],
  ['Custody Ops', 17, 'jira', 120, null]
]
const SLACK_CONNECTIONS: [string, number, number][] = [
  ['Engineering Leads', 0, 330],
  ['Markets', 26, 200],
  ['Custody Ops', 18, 45]
]

const RETRO_TOPICS = [
  'Tech debt',
  'Deploy pipeline',
  'On-call load',
  'Flaky tests',
  'Code review wait times',
  'Docs',
  'Knowledge silos',
  'Alert fatigue',
  'Release cadence',
  'Hiring',
  'Customer escalations',
  'Roadmap clarity',
  'Meeting load',
  'Handoffs between teams',
  'Onboarding'
]
const AGENDA_TOPICS = [
  'Hiring plan',
  'Quarterly goals',
  'Vendor review',
  'Budget',
  'Incident follow-ups',
  'Process changes',
  'Customer feedback',
  'Capacity'
]
const TASK_STARTS = ['Write up', 'Pair on', 'Follow up on', 'Draft a plan for', 'Measure', 'Fix']
const STORY_TITLES = [
  'Retry failed webhooks',
  'Paginate the audit log',
  'Cache account lookups',
  'Add SSO to the admin app',
  'Export settlements as CSV',
  'Alert on slow queries',
  'Rotate API keys',
  'Archive old trades'
]
// what people say about a category, as written and as AI rewords it when they answer anonymously
const HEALTH_COMMENTS: Record<'low' | 'mid' | 'high', [string, string][]> = {
  low: [
    [
      'Work stalls at the on-call handoff and nobody owns picking it back up.',
      'Work tends to stall at the on-call handoff, with no clear owner to restart it.'
    ],
    [
      'We keep saying yes to interrupts, so sprint commitments slip every time.',
      'Saying yes to interrupt requests keeps pushing sprint commitments back.'
    ],
    [
      'I don’t feel safe raising problems in planning. It gets treated as negativity.',
      'Raising problems in planning can be treated as negativity, so it feels risky.'
    ],
    [
      'Priorities change mid-sprint and nobody explains why.',
      'Priorities shift mid-sprint without an explanation.'
    ],
    [
      'Reviews sit for days, so “on time” stops meaning much.',
      'Code reviews wait for days, which makes delivering on time hard to judge.'
    ],
    [
      'I can’t see how my work connects to anything customers notice.',
      'It is hard to see how the work connects to anything customers notice.'
    ]
  ],
  mid: [
    [
      'Mostly fine, but the roadmap is fuzzy past next month.',
      'Mostly fine, though the roadmap is unclear beyond next month.'
    ],
    [
      'Better than last quarter. Standups are shorter and more useful.',
      'An improvement on last quarter, with shorter and more useful standups.'
    ],
    ['Depends on the week. Release weeks are rough.', 'It varies, and release weeks are hard.'],
    [
      'Good intentions, uneven follow-through on action items.',
      'Intentions are good, but follow-through on action items is uneven.'
    ]
  ],
  high: [
    [
      'The new triage rotation catches dropped tickets early. First thing that’s really helped.',
      'The new triage rotation catches dropped tickets early, the first change that clearly helped.'
    ],
    [
      'People ask for help early here and nobody judges it.',
      'Asking for help early is normal and isn’t judged.'
    ],
    [
      'Clear goals this quarter, and we all know who owns what.',
      'Goals are clear this quarter and everyone knows who owns what.'
    ],
    [
      'Shipping the settlement export felt great. Customers noticed within a day.',
      'Shipping the settlement export was rewarding, and customers noticed quickly.'
    ],
    [
      'I trust this team to catch my mistakes before they ship.',
      'There is trust that teammates will catch mistakes before they ship.'
    ]
  ]
}
const toHealthSummary = (categoryName: string, sentimentScore: number) => {
  if (sentimentScore <= -0.5) {
    return `${categoryName} is a concern. People point to work stalling at handoffs and to interrupt requests that push planned work out, and several say nothing changed since the last check.`
  }
  if (sentimentScore < 0) {
    return `${categoryName} is mixed and leaning negative. Some people describe progress, but uneven follow-through on action items keeps coming up.`
  }
  if (sentimentScore < 0.5) {
    return `${categoryName} is steady. Most comments are neutral, with a few asks for clearer priorities past the next month.`
  }
  if (sentimentScore < 0.8) {
    return `${categoryName} looks healthy. People describe clear ownership and quick help when something blocks them.`
  }
  return `${categoryName} is a real strength. People credit habits like asking for help early and reviewing each other’s work, and say it keeps getting better.`
}

const MEETING_NAMES: Record<MeetingType, string> = {
  retrospective: 'Retro',
  action: 'Check-in',
  teamPrompt: 'Standup',
  poker: 'Sprint Poker',
  teamHealth: 'Team Health'
}
const TEMPLATE_CHOICES: Record<MeetingType, string[]> = {
  retrospective: [
    'startStopContinueTemplate',
    'fourLsTemplate',
    'workingStuckTemplate',
    'sailboatTemplate'
  ],
  action: ['action'],
  teamPrompt: ['teamPrompt'],
  poker: ['estimatedEffortTemplate'],
  teamHealth: ['googleProjectAristotleTemplate', 'atlassianTeamHealthMonitorTemplate']
}

// mulberry32 with a fixed seed, so every Copper looks the same
const makeRandom = (seed: number) => {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}
const random = makeRandom(20261021)
// Team Health comments and summaries draw from their own stream, so adding them left the rest of Copper as it was
const healthRandom = makeRandom(20261022)
const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1))
const chance = (probability: number) => random() < probability
const pick = <T,>(items: readonly T[]) => items[Math.floor(random() * items.length)]!
const daysAgo = (days: number) => new Date(NOW - days * DAY)
const minutesAfter = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60 * 1000)

const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const toId = () => Array.from(crypto.randomBytes(10), (byte) => ID_CHARS[byte % 62]).join('')

const toTaskContent = (text: string) =>
  JSON.stringify({type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text}]}]})

const insertRows = async (client: Client, table: string, rows: Row[]) => {
  const columns = Object.keys(rows[0] ?? {})
  for (let start = 0; start < rows.length; start += 500) {
    const chunk = rows.slice(start, start + 500)
    const tuples = chunk.map(
      (_, rowIdx) =>
        `(${columns.map((_, colIdx) => `$${rowIdx * columns.length + colIdx + 1}`).join(', ')})`
    )
    await client.query(
      `INSERT INTO "${table}" (${columns.map((column) => `"${column}"`).join(', ')}) VALUES ${tuples.join(', ')}`,
      chunk.flatMap((row) => columns.map((column) => row[column]))
    )
  }
}

// the public templates, prompts, Team Health questions and integrations this database has
const readCatalog = async (client: Client) => {
  const templateIds = Object.values(TEMPLATE_CHOICES).flat()
  const {rows: templates} = await client.query<{id: string}>(
    'SELECT id FROM "MeetingTemplate" WHERE id = ANY($1)',
    [templateIds]
  )
  const {rows: prompts} = await client.query<{id: string; templateId: string}>(
    'SELECT id, "templateId" FROM "TemplatePrompt" WHERE "templateId" = ANY($1) AND "removedAt" IS NULL',
    [TEMPLATE_CHOICES.retrospective]
  )
  const {rows: questions} = await client.query<{id: number; categoryId: number; name: string}>(
    `SELECT min(q.id) AS id, q."categoryId", c.name FROM "TeamHealthQuestion" q
    JOIN "TeamHealthCategory" c ON c.id = q."categoryId"
    GROUP BY q."categoryId", c.name ORDER BY q."categoryId"`
  )
  const {rows: providers} = await client.query<{id: number; service: string}>(
    `SELECT DISTINCT ON (service) id, service FROM "IntegrationProvider"
    WHERE scope = 'global' AND "isActive" ORDER BY service, id`
  )
  const foundTemplateIds = new Set(templates.map(({id}) => id))
  const promptIdsByTemplateId = new Map<string, string[]>()
  prompts.forEach(({id, templateId}) => {
    promptIdsByTemplateId.set(templateId, [...(promptIdsByTemplateId.get(templateId) ?? []), id])
  })
  const templatesOf = (type: MeetingType) =>
    TEMPLATE_CHOICES[type].filter(
      (id) =>
        foundTemplateIds.has(id) && (type !== 'retrospective' || promptIdsByTemplateId.has(id))
    )
  return {
    templatesOf,
    promptIdsByTemplateId,
    questionIds: questions.map(({id}) => id),
    healthCategories: questions.map(({categoryId, name}) => ({id: categoryId, name})),
    providerIdByService: new Map(providers.map(({id, service}) => [service, id]))
  }
}

const seedCopper = async (client: Client, viewerId: string, tier: 'starter' | 'team') => {
  const catalog = await readCatalog(client)
  const orgId = toId()
  const people = PEOPLE.map((name) => {
    const [first = '', last = ''] = name.toLowerCase().split(' ')
    return {id: `local|${toId()}`, name, email: `${first}.${last}+${orgId}@example.com`}
  })
  const teams = TEAMS.map((team) => ({...team, id: toId()}))
  const teamIdByName = new Map(teams.map(({name, id}) => [name, id]))
  const rows: Record<string, Row[]> = {}
  const add = (table: string, row: Row) => {
    ;(rows[table] ??= []).push(row)
  }

  // when each person joined and left each team. A team's first 2 people never leave
  const membershipsByTeamId = new Map<string, Membership[]>()
  const orgJoinedDaysAgo = new Map<string, number>([[viewerId, 400]])
  teams.forEach((team) => {
    const memberships = team.members.map((personIdx, rank): Membership => {
      const isFounder = rank < 2
      const joinedDaysAgo =
        isFounder || chance(0.8)
          ? team.firstMetDaysAgo + between(5, 30)
          : between(30, team.firstMetDaysAgo)
      const leftDaysAgo =
        !isFounder && joinedDaysAgo > 60 && chance(0.12) ? between(20, joinedDaysAgo - 30) : null
      const userId = people[personIdx]!.id
      orgJoinedDaysAgo.set(userId, Math.max(orgJoinedDaysAgo.get(userId) ?? 0, joinedDaysAgo + 3))
      return {userId, joinedDaysAgo, leftDaysAgo, isLead: rank === 0 && team.viewer !== 'lead'}
    })
    if (team.viewer) {
      memberships.push({
        userId: viewerId,
        joinedDaysAgo: team.firstMetDaysAgo + 10,
        leftDaysAgo: null,
        isLead: team.viewer === 'lead'
      })
    }
    membershipsByTeamId.set(team.id, memberships)
  })
  const membersAt = (teamId: string, dayAgo: number) =>
    (membershipsByTeamId.get(teamId) ?? [])
      .filter(
        ({joinedDaysAgo, leftDaysAgo}) => joinedDaysAgo > dayAgo && (leftDaysAgo ?? -1) < dayAgo
      )
      .map(({userId}) => userId)

  add('Organization', {
    id: orgId,
    name: 'Copper',
    tier,
    useAI: true,
    createdAt: daysAgo(405)
  })
  add('FeatureFlagOwner', {featureName: 'Reports', orgId})
  people.forEach(({id, name, email}, personIdx) => {
    const lapse = LAPSES[personIdx]
    const isQuiet = QUIET_PEOPLE.includes(personIdx)
    const lastSeenDaysAgo =
      lapse && !lapse.returnedDaysAgo
        ? lapse.lapsedDaysAgo + between(0, 5)
        : isQuiet
          ? between(31, 60)
          : random() * 8
    const joinedDaysAgo = orgJoinedDaysAgo.get(id) ?? 400
    add('User', {
      id,
      email,
      preferredName: name,
      picture: '',
      createdAt: daysAgo(joinedDaysAgo),
      lastSeenAt: daysAgo(lastSeenDaysAgo)
    })
    add('OrganizationUser', {
      id: toId(),
      orgId,
      userId: id,
      role: null,
      joinedAt: daysAgo(joinedDaysAgo)
    })
    const events: [string, number][] = [['added', joinedDaysAgo]]
    if (lapse) events.push(['inactivated', lapse.lapsedDaysAgo])
    if (lapse?.returnedDaysAgo) events.push(['activated', lapse.returnedDaysAgo])
    events.forEach(([eventType, eventDaysAgo]) => {
      add('OrganizationUserAudit', {orgId, userId: id, eventType, eventDate: daysAgo(eventDaysAgo)})
    })
  })
  add('OrganizationUser', {
    id: toId(),
    orgId,
    userId: viewerId,
    role: 'BILLING_LEADER',
    joinedAt: daysAgo(400)
  })
  add('OrganizationUserAudit', {
    orgId,
    userId: viewerId,
    eventType: 'added',
    eventDate: daysAgo(400)
  })

  teams.forEach((team) => {
    add('Team', {
      id: team.id,
      name: team.name,
      orgId,
      createdBy: viewerId,
      createdAt: daysAgo(team.firstMetDaysAgo + 35)
    })
    membershipsByTeamId.get(team.id)?.forEach(({userId, joinedDaysAgo, leftDaysAgo, isLead}) => {
      add('TeamMember', {
        id: `${userId}::${team.id}`,
        teamId: team.id,
        userId,
        isLead,
        isNotRemoved: leftDaysAgo === null,
        createdAt: daysAgo(joinedDaysAgo),
        updatedAt: daysAgo(leftDaysAgo ?? joinedDaysAgo)
      })
    })
  })

  // a template only Custody Ops can pick, which reports name for its own members only
  const custodyTeamId = teamIdByName.get('Custody Ops')!
  const incidentReviewId = toId()
  add('MeetingTemplate', {
    id: incidentReviewId,
    name: 'Incident review',
    scope: 'TEAM',
    orgId,
    teamId: custodyTeamId,
    type: 'retrospective',
    illustrationUrl: '',
    mainCategory: 'retrospective'
  })
  const incidentPromptIds = [toId(), toId()]
  incidentPromptIds.forEach((id, idx) => {
    add('TemplatePrompt', {
      id,
      templateId: incidentReviewId,
      teamId: custodyTeamId,
      question: idx === 0 ? 'What happened?' : 'What will we change?',
      description: '',
      groupColor: idx === 0 ? '#E55C5C' : '#52CC52',
      sortOrder: idx === 0 ? '!' : '"'
    })
  })

  const addTask = (task: {
    teamId: string
    createdBy: string
    owner: string | null
    text: string
    createdAt: Date
    meetingId: string | null
    discussionId: string | null
    pushedTo: string | null
    isArchived: boolean
  }) => {
    const ageDays = (NOW - task.createdAt.getTime()) / DAY
    const status = task.isArchived
      ? 'active'
      : ageDays > 21
        ? chance(0.7)
          ? 'done'
          : pick(['stuck', 'active'])
        : chance(0.3)
          ? 'done'
          : pick(['active', 'active', 'future'])
    const doneAt =
      status === 'done'
        ? new Date(Math.min(task.createdAt.getTime() + between(1, 40) * DAY, NOW - DAY / 4))
        : null
    const id = toId()
    add('Task', {
      id,
      content: toTaskContent(task.text),
      plaintextContent: task.text,
      createdBy: task.createdBy,
      userId: task.owner,
      teamId: task.teamId,
      status,
      meetingId: task.meetingId,
      discussionId: task.discussionId,
      tags: task.isArchived ? ['archived'] : [],
      integration: task.pushedTo ? JSON.stringify({service: task.pushedTo}) : null,
      integrationHash: task.pushedTo ? `${task.pushedTo}:${id}` : null,
      createdAt: task.createdAt,
      updatedAt: doneAt ?? task.createdAt,
      doneAt
    })
  }

  let meetingCount = 0
  teams.forEach((team) => {
    const scoreBase = catalog.questionIds.map(() => 2.6 + random() * 1.6)
    team.meetings.forEach(([meetingType, everyDays]) => {
      const templateIds = catalog.templatesOf(meetingType)
      let meetingNumber = 0
      for (
        let day = team.firstMetDaysAgo - between(0, everyDays - 1);
        day >= team.lastMetDaysAgo;
        day -= everyDays
      ) {
        const startedDaysAgo = day + random() * 0.4
        const members = membersAt(team.id, startedDaysAgo)
        if (members.length < 2) continue
        const isLatestCheck = meetingType === 'teamHealth' && day - everyDays < team.lastMetDaysAgo
        const joinedMembers = members.filter(() => chance(meetingType === 'teamHealth' ? 0.9 : 0.8))
        const attendees = (joinedMembers.length >= 2 ? joinedMembers : members).slice(
          0,
          isLatestCheck && team.hasFewAnswersInLatestCheck ? 2 : undefined
        )
        const facilitator = attendees[0]!
        const meetingId = toId()
        const createdAt = daysAgo(startedDaysAgo)
        const templateId =
          meetingType === 'retrospective' && team.id === custodyTeamId && chance(0.4)
            ? incidentReviewId
            : templateIds.length > 0
              ? pick(templateIds)
              : null
        meetingNumber++
        meetingCount++
        const endedAt = minutesAfter(
          createdAt,
          meetingType === 'teamPrompt' ? 8 * 60 : between(30, 60)
        )
        add('NewMeeting', {
          id: meetingId,
          name: `${MEETING_NAMES[meetingType]} ${meetingNumber}`,
          teamId: team.id,
          meetingType,
          meetingCount: meetingNumber,
          meetingNumber,
          facilitatorStageId: toId(),
          facilitatorUserId: facilitator,
          createdBy: facilitator,
          phases: '[]',
          templateId,
          createdAt,
          endedAt
        })
        attendees.forEach((userId) => {
          add('MeetingMember', {
            id: `${userId}::${meetingId}`,
            meetingType,
            meetingId,
            teamId: team.id,
            userId
          })
        })
        if (meetingType === 'teamHealth') {
          const drift = ((team.firstMetDaysAgo - day) / 365) * (team.healthTrend ?? 0.6)
          const scoresByCategory = catalog.questionIds.map((): number[] => [])
          const usedCommentsByCategory = catalog.questionIds.map(() => new Set<string>())
          const isSplit = (categoryIdx: number) =>
            isLatestCheck && !!team.splitInLatestCheck?.includes(categoryIdx)
          attendees.forEach((userId) => {
            catalog.questionIds.forEach((questionId, categoryIdx) => {
              const noise = isSplit(categoryIdx) ? 4.5 : 1.6
              const rawScore = scoreBase[categoryIdx]! + drift + (random() - 0.5) * noise
              const score = Math.min(5, Math.max(1, Math.round(rawScore)))
              scoresByCategory[categoryIdx]!.push(score)
              const tone = score <= 2 ? 'low' : score >= 4 ? 'high' : 'mid'
              const usedComments = usedCommentsByCategory[categoryIdx]!
              const unusedComments = HEALTH_COMMENTS[tone].filter(
                ([text]) => !usedComments.has(text)
              )
              const comments = unusedComments.length > 0 ? unusedComments : HEALTH_COMMENTS[tone]
              const [comment, reworded] =
                healthRandom() < (isSplit(categoryIdx) ? 0.8 : tone === 'mid' ? 0.2 : 0.45)
                  ? comments[Math.floor(healthRandom() * comments.length)]!
                  : [null, null]
              if (comment) usedComments.add(comment)
              const isAnonymous = !!comment && healthRandom() < 0.5
              add('TeamHealthResponse', {
                meetingId,
                questionId,
                userId,
                score,
                comment,
                isAnonymous,
                commentParaphrased: isAnonymous ? reworded : null
              })
            })
          })
          if (attendees.length >= 3) {
            catalog.healthCategories.forEach(({id: categoryId, name}, categoryIdx) => {
              const scores = scoresByCategory[categoryIdx]!
              const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
              // a split check's summary dwells on the unhappy half
              const sentiment = isSplit(categoryIdx)
                ? -0.85 - healthRandom() * 0.15
                : (average - 3) * 0.55 + (healthRandom() - 0.5) * 0.4
              const sentimentScore = Math.round(Math.min(1, Math.max(-1, sentiment)) * 100) / 100
              const isPending =
                isLatestCheck &&
                team.hasPendingSummaryInLatestCheck &&
                categoryIdx === catalog.healthCategories.length - 1
              add('TeamHealthCategorySummary', {
                meetingId,
                categoryId,
                summary: isPending ? null : toHealthSummary(name, sentimentScore),
                sentimentScore: isPending ? null : sentimentScore,
                createdAt: isPending ? new Date() : endedAt
              })
            })
          }
        }
        if (meetingType === 'poker') {
          const storyCount = between(3, 6)
          for (let storyIdx = 0; storyIdx < storyCount; storyIdx++) {
            addTask({
              teamId: team.id,
              createdBy: facilitator,
              owner: null,
              text: `${team.name.slice(0, 4).toUpperCase()}-${between(100, 999)} ${pick(STORY_TITLES)}`,
              createdAt: minutesAfter(createdAt, 5),
              meetingId,
              discussionId: null,
              pushedTo: team.pushesTo ?? 'jira',
              isArchived: true
            })
          }
        }
        if (meetingType !== 'retrospective' && meetingType !== 'action') continue
        const topicCount = meetingType === 'retrospective' ? between(3, 5) : between(2, 3)
        for (let topicIdx = 0; topicIdx < topicCount; topicIdx++) {
          const topicId = toId()
          const discussionId = toId()
          const discussedAt = minutesAfter(createdAt, 15 + topicIdx * 8)
          if (meetingType === 'retrospective') {
            const topic = pick(RETRO_TOPICS)
            const promptIds =
              templateId === incidentReviewId
                ? incidentPromptIds
                : (catalog.promptIdsByTemplateId.get(templateId ?? '') ?? [])
            if (promptIds.length === 0) continue
            add('RetroReflectionGroup', {
              id: topicId,
              meetingId,
              promptId: pick(promptIds),
              title: chance(0.1) ? topic.toLowerCase() : topic,
              createdAt: discussedAt
            })
          } else {
            add('AgendaItem', {
              id: topicId,
              content: pick(AGENDA_TOPICS),
              sortOrder: String(topicIdx),
              teamId: team.id,
              teamMemberId: `${pick(attendees)}::${team.id}`,
              meetingId,
              isActive: false,
              isComplete: true,
              createdAt: discussedAt
            })
          }
          add('Discussion', {
            id: discussionId,
            teamId: team.id,
            meetingId,
            discussionTopicId: topicId,
            discussionTopicType: meetingType === 'retrospective' ? 'reflectionGroup' : 'agendaItem',
            createdAt: discussedAt
          })
          const taskCount = pick([0, 1, 1, 2])
          for (let taskIdx = 0; taskIdx < taskCount; taskIdx++) {
            addTask({
              teamId: team.id,
              createdBy: pick(attendees),
              owner: chance(0.9) ? pick(attendees) : null,
              text: `${pick(TASK_STARTS)} ${pick(RETRO_TOPICS).toLowerCase()}`,
              createdAt: minutesAfter(discussedAt, 5),
              meetingId,
              discussionId,
              pushedTo: team.pushesTo && chance(0.35) ? team.pushesTo : null,
              isArchived: false
            })
          }
        }
      }
    })
    // tasks people added on the team's board between meetings
    for (let day = team.firstMetDaysAgo; day > team.lastMetDaysAgo; day -= between(5, 20)) {
      const members = membersAt(team.id, day)
      if (members.length === 0) continue
      const owner = pick(members)
      addTask({
        teamId: team.id,
        createdBy: owner,
        owner,
        text: `${pick(TASK_STARTS)} ${pick(STORY_TITLES).toLowerCase()}`,
        createdAt: daysAgo(day),
        meetingId: null,
        discussionId: null,
        pushedTo: null,
        isArchived: false
      })
    }
  })

  INTEGRATIONS.forEach(([teamName, personIdx, service, connectedDaysAgo, disconnectedDaysAgo]) => {
    const providerId = catalog.providerIdByService.get(service)
    if (!providerId) return
    add('TeamMemberIntegrationAuth', {
      teamId: teamIdByName.get(teamName)!,
      userId: people[personIdx]!.id,
      providerId,
      service,
      isActive: disconnectedDaysAgo === null,
      createdAt: daysAgo(connectedDaysAgo),
      updatedAt: daysAgo(disconnectedDaysAgo ?? connectedDaysAgo)
    })
  })
  SLACK_CONNECTIONS.forEach(([teamName, personIdx, connectedDaysAgo]) => {
    const person = people[personIdx]!
    add('SlackAuth', {
      id: toId(),
      teamId: teamIdByName.get(teamName)!,
      userId: person.id,
      botUserId: `B${toId()}`,
      defaultTeamChannelId: `C${toId()}`,
      slackTeamId: `T${orgId}`,
      slackTeamName: 'Copper',
      slackUserId: `U${toId()}`,
      slackUserName: person.name,
      createdAt: daysAgo(connectedDaysAgo)
    })
  })

  const tables = [
    'Organization',
    'FeatureFlagOwner',
    'User',
    'OrganizationUser',
    'OrganizationUserAudit',
    'Team',
    'TeamMember',
    'MeetingTemplate',
    'TemplatePrompt',
    'NewMeeting',
    'MeetingMember',
    'TeamHealthResponse',
    'TeamHealthCategorySummary',
    'RetroReflectionGroup',
    'AgendaItem',
    'Discussion',
    'Task',
    'TeamMemberIntegrationAuth',
    'SlackAuth'
  ]
  for (const table of tables) {
    if (rows[table]) await insertRows(client, table, rows[table])
  }

  for (const [levelIdx, [levelName, valueNames]] of LEVELS.entries()) {
    const {rows: levelRows} = await client.query<{id: number}>(
      'INSERT INTO "TeamStructureLevel" ("orgId", name, "sortOrder") VALUES ($1, $2, $3) RETURNING id',
      [orgId, levelName, levelIdx]
    )
    const levelId = levelRows[0]!.id
    const valueIdByName = new Map<string, number>()
    for (const [valueIdx, valueName] of valueNames.entries()) {
      const {rows: valueRows} = await client.query<{id: number}>(
        'INSERT INTO "TeamStructureValue" ("levelId", name, "sortOrder") VALUES ($1, $2, $3) RETURNING id',
        [levelId, valueName, valueIdx]
      )
      valueIdByName.set(valueName, valueRows[0]!.id)
    }
    const placements = teams.flatMap(({id, places}) => {
      const valueId = valueIdByName.get(places[levelIdx] ?? '')
      return valueId ? [{teamId: id, levelId, valueId}] : []
    })
    await insertRows(client, 'TeamStructurePlacement', placements)
  }
  return {
    orgId,
    teamCount: teams.length,
    meetingCount,
    taskCount: rows.Task?.length ?? 0
  }
}

const devSeed = async () => {
  const email = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
  if (!email) {
    console.error('Usage: pnpm dev:seed <email> [--starter]')
    process.exit(1)
  }
  const stack = readStack()
  if (!stack) {
    console.error('The dev stack is not running. Start it with `pnpm dev`')
    process.exit(1)
  }
  if (stack.database) process.env.POSTGRES_DB = stack.database
  require('./webpack/utils/dotenv.js')
  const client = await connectToPostgres()
  try {
    const viewer = await ensureDevUser(stack, client, email)
    await client.query('BEGIN')
    const tier = process.argv.includes('--starter') ? 'starter' : 'team'
    const {orgId, teamCount, meetingCount, taskCount} = await seedCopper(client, viewer.id, tier)
    await client.query('COMMIT')
    console.log(
      `Seeded Copper with ${teamCount} teams, ${meetingCount} meetings and ${taskCount} tasks. ${email} is its billing leader: ${stack.url}/reports/${orgId}`
    )
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}

devSeed().catch((error: Error) => {
  console.error(error.message)
  process.exit(1)
})
