import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import resolveStage from '../resolvers/resolveStage'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'
import User from './User'

export const PokerAnnounceDeckHoverSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerAnnounceDeckHoverSuccess',
  fields: () => ({
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    user: {
      type: new GraphQLNonNull(User),
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    },
    isHover: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    stage: {
      type: new GraphQLNonNull(EstimateStage),
      description: 'The stage that holds the updated scores',
      resolve: resolveStage('ESTIMATE')
    }
  })
})

const PokerAnnounceDeckHoverPayload = makeMutationPayload(
  'PokerAnnounceDeckHoverPayload',
  PokerAnnounceDeckHoverSuccess
)

export default PokerAnnounceDeckHoverPayload
