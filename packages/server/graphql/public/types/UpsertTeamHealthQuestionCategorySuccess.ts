import type {UpsertTeamHealthQuestionCategorySuccessResolvers} from '../resolverTypes'

export type UpsertTeamHealthQuestionCategorySuccessSource = {
  questionId: number
  categoryId: number
}

const UpsertTeamHealthQuestionCategorySuccess: UpsertTeamHealthQuestionCategorySuccessResolvers = {
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  category: ({categoryId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthCategories').loadNonNull(categoryId)
  }
}

export default UpsertTeamHealthQuestionCategorySuccess
