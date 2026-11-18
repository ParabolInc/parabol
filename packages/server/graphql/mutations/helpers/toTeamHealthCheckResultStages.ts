import generateUID from '../../../generateUID'
import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import type {TeamHealthCheckResultStage} from '../../../postgres/types/NewMeetingPhase'
import getPhase from '../../../utils/getPhase'

const toTeamHealthCheckResultStages = (
  teamHealthMeeting: TeamHealthMeeting,
  {isNavigable, isNavigableByFacilitator}: {isNavigable: boolean; isNavigableByFacilitator: boolean}
): TeamHealthCheckResultStage[] => {
  const resultPhase = getPhase(teamHealthMeeting.phases, 'TEAM_HEALTH_RESULT')
  return [...resultPhase.stages]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((resultStage) => ({
      id: generateUID(),
      phaseType: 'TEAM_HEALTH_CHECK_RESULT',
      isComplete: false,
      isNavigable,
      isNavigableByFacilitator,
      viewCount: 0,
      readyToAdvance: [],
      teamHealthMeetingId: teamHealthMeeting.id,
      teamHealthResultStageId: resultStage.id
    }))
}

export default toTeamHealthCheckResultStages
