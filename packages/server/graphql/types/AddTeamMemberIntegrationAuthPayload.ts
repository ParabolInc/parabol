import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {GQLContext} from '../graphql'
import IntegrationProviderServiceEnum from './IntegrationProviderServiceEnum'
import makeMutationPayload from './makeMutationPayload'
import TeamMember from './TeamMember'
import TeamMemberIntegrationAuth from './TeamMemberIntegrationAuth'
import User from './User'

export const AddTeamMemberIntegrationAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddTeamMemberIntegrationAuthSuccess',
  fields: () => ({
    integrationAuth: {
      type: new GraphQLNonNull(TeamMemberIntegrationAuth),
      description: 'The auth that was just added',
      resolve: ({service, teamId, userId}, _args, {dataLoader}) => {
        return dataLoader.get('teamMemberIntegrationAuths').load({service, teamId, userId})
      }
    },
    service: {
      type: new GraphQLNonNull(IntegrationProviderServiceEnum),
      description: 'The service this provider is associated with'
    },
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

const AddTeamMemberIntegrationAuthPayload = makeMutationPayload(
  'AddTeamMemberIntegrationAuthPayload',
  AddTeamMemberIntegrationAuthSuccess
)

export default AddTeamMemberIntegrationAuthPayload
