import {resolveGQLStagesFromPhase} from '../../resolvers'
import {TeamHealthPhaseResolvers} from '../resolverTypes'
import TeamHealthPhaseDB from '../../../database/types/TeamHealthPhase'
import {TeamHealthStageSource} from './TeamHealthStage'

export type TeamHealthPhaseSource = TeamHealthPhaseDB & {
  meetingId: string
  teamId: string
}

const TeamHealthPhase: TeamHealthPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH',
  stages: ({meetingId, phaseType, stages, teamId}) => {
    return resolveGQLStagesFromPhase({
      meetingId,
      phaseType,
      stages,
      teamId
    }) as unknown as TeamHealthStageSource[]
  }
}

export default TeamHealthPhase
