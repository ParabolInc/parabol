import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import IntegrationProviderWebhook from './IntegrationProviderWebhook'
import IntegrationToken, {integrationTokenFields} from './IntegrationToken'

const IntegrationTokenWebhook = new GraphQLObjectType<any, GQLContext>({
  name: 'IntegrationTokenWebhook',
  description: 'An integration token that connects via Webhook',
  interfaces: () => [IntegrationToken],
  // negating the duck typing of OAuth2 feels bad, man
  // make sure if we add another provider type we add that here, too
  isTypeOf: ({accessToken, refreshToken, scopes}) => !accessToken || !refreshToken || !scopes,
  fields: () => ({
    ...integrationTokenFields(),
    provider: {
      description: 'The provider strategy this token connects to',
      type: new GraphQLNonNull(IntegrationProviderWebhook),
      resolve: async ({providerId}, _args, {dataLoader}) => {
        return dataLoader.get('integrationProviders').load(providerId)
      }
    }
  })
})

export default IntegrationTokenWebhook
