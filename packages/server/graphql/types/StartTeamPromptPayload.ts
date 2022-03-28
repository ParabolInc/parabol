import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNewMeeting, resolveTeam} from '../resolvers'
import makeMutationPayload from './makeMutationPayload'
import Team from './Team'
import TeamPromptMeeting from './TeamPromptMeeting'

export const StartTeamPromptSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'StartTeamPromptSuccess',
  fields: () => ({
    meeting: {
      type: new GraphQLNonNull(TeamPromptMeeting),
      resolve: resolveNewMeeting
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: resolveTeam
    }
  })
})

const StartTeamPromptPayload = makeMutationPayload('StartTeamPromptPayload', StartTeamPromptSuccess)

export default StartTeamPromptPayload
