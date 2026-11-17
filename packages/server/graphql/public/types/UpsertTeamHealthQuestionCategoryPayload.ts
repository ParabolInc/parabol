import type {UpsertTeamHealthQuestionCategoryPayloadResolvers} from '../resolverTypes'

export type UpsertTeamHealthQuestionCategoryPayloadSource = {
  questionId: number
  categoryId: number
}

const UpsertTeamHealthQuestionCategoryPayload: UpsertTeamHealthQuestionCategoryPayloadResolvers = {
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  category: ({categoryId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthCategories').loadNonNull(categoryId)
  }
}

export default UpsertTeamHealthQuestionCategoryPayload
