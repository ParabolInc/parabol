import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNewMeeting, resolveTeam} from '../resolvers'
import NewMeeting from './NewMeeting'
import StandardMutationError from './StandardMutationError'
import Team from './Team'

const StartNewMeetingPayload = new GraphQLObjectType<any, GQLContext>({
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
