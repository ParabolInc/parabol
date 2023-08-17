import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
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
    },
    hasGcalError: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        'True if there was an error creating the Google Calendar event. False if there was no error or no gcalInput was provided.',
      resolve: ({hasGcalError}) => hasGcalError
    }
  })
})

const StartRetrospectivePayload = makeMutationPayload(
  'StartRetrospectivePayload',
  StartRetrospectiveSuccess
)

export default StartRetrospectivePayload
