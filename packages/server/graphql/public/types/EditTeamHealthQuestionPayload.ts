import {CipherId} from '../../../utils/CipherId'
import type {EditTeamHealthQuestionPayloadResolvers} from '../resolverTypes'

export type EditTeamHealthQuestionPayloadSource = {
  questionId: number
  replacedQuestionId: number | null
}

const EditTeamHealthQuestionPayload: EditTeamHealthQuestionPayloadResolvers = {
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  replacedQuestionId: ({replacedQuestionId}) =>
    replacedQuestionId ? CipherId.toClient(replacedQuestionId, 'teamHealthQuestion') : null
}

export default EditTeamHealthQuestionPayload
