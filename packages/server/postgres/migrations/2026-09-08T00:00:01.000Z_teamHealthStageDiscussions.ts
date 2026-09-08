import type {Kysely} from 'kysely'

// Every team health stage now hosts a discussion thread, one Discussion per question shared by that
// question's response stage and its result stage, since both are about the same category. Existing
// meetings get their threads backfilled so an in-flight meeting doesn't render an empty drawer.

interface Stage {
  id: string
  phaseType: string
  questionId?: number
  discussionId?: string
}

interface Phase {
  id: string
  phaseType: string
  stages: Stage[]
}

interface Meeting {
  id: string
  teamId: string
  phases: Phase[]
}

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
const getTeamHealthMeetings = async (db: Kysely<any>) =>
  (await db
    .selectFrom('NewMeeting')
    .select(['id', 'teamId', 'phases'])
    .where('meetingType', '=', 'teamHealth')
    .execute()) as Meeting[]

const isTeamHealthStagePhase = (phase: Phase) =>
  phase.phaseType === 'TEAM_HEALTH_RESPONSE' || phase.phaseType === 'TEAM_HEALTH_RESULT'

export async function up(db: Kysely<any>): Promise<void> {
  const meetings = await getTeamHealthMeetings(db)
  for (const meeting of meetings) {
    const {id: meetingId, teamId, phases} = meeting
    const stages = phases.filter(isTeamHealthStagePhase).flatMap((phase) => phase.stages)
    if (stages.length === 0 || stages.every((stage) => stage.discussionId)) continue
    const discussionIdByQuestionId = new Map<number, string>()
    for (const stage of stages) {
      const {questionId} = stage
      if (questionId === undefined) continue
      const discussionId = stage.discussionId ?? discussionIdByQuestionId.get(questionId)
      if (discussionId) {
        discussionIdByQuestionId.set(questionId, discussionId)
      } else {
        discussionIdByQuestionId.set(questionId, generateUID())
      }
    }
    for (const stage of stages) {
      if (stage.questionId === undefined) continue
      stage.discussionId = discussionIdByQuestionId.get(stage.questionId)
    }
    const discussions = [...discussionIdByQuestionId].map(([questionId, id]) => ({
      id,
      teamId,
      meetingId,
      discussionTopicId: String(questionId),
      discussionTopicType: 'teamHealthQuestion' as const
    }))
    if (discussions.length === 0) continue
    await db
      .insertInto('Discussion')
      .values(discussions)
      .onConflict((oc) => oc.column('id').doNothing())
      .execute()
    await db
      .updateTable('NewMeeting')
      .set({phases: JSON.stringify(phases)})
      .where('id', '=', meetingId)
      .execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('Discussion')
    .where('discussionTopicType', '=', 'teamHealthQuestion')
    .execute()
  const meetings = await getTeamHealthMeetings(db)
  for (const meeting of meetings) {
    const {id: meetingId, phases} = meeting
    const stages = phases.filter(isTeamHealthStagePhase).flatMap((phase) => phase.stages)
    if (stages.length === 0) continue
    for (const stage of stages) {
      delete stage.discussionId
    }
    await db
      .updateTable('NewMeeting')
      .set({phases: JSON.stringify(phases)})
      .where('id', '=', meetingId)
      .execute()
  }
}
