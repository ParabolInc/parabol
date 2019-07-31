import {GraphQLObjectType} from 'graphql'
import {resolveMeetingMember, resolveNewMeeting} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import MeetingMember from './MeetingMember'
import NewMeeting from './NewMeeting'

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
