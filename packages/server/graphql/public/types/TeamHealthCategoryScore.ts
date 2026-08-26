import type {TeamHealthCategoryScoreResolvers} from '../resolverTypes'

const TeamHealthCategoryScore: TeamHealthCategoryScoreResolvers = {
  category: ({categoryId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthCategories').loadNonNull(categoryId)
  }
}

export default TeamHealthCategoryScore
