import type {Kysely} from 'kysely'

const SEED_DATE = new Date('2026-09-04T00:00:00.000Z')
const CANONICAL_TEMPLATE_ID = 'teamPrompt'
const ENTERPRISE_TEMPLATE_ID = 'enterpriseDailyStandupTemplate'
const JADE_400 = '#66BC8C'
const SKY_500 = '#329AE5'
const TOMATO_500 = '#FD6157'

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
    id: 'enterpriseDailyStandupTemplate:completedPrompt',
    templateId: ENTERPRISE_TEMPLATE_ID,
    question: 'What have you completed recently?',
    description: 'Wins, shipped work, closed tasks',
    groupColor: JADE_400,
    sortOrder: '"'
  },
  {
    id: 'enterpriseDailyStandupTemplate:nextPrompt',
    templateId: ENTERPRISE_TEMPLATE_ID,
    question: "What's next for you?",
    description: 'Top priorities before the next standup',
    groupColor: SKY_500,
    sortOrder: '#'
  },
  {
    id: 'enterpriseDailyStandupTemplate:stuckPrompt',
    templateId: ENTERPRISE_TEMPLATE_ID,
    question: 'What are you stuck on?',
    description: 'Blockers, reviews you are waiting on, help needed',
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
    .values({
      id: ENTERPRISE_TEMPLATE_ID,
      name: 'Enterprise Daily Standup',
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
    })
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
  await db.deleteFrom('MeetingTemplate').where('id', '=', ENTERPRISE_TEMPLATE_ID).execute()
}
