import type TeamHealthResponseStageDB from '../../../database/types/TeamHealthResponseStage'
import type {TeamHealthResponseStageResolvers} from '../resolverTypes'

export type TeamHealthResponseStageSource = TeamHealthResponseStageDB & {
  meetingId: string
  teamId: string
}

const TeamHealthResponseStage: TeamHealthResponseStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'TEAM_HEALTH_RESPONSE',
  // the phases JSON snapshots the raw question id
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  isAsync: () => true
}

export default TeamHealthResponseStage
