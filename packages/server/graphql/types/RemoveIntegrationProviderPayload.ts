import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import TeamMember from './TeamMember'
import User from './User'

export const RemoveIntegrationProviderSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveIntegrationProviderSuccess',
  fields: () => ({
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member with the updated auth',
      resolve: ({teamId, userId}, _args, {dataLoader}) => {
        const teamMemberId = toTeamMemberId(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: new GraphQLNonNull(User),
      description: 'The user who updated TeamMemberIntegrationAuth object',
      resolve: async ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const RemoveIntegrationProviderPayload = makeMutationPayload(
  'RemoveIntegrationProviderPayload',
  RemoveIntegrationProviderSuccess
)

export default RemoveIntegrationProviderPayload
