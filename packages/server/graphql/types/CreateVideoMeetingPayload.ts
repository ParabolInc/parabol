import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import NewMeeting from './NewMeeting'
import {resolveNewMeeting} from '../resolvers'

const CreateVideoMeetingSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'CreateVideoMeetingSuccess',
  fields: () => ({
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the meeting where the video meeting was added'
    },
    meeting: {
      type: new GraphQLNonNull(NewMeeting),
      description: 'The meeting where the video meeting was added',
      resolve: resolveNewMeeting
    }
  })
})

const CreateVideoMeetingPayload = makeMutationPayload('CreateVideoMeetingPayload', CreateVideoMeetingSuccess)

export default CreateVideoMeetingPayload
