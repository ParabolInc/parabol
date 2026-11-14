import type TeamHealthResponsePhaseDB from '../../../database/types/TeamHealthResponsePhase'
import type {TeamHealthResponsePhaseResolvers} from '../resolverTypes'

export type TeamHealthResponsePhaseSource = TeamHealthResponsePhaseDB & {
  meetingId: string
  teamId: string
}

const TeamHealthResponsePhase: TeamHealthResponsePhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH_RESPONSE'
}

export default TeamHealthResponsePhase
