import type {AddTeamHealthQuestionSuccessResolvers} from '../resolverTypes'

export type AddTeamHealthQuestionSuccessSource = {
  questionId: number
  packId: number
}

const AddTeamHealthQuestionSuccess: AddTeamHealthQuestionSuccessResolvers = {
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  pack: ({packId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestionPacks').loadNonNull(packId)
  }
}

export default AddTeamHealthQuestionSuccess
