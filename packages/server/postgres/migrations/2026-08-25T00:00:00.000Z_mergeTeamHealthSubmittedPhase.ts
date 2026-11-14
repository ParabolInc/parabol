import type {Kysely} from 'kysely'

// The TEAM_HEALTH_SUBMITTED phase ("you're all set") and TEAM_HEALTH_RESULT phase (the reveal)
// were the same destination in two states, so they merged into TEAM_HEALTH_RESULT, which now
// renders the waiting room until endedAt is set. In-flight meetings need the submitted phase
// spliced out, the result stage unlocked, and any facilitator parked on the removed stage moved.

interface Stage {
  id: string
  phaseType: string
  isNavigable: boolean
  isNavigableByFacilitator: boolean
  isComplete: boolean
  viewCount: number
  readyToAdvance?: string[]
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
  endedAt: Date | null
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
    .select(['id', 'phases', 'facilitatorStageId', 'endedAt'])
    .where('meetingType', '=', 'teamHealth')
    .execute()) as Meeting[]

export async function up(db: Kysely<any>): Promise<void> {
  const meetings = await getTeamHealthMeetings(db)
  for (const meeting of meetings) {
    const {id, phases, facilitatorStageId} = meeting
    const submittedPhase = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_SUBMITTED')
    const resultPhase = phases.find((phase) => phase.phaseType === 'TEAM_HEALTH_RESULT')
    if (!submittedPhase || !resultPhase?.stages[0]) continue
    const resultStage = resultPhase.stages[0]
    resultStage.isNavigable = true
    resultStage.isNavigableByFacilitator = true
    const nextPhases = phases.filter((phase) => phase.phaseType !== 'TEAM_HEALTH_SUBMITTED')
    const isFacilitatorStranded = submittedPhase.stages.some(
      (stage) => stage.id === facilitatorStageId
    )
    await db
      .updateTable('NewMeeting')
      .set({
        phases: JSON.stringify(nextPhases),
        ...(isFacilitatorStranded && {facilitatorStageId: resultStage.id})
      })
      .where('id', '=', id)
      .execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const meetings = await getTeamHealthMeetings(db)
  for (const meeting of meetings) {
    const {id, phases, facilitatorStageId, endedAt} = meeting
    if (phases.some((phase) => phase.phaseType === 'TEAM_HEALTH_SUBMITTED')) continue
    const resultIdx = phases.findIndex((phase) => phase.phaseType === 'TEAM_HEALTH_RESULT')
    const resultStage = phases[resultIdx]?.stages[0]
    if (!resultStage) continue
    const submittedStage: Stage = {
      id: generateUID(),
      phaseType: 'TEAM_HEALTH_SUBMITTED',
      isNavigable: true,
      isNavigableByFacilitator: true,
      isComplete: false,
      viewCount: 0,
      readyToAdvance: []
    }
    const submittedPhase: Phase = {
      id: generateUID(),
      phaseType: 'TEAM_HEALTH_SUBMITTED',
      stages: [submittedStage]
    }
    // before the merge the results were locked until the meeting ended
    resultStage.isNavigable = !!endedAt
    resultStage.isNavigableByFacilitator = !!endedAt
    const nextPhases = [...phases]
    nextPhases.splice(resultIdx, 0, submittedPhase)
    await db
      .updateTable('NewMeeting')
      .set({
        phases: JSON.stringify(nextPhases),
        ...(facilitatorStageId === resultStage.id &&
          !endedAt && {facilitatorStageId: submittedStage.id})
      })
      .where('id', '=', id)
      .execute()
  }
}
