import {GraphQLID, GraphQLList, GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import NewMeeting from './NewMeeting'
import {GQLContext} from '../graphql'

const PayLaterPayload = new GraphQLObjectType({
  name: 'PayLaterPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meetingIds: {
      type: GraphQLList(GraphQLID),
      description: 'the ids of the meetings that were showing conversion modals'
    },
    meetings: {
      type: NewMeeting,
      description: 'the meetings that were showing conversion modals',
      resolve: ({meetingIds}, _args, {dataLoader}: GQLContext) => {
        return dataLoader.get('newMeetings').loadMany(meetingIds)
      }
    }
  })
})

export default PayLaterPayload
