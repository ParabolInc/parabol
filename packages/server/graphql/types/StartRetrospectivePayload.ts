import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import Team from './Team'

export const StartRetrospectiveSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'StartRetrospectiveSuccess',
  fields: () => ({
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      resolve: ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    }
  })
})

const StartRetrospectivePayload = makeMutationPayload(
  'StartRetrospectivePayload',
  StartRetrospectiveSuccess
)

export default StartRetrospectivePayload
