import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMemberId from '../../../client/shared/gqlIds/TeamMemberId'
import {GQLContext} from '../graphql'
import IntegrationProvider from './IntegrationProvider'
import makeMutationPayload from './makeMutationPayload'
import TeamMember from './TeamMember'
import User from './User'

export const AddIntegrationProviderSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddIntegrationProviderSuccess',
  fields: () => ({
    provider: {
      type: new GraphQLNonNull(IntegrationProvider),
      description: 'The provider that was added',
      resolve: async ({providerId}, _args, {dataLoader}) => {
        return dataLoader.get('integrationProviders').load(providerId)
      }
    },
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member with the updated Integration Provider',
      resolve: ({teamId, userId}, _args, {dataLoader}) => {
        const teamMemberId = TeamMemberId.join(teamId, userId)
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    },
    user: {
      type: new GraphQLNonNull(User),
      description: 'The user who updated Integration Provider object',
      resolve: async ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const AddIntegrationProviderPayload = makeMutationPayload(
  'AddIntegrationProviderPayload',
  AddIntegrationProviderSuccess
)

export default AddIntegrationProviderPayload
