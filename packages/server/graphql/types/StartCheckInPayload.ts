import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
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
    }
  })
})

const StartCheckInPayload = makeMutationPayload('StartCheckInPayload', StartCheckInSuccess)

export default StartCheckInPayload
