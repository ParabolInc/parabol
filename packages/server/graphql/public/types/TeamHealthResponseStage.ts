import type TeamHealthResponseStageDB from '../../../database/types/TeamHealthResponseStage'
import {getUserId} from '../../../utils/authorization'
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
  viewerResponse: async ({meetingId, questionId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
    return (
      responses.find(
        (response) => response.userId === viewerId && response.questionId === questionId
      ) ?? null
    )
  },
  isAsync: () => true
}

export default TeamHealthResponseStage
