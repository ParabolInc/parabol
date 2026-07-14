import type {TeamHealthQuestionResolvers} from '../resolverTypes'

const TeamHealthQuestion: TeamHealthQuestionResolvers = {
  pack: ({packId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestionPacks').loadNonNull(packId)
  },
  category: ({categoryId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthCategories').loadNonNull(categoryId)
  }
}

export default TeamHealthQuestion
