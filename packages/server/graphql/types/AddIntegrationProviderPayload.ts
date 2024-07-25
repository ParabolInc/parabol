import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import IntegrationProvider from './IntegrationProvider'
import Team from './Team'
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
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of the team with the updated Integration Provider'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team with the updated Integration Provider',
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    }
  })
})

const AddIntegrationProviderPayload = makeMutationPayload(
  'AddIntegrationProviderPayload',
  AddIntegrationProviderSuccess
)

export default AddIntegrationProviderPayload
