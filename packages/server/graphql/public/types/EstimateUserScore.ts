import EstimateUserScoreId from '../../../../client/shared/gqlIds/EstimateUserScoreId'
import {EstimateUserScoreResolvers} from '../resolverTypes'

const EstimateUserScore: EstimateUserScoreResolvers = {
  id: ({stageId, userId}) => {
    return EstimateUserScoreId.join(stageId, userId)
  },

  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default EstimateUserScore
