import type TeamHealthPhaseDB from '../../../database/types/TeamHealthPhase'
import type {TeamHealthPhaseResolvers} from '../resolverTypes'

export type TeamHealthPhaseSource = TeamHealthPhaseDB & {
  meetingId: string
  teamId: string
}

const TeamHealthPhase: TeamHealthPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH'
}

export default TeamHealthPhase
