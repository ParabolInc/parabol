import type {Kysely} from 'kysely'

// The TEAM_HEALTH_RESULT phase held a single stage for the whole reveal. It now holds one stage per
// category, mirroring the response phase, so the team discusses the results a category at a time.
// The existing stage is reused for the first question so any facilitator or bookmark parked on it
// stays valid. Meetings that already ended keep their questions' order rather than being re-ranked
// by urgency, since ranking is what ending the meeting does.

interface Stage {
  id: string
  phaseType: string
  isNavigable: boolean
  isNavigableByFacilitator: boolean
  isComplete: boolean
  viewCount: number
  readyToAdvance?: string[]
  startAt?: string
  endAt?: string
  questionId?: number
  sortOrder?: number
}

interface Phase {
  id: string
  phaseType: string
  stages: Stage[]
}

interface Meeting {
  id: string
  phases: Phase[]
  facilitatorStageId: string | null
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
    .select(['id', 'phases', 'facilitatorStageId'])
    .where('meetingType', '=', 'teamHealth')
    .execute()) as Meeting[]

const updatePhases = async (
  db: Kysely<any>,
  meetingId: string,
  phases: Phase[],
  facilitatorStageId?: string
) => {
  await db
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases), ...(facilitatorStageId && {facilitatorStageId})})
    .where('id', '=', meetingId)
    .execute()
}

export async function up(db: Kysely<any>): Promise<void> {
  const meetings = await getTeamHealthMeetings(db)
  for (const meeting of meetings) {
    const {id, phases} = meeting
    const responsePhase = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESPONSE')
    const resultPhase = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESULT')
    if (!responsePhase || !resultPhase) continue
    const templateStage = resultPhase.stages[0]
    if (!templateStage) continue
    if (templateStage.questionId !== undefined) {
      // already split by an earlier run of this migration, so only the order needs backfilling
      if (resultPhase.stages.every((stage) => stage.sortOrder !== undefined)) continue
      resultPhase.stages = resultPhase.stages.map((stage, sortOrder) => ({...stage, sortOrder}))
      await updatePhases(db, id, phases)
      continue
    }
    const {startAt, endAt, ...freshStage} = templateStage
    resultPhase.stages = responsePhase.stages.map((responseStage, idx) =>
      idx === 0
        ? {...templateStage, questionId: responseStage.questionId, sortOrder: idx}
        : {
            ...freshStage,
            id: generateUID(),
            viewCount: 0,
            readyToAdvance: [],
            questionId: responseStage.questionId,
            sortOrder: idx
          }
    )
    await updatePhases(db, id, phases)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const meetings = await getTeamHealthMeetings(db)
  for (const meeting of meetings) {
    const {id, phases, facilitatorStageId} = meeting
    const resultPhase = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESULT')
    const firstStage = resultPhase?.stages[0]
    if (!resultPhase || !firstStage) continue
    const isFacilitatorStranded = resultPhase.stages
      .slice(1)
      .some((stage) => stage.id === facilitatorStageId)
    const {questionId: _questionId, sortOrder: _sortOrder, ...stage} = firstStage
    resultPhase.stages = [stage]
    await updatePhases(db, id, phases, isFacilitatorStranded ? firstStage.id : undefined)
  }
}
