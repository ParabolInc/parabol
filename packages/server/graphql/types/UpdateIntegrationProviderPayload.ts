import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import TeamMember from './TeamMember'
import User from './User'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'

export const UpdateIntegrationProviderSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateIntegrationProviderSuccess',
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
      description: 'The user who updated IntegrationToken object',
      resolve: async ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const UpdateIntegrationProviderPayload = makeMutationPayload(
  'UpdateIntegrationProviderPayload',
  UpdateIntegrationProviderSuccess
)

export default UpdateIntegrationProviderPayload
