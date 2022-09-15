import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import resolveStage from '../resolvers/resolveStage'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'
export const VoteForPokerStorySuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'VoteForPokerStorySuccess',
  fields: () => ({
    stage: {
      type: new GraphQLNonNull(EstimateStage),
      description: 'The stage that holds the updated scores',
      resolve: resolveStage('ESTIMATE')
    }
  })
})

const VoteForPokerStoryPayload = makeMutationPayload(
  'VoteForPokerStoryPayload',
  VoteForPokerStorySuccess
)

export default VoteForPokerStoryPayload
