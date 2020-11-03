import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting, resolveTeam} from '../resolvers'
import Team from './Team'
import NewMeeting from './NewMeeting'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const StartRetrospectiveSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'StartRetrospectiveSuccess',
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

const StartRetrospectivePayload = makeMutationPayload(
  'StartRetrospectivePayload',
  StartRetrospectiveSuccess
)

export default StartRetrospectivePayload
