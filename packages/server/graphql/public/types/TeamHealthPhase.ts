import {TeamHealthPhaseResolvers} from '../resolverTypes'
import TeamHealthPhaseDB from '../../../database/types/TeamHealthPhase'

export type TeamHealthPhaseSource = TeamHealthPhaseDB & {
  meetingId: string
}

const TeamHealthPhase: TeamHealthPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH',
  stages: ({meetingId, stages}) =>
    stages.map((stage) => ({
      ...stage,
      meetingId
    }))
}

export default TeamHealthPhase
