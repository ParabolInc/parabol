import {CipherId} from '../../../utils/CipherId'
import type {EditTeamHealthQuestionSuccessResolvers} from '../resolverTypes'

export type EditTeamHealthQuestionSuccessSource = {
  questionId: number
  replacedQuestionId: number | null
}

const EditTeamHealthQuestionSuccess: EditTeamHealthQuestionSuccessResolvers = {
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  replacedQuestionId: ({replacedQuestionId}) =>
    replacedQuestionId ? CipherId.toClient(replacedQuestionId, 'teamHealthQuestion') : null
}

export default EditTeamHealthQuestionSuccess
