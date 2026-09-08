import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import type {TeamHealthResultStage} from '../../../postgres/types/NewMeetingPhase'
import getPhase from '../../../utils/getPhase'
import type {DataLoaderWorker} from '../../graphql'
import getTeamHealthResultScore from './getTeamHealthResultScore'

interface RankedStage {
  stage: TeamHealthResultStage
  score: number | null
  previousScore: number | null
}

// a category the team has never scored has no trend to lean on, so it leads the discussion. One
// nobody answered this cycle has nothing to discuss, so it trails it
const groupOf = ({score, previousScore}: RankedStage) =>
  score === null ? 2 : previousScore === null ? 0 : 1

const byUrgency = (a: RankedStage, b: RankedStage) => {
  const groupDiff = groupOf(a) - groupOf(b)
  if (groupDiff !== 0) return groupDiff
  if (a.score === null || b.score === null) return 0
  if (a.previousScore !== null && b.previousScore !== null) {
    const deltaDiff = a.score - a.previousScore - (b.score - b.previousScore)
    if (deltaDiff !== 0) return deltaDiff
  }
  return a.score - b.score
}

/**
 * Orders the result stages so the discussion opens on the category that needs it most: the steepest
 * drop since the previous cycle first, then the shallowest, then the gains. Categories with no
 * previous cycle to compare against lead, lowest score first. Anyone can reorder them afterwards
 * (see dragTeamHealthResultStage)
 */
const sortTeamHealthResultStages = async (
  meeting: TeamHealthMeeting,
  dataLoader: DataLoaderWorker
) => {
  const {id: meetingId, phases} = meeting
  const resultPhase = getPhase(phases, 'TEAM_HEALTH_RESULT')
  const rankedStages = await Promise.all(
    resultPhase.stages.map(async (stage) => ({
      stage,
      ...(await getTeamHealthResultScore(meetingId, stage.questionId, dataLoader))
    }))
  )
  // sortOrder is what the client reads, and what a later drag interleaves against
  const stages = rankedStages
    .sort(byUrgency)
    .map(({stage}, sortOrder) => ({...stage, sortOrder})) as [
    TeamHealthResultStage,
    ...TeamHealthResultStage[]
  ]
  return phases.map((phase) => (phase === resultPhase ? {...resultPhase, stages} : phase))
}

export default sortTeamHealthResultStages
