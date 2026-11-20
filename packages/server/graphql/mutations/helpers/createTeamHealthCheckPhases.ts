import generateUID from '../../../generateUID'
import type {
  TeamHealthCheckPhase,
  TeamHealthCheckResultPhase
} from '../../../postgres/types/NewMeetingPhase'
import type {DataLoaderWorker} from '../../graphql'
import toTeamHealthCheckResultStages from './toTeamHealthCheckResultStages'

// a check revealed since the team's previous retro ended. Older results were already the previous
// retro's to talk through, so they don't come back retro after retro
const getUnseenTeamHealthResults = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const completedMeetings = await dataLoader.get('completedMeetingsByTeamId').load(teamId)
  const latestCheck = completedMeetings.find((meeting) => meeting.meetingType === 'teamHealth')
  if (!latestCheck?.endedAt) return null
  const previousRetro = completedMeetings.find((meeting) => meeting.meetingType === 'retrospective')
  if (previousRetro?.endedAt && previousRetro.endedAt >= latestCheck.endedAt) return null
  return latestCheck
}

const createTeamHealthCheckPhases = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const unseenCheck = await getUnseenTeamHealthResults(teamId, dataLoader)
  const checkPhase: TeamHealthCheckPhase = {
    id: generateUID(),
    phaseType: 'TEAM_HEALTH_CHECK',
    stages: [
      {
        id: generateUID(),
        phaseType: 'TEAM_HEALTH_CHECK',
        isComplete: false,
        isNavigable: false,
        isNavigableByFacilitator: false,
        viewCount: 0,
        readyToAdvance: []
      }
    ]
  }
  const resultPhase: TeamHealthCheckResultPhase = {
    id: generateUID(),
    phaseType: 'TEAM_HEALTH_CHECK_RESULT',
    stages: unseenCheck
      ? toTeamHealthCheckResultStages(unseenCheck, {
          isNavigable: false,
          isNavigableByFacilitator: false
        })
      : []
  }
  return [checkPhase, resultPhase]
}

export default createTeamHealthCheckPhases
