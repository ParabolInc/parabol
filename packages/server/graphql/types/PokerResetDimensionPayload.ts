import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import resolveStage from '../resolvers/resolveStage'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'

export const PokerResetDimensionSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerResetDimensionSuccess',
  fields: () => ({
    stage: {
      type: new GraphQLNonNull(EstimateStage),
      description: 'The stage that holds the updated isVoting step',
      resolve: resolveStage('ESTIMATE')
    }
  })
})

const PokerResetDimensionPayload = makeMutationPayload(
  'PokerResetDimensionPayload',
  PokerResetDimensionSuccess
)

export default PokerResetDimensionPayload
