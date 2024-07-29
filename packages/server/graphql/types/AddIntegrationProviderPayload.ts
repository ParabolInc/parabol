import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import IntegrationProvider from './IntegrationProvider'
import Organization from './Organization'
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
      type: GraphQLID,
      description: 'Id of the team with the updated Integration Provider'
    },
    team: {
      type: Team,
      description: 'The team with the updated Integration Provider',
      resolve: ({teamId}, _args, {dataLoader}) => {
        if (!teamId) return null
        return dataLoader.get('teams').load(teamId)
      }
    },
    orgId: {
      type: GraphQLID,
      description: 'Id of the team with the updated Integration Provider'
    },
    organization: {
      type: Organization,
      description: 'The team with the updated Integration Provider',
      resolve: ({orgId}, _args, {dataLoader}) => {
        if (!orgId) return null
        return dataLoader.get('organizations').load(orgId)
      }
    }
  })
})

const AddIntegrationProviderPayload = makeMutationPayload(
  'AddIntegrationProviderPayload',
  AddIntegrationProviderSuccess
)

export default AddIntegrationProviderPayload
