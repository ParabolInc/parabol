import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting, resolveTeam} from '../resolvers'
import Team from './Team'
import NewMeeting from './NewMeeting'
import StandardMutationError from './StandardMutationError'

const StartNewMeetingPayload = new GraphQLObjectType({
  name: 'StartNewMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    meetingId: {
      type: GraphQLID
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    }
  })
})

export default StartNewMeetingPayload
