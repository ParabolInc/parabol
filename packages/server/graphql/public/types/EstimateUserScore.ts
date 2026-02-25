import EstimateUserScoreId from '../../../../client/shared/gqlIds/EstimateUserScoreId'
import type {EstimateUserScoreResolvers} from '../resolverTypes'

export type EstimateUserScoreSource = {
  stageId: string
  userId: string
  label: string
}

const EstimateUserScore: EstimateUserScoreResolvers = {
  id: ({stageId, userId}) => {
    return EstimateUserScoreId.join(stageId, userId)
  },

  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default EstimateUserScore
