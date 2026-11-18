import type {TeamHealthCheckPhase as TeamHealthCheckPhaseDB} from '../../../postgres/types/NewMeetingPhase'
import type {TeamHealthCheckPhaseResolvers} from '../resolverTypes'

export type TeamHealthCheckPhaseSource = TeamHealthCheckPhaseDB & {
  meetingId: string
  teamId: string
}

const TeamHealthCheckPhase: TeamHealthCheckPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH_CHECK'
}

export default TeamHealthCheckPhase
