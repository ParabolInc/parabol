import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import type {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import NewMeeting from './NewMeeting'

export const JoinMeetingSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'JoinMeetingSuccess',
  fields: () => ({
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meeting: {
      type: new GraphQLNonNull(NewMeeting),
      description: 'The meeting with the updated stages, if any',
      resolve: ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const JoinMeetingPayload = makeMutationPayload('JoinMeetingPayload', JoinMeetingSuccess)

export default JoinMeetingPayload
