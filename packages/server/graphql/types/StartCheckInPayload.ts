import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting, resolveTeam} from '../resolvers'
import Team from './Team'
import NewMeeting from './NewMeeting'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const StartCheckInSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'StartCheckInSuccess',
  fields: () => ({
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

const StartCheckInPayload = makeMutationPayload('StartCheckInPayload', StartCheckInSuccess)

export default StartCheckInPayload
