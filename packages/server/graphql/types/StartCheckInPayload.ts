import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import ActionMeeting from './ActionMeeting'
import makeMutationPayload from './makeMutationPayload'
import Team from './Team'

export const StartCheckInSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'StartCheckInSuccess',
  fields: () => ({
    meeting: {
      type: new GraphQLNonNull(ActionMeeting),
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
        'True if there was an error creating the Google Calendar event. False if there was no error or no gcalInput was provided.'
    }
  })
})

const StartCheckInPayload = makeMutationPayload('StartCheckInPayload', StartCheckInSuccess)

export default StartCheckInPayload
