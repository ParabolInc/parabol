import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import NewMeeting from './NewMeeting'
import StandardMutationError from './StandardMutationError'

const PayLaterPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'PayLaterPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meetingId: {
      type: GraphQLID,
      description: 'the ids of the meetings that were showing conversion modals'
    },
    meeting: {
      type: NewMeeting,
      description: 'the meetings that were showing conversion modals',
      resolve: ({meetingId}, _args: unknown, {dataLoader}: GQLContext) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

export default PayLaterPayload
