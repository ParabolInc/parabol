import {GraphQLObjectType} from 'graphql'
import {resolveMeetingMember, resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import MeetingMember from 'server/graphql/types/MeetingMember'
import NewMeeting from 'server/graphql/types/NewMeeting'

const NewMeetingCheckInPayload = new GraphQLObjectType({
  name: 'NewMeetingCheckInPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meetingMember: {
      type: MeetingMember,
      resolve: resolveMeetingMember
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    }
  })
})

export default NewMeetingCheckInPayload
