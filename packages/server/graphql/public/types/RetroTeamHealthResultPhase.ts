import type {TeamHealthCheckResultPhase as TeamHealthCheckResultPhaseDB} from '../../../postgres/types/NewMeetingPhase'
import type {RetroTeamHealthResultPhaseResolvers} from '../resolverTypes'

export type RetroTeamHealthResultPhaseSource = TeamHealthCheckResultPhaseDB & {
  meetingId: string
  teamId: string
}

const RetroTeamHealthResultPhase: RetroTeamHealthResultPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK_RESULT'
}

export default RetroTeamHealthResultPhase
