import type {TeamHealthCheckResultPhase as TeamHealthCheckResultPhaseDB} from '../../../postgres/types/NewMeetingPhase'
import type {TeamHealthCheckResultPhaseResolvers} from '../resolverTypes'

export type TeamHealthCheckResultPhaseSource = TeamHealthCheckResultPhaseDB & {
  meetingId: string
  teamId: string
}

const TeamHealthCheckResultPhase: TeamHealthCheckResultPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK_RESULT'
}

export default TeamHealthCheckResultPhase
