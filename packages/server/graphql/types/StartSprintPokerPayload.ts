import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import PokerMeeting from './PokerMeeting'
import Team from './Team'
import makeMutationPayload from './makeMutationPayload'

export const StartSprintPokerSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'StartSprintPokerSuccess',
  fields: () => ({
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meeting: {
      type: new GraphQLNonNull(PokerMeeting),
      resolve: ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    hasGcalError: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description:
        'True if there was an error creating the Google Calendar event. False if there was no error or no gcalInput was provided.'
    }
  })
})

const StartSprintPokerPayload = makeMutationPayload(
  'StartSprintPokerPayload',
  StartSprintPokerSuccess
)

export default StartSprintPokerPayload
