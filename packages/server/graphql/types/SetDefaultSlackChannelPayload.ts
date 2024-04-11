import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import TeamMember from './TeamMember'
import makeMutationPayload from './makeMutationPayload'

export const SetDefaultSlackChannelSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'SetDefaultSlackChannelSuccess',
  fields: () => ({
    slackChannelId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the slack channel that is now the default slack channel'
    },
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member with the updated slack channel',
      resolve: ({teamId, userId}, _args: unknown, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    }
  })
})

const SetDefaultSlackChannelPayload = makeMutationPayload(
  'SetDefaultSlackChannelPayload',
  SetDefaultSlackChannelSuccess
)

export default SetDefaultSlackChannelPayload
