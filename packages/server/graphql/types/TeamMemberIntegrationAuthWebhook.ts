import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import IntegrationProviderWebhook from './IntegrationProviderWebhook'
import TeamMemberIntegrationAuth, {
  teamMemberIntegrationAuthFields
} from './TeamMemberIntegrationAuth'

const TeamMemberIntegrationAuthWebhook = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamMemberIntegrationAuthWebhook',
  description: 'An integration authorization that connects via Webhook auth strategy',
  interfaces: () => [TeamMemberIntegrationAuth],
  // negating the duck typing of OAuth2 feels bad, man
  // make sure if we add another provider type we add that here, too
  isTypeOf: ({accessToken, refreshToken, scopes}) => !accessToken || !refreshToken || !scopes,
  fields: () => ({
    ...teamMemberIntegrationAuthFields(),
    provider: {
      description: 'The provider strategy this token connects to',
      type: new GraphQLNonNull(IntegrationProviderWebhook),
      resolve: async ({providerId}, _args, {dataLoader}) => {
        return dataLoader.get('integrationProviders').load(providerId)
      }
    }
  })
})

export default TeamMemberIntegrationAuthWebhook
