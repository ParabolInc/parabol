import type {NewMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import getPhase from '../../../utils/getPhase'

// the retro's Team Health stage, when it shows the team's check. An older retro ran a one-question
// pulse there instead, which has labels to vote on
const getRetroTeamHealthStage = (phases: NewMeetingPhase[]) => {
  const stage = getPhase(phases, 'TEAM_HEALTH')?.stages[0]
  return stage && stage.labels.length === 0 ? stage : undefined
}

export default getRetroTeamHealthStage
