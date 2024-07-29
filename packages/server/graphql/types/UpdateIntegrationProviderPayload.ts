import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import IntegrationProvider from './IntegrationProvider'
import User from './User'
import makeMutationPayload from './makeMutationPayload'

export const UpdateIntegrationProviderSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateIntegrationProviderSuccess',
  fields: () => ({
    provider: {
      type: new GraphQLNonNull(IntegrationProvider),
      description: 'The provider that was updated',
      resolve: async ({providerId}, _args, {dataLoader}) => {
        return dataLoader.get('integrationProviders').load(providerId)
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

const UpdateIntegrationProviderPayload = makeMutationPayload(
  'UpdateIntegrationProviderPayload',
  UpdateIntegrationProviderSuccess
)

export default UpdateIntegrationProviderPayload
