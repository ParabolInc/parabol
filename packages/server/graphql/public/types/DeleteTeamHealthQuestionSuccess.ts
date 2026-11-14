import {CipherId} from '../../../utils/CipherId'
import type {DeleteTeamHealthQuestionSuccessResolvers} from '../resolverTypes'

export type DeleteTeamHealthQuestionSuccessSource = {
  // the raw id of the deleted question, echoed back so the client can drop it
  questionId: number
}

const DeleteTeamHealthQuestionSuccess: DeleteTeamHealthQuestionSuccessResolvers = {
  questionId: ({questionId}) => CipherId.toClient(questionId, 'teamHealthQuestion')
}

export default DeleteTeamHealthQuestionSuccess
