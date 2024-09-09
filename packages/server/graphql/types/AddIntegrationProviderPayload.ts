import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import IntegrationProvider from './IntegrationProvider'
import makeMutationPayload from './makeMutationPayload'

export const AddIntegrationProviderSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddIntegrationProviderSuccess',
  fields: () => ({
    provider: {
      type: new GraphQLNonNull(IntegrationProvider),
      description: 'The provider that was added',
      resolve: async ({providerId}, _args, {dataLoader}) => {
        return dataLoader.get('integrationProviders').load(providerId)
      }
    }
  })
})

const AddIntegrationProviderPayload = makeMutationPayload(
  'AddIntegrationProviderPayload',
  AddIntegrationProviderSuccess
)

export default AddIntegrationProviderPayload
