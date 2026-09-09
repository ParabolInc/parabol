import type {Kysely} from 'kysely'

const SEED_DATE = new Date('2026-09-04T00:00:00.000Z')
const CANONICAL_TEMPLATE_ID = 'teamPrompt'
const ENTERPRISE_TEMPLATE_ID = 'enterpriseDailyStandupTemplate'
const DEMO_DAY_TEMPLATE_ID = 'demoDayTemplate'
const WEEKLY_WINS_TEMPLATE_ID = 'weeklyWinsAndPrioritiesTemplate'
const JADE_400 = '#66BC8C'
const SKY_500 = '#329AE5'
const TOMATO_500 = '#FD6157'

const TEMPLATES = [
  {id: ENTERPRISE_TEMPLATE_ID, name: 'Enterprise Daily Standup'},
  {id: DEMO_DAY_TEMPLATE_ID, name: 'Demo Day'},
  {id: WEEKLY_WINS_TEMPLATE_ID, name: 'Weekly Wins & Priorities'}
]

const PROMPTS = [
  {
    id: 'teamPromptTemplate:workingOnPrompt',
    templateId: CANONICAL_TEMPLATE_ID,
    question: 'What are you working on today? Stuck on anything?',
    description: '',
    groupColor: JADE_400,
    sortOrder: '"'
  },
  {
    id: 'enterpriseDailyStandupTemplate:workingOnPrompt',
    templateId: ENTERPRISE_TEMPLATE_ID,
    question: 'What are you working on? What has been completed recently?',
    description: 'In progress now, plus wins and shipped work',
    groupColor: JADE_400,
    sortOrder: '"'
  },
  {
    id: 'enterpriseDailyStandupTemplate:stuckPrompt',
    templateId: ENTERPRISE_TEMPLATE_ID,
    question: "What are you stuck on, what's holding you back?",
    description: 'Blockers, reviews you are waiting on, help needed',
    groupColor: TOMATO_500,
    sortOrder: '#'
  },
  {
    id: 'enterpriseDailyStandupTemplate:nextPrompt',
    templateId: ENTERPRISE_TEMPLATE_ID,
    question: 'What are you planning to work on next?',
    description: 'Top priorities before the next standup',
    groupColor: SKY_500,
    sortOrder: '$'
  },
  {
    id: 'demoDayTemplate:shippedPrompt',
    templateId: DEMO_DAY_TEMPLATE_ID,
    question: 'What did you ship?',
    description: 'Features, fixes, or experiments that landed since the last demo',
    groupColor: JADE_400,
    sortOrder: '"'
  },
  {
    id: 'demoDayTemplate:showItOffPrompt',
    templateId: DEMO_DAY_TEMPLATE_ID,
    question: 'Show it off',
    description: 'A link, screenshot, or short recording so the team can see it',
    groupColor: SKY_500,
    sortOrder: '#'
  },
  {
    id: 'demoDayTemplate:feedbackPrompt',
    templateId: DEMO_DAY_TEMPLATE_ID,
    question: 'What feedback do you want?',
    description: 'Questions, review requests, or decisions you need from the team',
    groupColor: TOMATO_500,
    sortOrder: '$'
  },
  {
    id: 'weeklyWinsAndPrioritiesTemplate:winsPrompt',
    templateId: WEEKLY_WINS_TEMPLATE_ID,
    question: 'What were your wins this week?',
    description: 'Shipped work, milestones, or something you are proud of',
    groupColor: JADE_400,
    sortOrder: '"'
  },
  {
    id: 'weeklyWinsAndPrioritiesTemplate:learnedPrompt',
    templateId: WEEKLY_WINS_TEMPLATE_ID,
    question: 'What did you learn?',
    description: 'A surprise, a mistake worth sharing, or a new skill',
    groupColor: SKY_500,
    sortOrder: '#'
  },
  {
    id: 'weeklyWinsAndPrioritiesTemplate:prioritiesPrompt',
    templateId: WEEKLY_WINS_TEMPLATE_ID,
    question: 'What are your top priorities next week?',
    description: 'The one to three things that matter most',
    groupColor: TOMATO_500,
    sortOrder: '$'
  }
]

