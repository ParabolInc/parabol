import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveNewMeeting, resolveTeam} from '../resolvers'
import makeMutationPayload from './makeMutationPayload'
import Team from './Team'
import TeamPromptMeeting from './TeamPromptMeeting'

export const EndTeamPromptSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EndTeamPromptSuccess',
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

const EndTeamPromptPayload = makeMutationPayload('EndTeamPromptPayload', EndTeamPromptSuccess)

export default EndTeamPromptPayload
