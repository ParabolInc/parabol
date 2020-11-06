import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import EstimateStage from './EstimateStage'
import resolveStage from '../resolvers/resolveStage'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const PokerAnnounceDeckHoverSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerAnnounceDeckHoverSuccess',
  fields: () => ({
    stage: {
      type: GraphQLNonNull(EstimateStage),
      description: 'The stage that holds the updated scores',
      resolve: resolveStage(NewMeetingPhaseTypeEnum.ESTIMATE)
    }
  })
})

const PokerAnnounceDeckHoverPayload = makeMutationPayload(
  'PokerAnnounceDeckHoverPayload',
  PokerAnnounceDeckHoverSuccess
)

export default PokerAnnounceDeckHoverPayload
