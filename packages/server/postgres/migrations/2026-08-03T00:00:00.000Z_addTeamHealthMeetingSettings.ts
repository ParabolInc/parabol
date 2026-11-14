import type {Kysely} from 'kysely'

// Standalone team health meetings read their phase list + selected template from a
// per-team MeetingSettings row (like retro/action/poker). New teams get one from
// createTeamAndLeader; this backfills every existing team that lacks one.
const DEFAULT_TEMPLATE_ID = 'everythingBagelTemplate'

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

// `any` is required here since migrations should be frozen in time.
export async function up(db: Kysely<any>): Promise<void> {
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
            .where('MeetingSettings.meetingType', '=', 'teamHealth')
        )
      )
    )
    .execute()
  // 5 bind params per row & pg caps a statement at 65535, so insert in chunks
  const CHUNK_SIZE = 1000
  for (let i = 0; i < teams.length; i += CHUNK_SIZE) {
    const chunk = teams.slice(i, i + CHUNK_SIZE)
    await db
      .insertInto('MeetingSettings')
      .values(
        chunk.map((team: {id: string}) => ({
          id: generateUID(),
          teamId: team.id,
          meetingType: 'teamHealth',
          phaseTypes: ['TEAM_HEALTH_RESPONSE'],
          selectedTemplateId: DEFAULT_TEMPLATE_ID
        }))
      )
      .execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('MeetingSettings').where('meetingType', '=', 'teamHealth').execute()
  // Postgres cannot drop a single enum value; remove any rows using it so a later
  // enum recreation isn't blocked.
  await db
    .deleteFrom('TimelineEvent')
    .where('type', '=', 'TEAM_HEALTH_COMPLETE' as any)
    .execute()
}
