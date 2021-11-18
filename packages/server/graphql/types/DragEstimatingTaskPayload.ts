import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import resolveStage from '../resolvers/resolveStage'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'
import PokerMeeting from './PokerMeeting'

export const DragEstimatingTaskSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'DragEstimatingTaskSuccess',
  fields: () => ({
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meeting: {
      type: new GraphQLNonNull(PokerMeeting),
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    stageId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    stage: {
      type: new GraphQLNonNull(EstimateStage),
      resolve: resolveStage('ESTIMATE')
    }
  })
})

const DragEstimatingTaskPayload = makeMutationPayload(
  'DragEstimatingTaskPayload',
  DragEstimatingTaskSuccess
)

export default DragEstimatingTaskPayload
