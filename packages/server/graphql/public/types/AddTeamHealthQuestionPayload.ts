import type {AddTeamHealthQuestionPayloadResolvers} from '../resolverTypes'

export type AddTeamHealthQuestionPayloadSource = {
  questionId: number
  packId: number
}

const AddTeamHealthQuestionPayload: AddTeamHealthQuestionPayloadResolvers = {
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  pack: ({packId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestionPacks').loadNonNull(packId)
  }
}

export default AddTeamHealthQuestionPayload
