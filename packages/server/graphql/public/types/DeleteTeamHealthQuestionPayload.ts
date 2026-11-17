import {CipherId} from '../../../utils/CipherId'
import type {DeleteTeamHealthQuestionPayloadResolvers} from '../resolverTypes'

export type DeleteTeamHealthQuestionPayloadSource = {
  // the raw id of the deleted question, echoed back so the client can drop it
  questionId: number
}

const DeleteTeamHealthQuestionPayload: DeleteTeamHealthQuestionPayloadResolvers = {
  questionId: ({questionId}) => CipherId.toClient(questionId, 'teamHealthQuestion')
}

export default DeleteTeamHealthQuestionPayload