// Copied verbatim from packages/server/generateUID.ts so the migration has no dependency
// on app code that may change over time.
const MID = BigInt(process.env.SERVER_ID!)
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const len = BigInt(ALPHABET.length)
const EPOCH = Date.UTC(2021, 0, 1)
const MACHINE_ID_BIT_LEN = 10
const SEQ_BIT_LEN = 12
const TS_OFFSET = BigInt(MACHINE_ID_BIT_LEN + SEQ_BIT_LEN)
const MID_OFFSET = BigInt(SEQ_BIT_LEN)
const BIG_ZERO = BigInt(0)
const MAX_SEQ = 2 ** SEQ_BIT_LEN - 1

if (MID < 0 || MID > 2 ** MACHINE_ID_BIT_LEN - 1) {
  throw new Error('SERVER_ID must be between 0 and 1023')
}

let seq = 0
let lastTime = Date.now()
const generateUID = () => {
  let now = Date.now()
  if (now < lastTime) {
    now = lastTime
  }
  if (now === lastTime) {
    seq++
    if (seq > MAX_SEQ) {
      seq = 0
      now++
    }
  } else {
    seq = 0
  }
  lastTime = now
  const ts = BigInt(now - EPOCH)
  const decimalId = (ts << TS_OFFSET) | (MID << MID_OFFSET) | BigInt(seq)
  let id = ''
  let residual = decimalId
  while (true) {
    const rixit = Number(residual % len)
    id = ALPHABET.charAt(rixit) + id
    residual = residual / len
    if (residual === BIG_ZERO) {
      return id
    }
  }
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('MeetingTemplate')
    .values(
      TEMPLATES.map((template) => ({
        ...template,
        type: 'teamPrompt',
        mainCategory: 'standup',
        teamId: 'aGhostTeam',
        orgId: 'aGhostOrg',
        scope: 'PUBLIC',
        isActive: true,
        isStarter: false,
        isFree: false,
        illustrationUrl: '/assets/Organization/aGhostOrg/template/teamPrompt.png',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      }))
    )
    .onConflict((oc) => oc.doNothing())
    .execute()

  await db
    .insertInto('ReflectPrompt')
    .values(
      PROMPTS.map((prompt) => ({
        ...prompt,
        teamId: 'aGhostTeam',
        parentPromptId: null,
        removedAt: null,
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      }))
    )
    .onConflict((oc) => oc.doNothing())
    .execute()

  await db.schema
    .alterTable('User')
    .addColumn('freeCustomStandupTemplatesRemaining', 'integer', (col) =>
      col.notNull().defaultTo(2)
    )
    .execute()

  const teams = await db
    .selectFrom('Team')
    .select('Team.id')
    .where((eb) =>
      eb.not(
        eb.exists(
          eb
            .selectFrom('MeetingSettings')
            .select('MeetingSettings.id')
            .whereRef('MeetingSettings.teamId', '=', 'Team.id')
            .where('MeetingSettings.meetingType', '=', 'teamPrompt')
        )
      )
    )
    .execute()
  const CHUNK_SIZE = 1000
  for (let i = 0; i < teams.length; i += CHUNK_SIZE) {
    const chunk = teams.slice(i, i + CHUNK_SIZE)
    await db
      .insertInto('MeetingSettings')
      .values(
        chunk.map((team: {id: string}) => ({
          id: generateUID(),
          teamId: team.id,
          meetingType: 'teamPrompt',
          phaseTypes: ['RESPONSES'],
          selectedTemplateId: CANONICAL_TEMPLATE_ID
        }))
      )
      .onConflict((oc) => oc.doNothing())
      .execute()
  }
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('MeetingSettings').where('meetingType', '=', 'teamPrompt').execute()
  await db.schema.alterTable('User').dropColumn('freeCustomStandupTemplatesRemaining').execute()
  await db
    .deleteFrom('ReflectPrompt')
    .where(
      'id',
      'in',
      PROMPTS.map(({id}) => id)
    )
    .execute()
  await db
    .deleteFrom('MeetingTemplate')
    .where(
      'id',
      'in',
      TEMPLATES.map(({id}) => id)
    )
    .execute()
}
