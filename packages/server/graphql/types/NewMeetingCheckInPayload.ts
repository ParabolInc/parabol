import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveMeetingMember, resolveNewMeeting} from '../resolvers'
import MeetingMember from './MeetingMember'
import NewMeeting from './NewMeeting'
import StandardMutationError from './StandardMutationError'

const NewMeetingCheckInPayload = new GraphQLObjectType<any, GQLContext>({
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
