import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import Team from './Team'
import TeamPromptMeeting from './TeamPromptMeeting'

export const StartTeamPromptSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'StartTeamPromptSuccess',
  fields: () => ({
    meeting: {
      type: new GraphQLNonNull(TeamPromptMeeting),
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

const StartTeamPromptPayload = makeMutationPayload('StartTeamPromptPayload', StartTeamPromptSuccess)

export default StartTeamPromptPayload
