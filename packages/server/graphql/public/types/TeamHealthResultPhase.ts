import type {TeamHealthResultPhase as TeamHealthResultPhaseDB} from '../../../postgres/types/NewMeetingPhase'
import type {TeamHealthResultPhaseResolvers} from '../resolverTypes'

export type TeamHealthResultPhaseSource = TeamHealthResultPhaseDB & {
  meetingId: string
  teamId: string
}

const TeamHealthResultPhase: TeamHealthResultPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH_RESULT'
}

export default TeamHealthResultPhase
