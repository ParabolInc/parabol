import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import PokerMeeting from './PokerMeeting'

export const StartSprintPokerSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'StartSprintPokerSuccess',
  fields: () => ({
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    meeting: {
      type: GraphQLNonNull(PokerMeeting),
      resolve: ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const StartSprintPokerPayload = makeMutationPayload(
  'StartSprintPokerPayload',
  StartSprintPokerSuccess
)

export default StartSprintPokerPayload
