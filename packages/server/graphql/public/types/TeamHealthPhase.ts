import TeamHealthPhaseDB from '../../../database/types/TeamHealthPhase'
import {TeamHealthPhaseResolvers} from '../resolverTypes'

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
