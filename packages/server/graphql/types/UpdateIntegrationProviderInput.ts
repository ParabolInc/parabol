import {GraphQLID, GraphQLNonNull, GraphQLInputObjectType, GraphQLString} from 'graphql'
import {
  OAuth2ProviderMetadataInput,
  WebhookProviderMetadataInput
} from './AddIntegrationProviderInput'
import {
  IntegrationProviderScopesEnum,
  IntegrationProvidersEnum,
  IntegrationProviderTypesEnum
} from './IntegrationProvider'

const UpdateIntegrationProviderInput = new GraphQLInputObjectType({
  name: 'UpdateIntegrationProviderInput',
  description: 'An Integration Provider configuration',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The the id of the Integration Provider to update'
    },
    provider: {
      type: IntegrationProvidersEnum,
      description: 'The service this provider is associated with'
    },
    type: {
      type: IntegrationProviderTypesEnum,
      description: 'The kind of token used by this provider'
    },

    scope: {
      type: IntegrationProviderScopesEnum,
      description:
        'The scope this provider configuration was created at (globally, org-wide, or by the team)'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the provider, suitable for display on a user interface'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The org that the access token is attached to'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that the token is linked to'
    },
    webhookProviderMetadataInput: {
      type: WebhookProviderMetadataInput,
      description:
        'Webhook provider metadata, has to be non-null if token type is webhook, refactor once we get https://github.com/graphql/graphql-spec/pull/825'
    },
    oAuth2ProviderMetadataInput: {
      type: OAuth2ProviderMetadataInput,
      description:
        'OAuth2 provider metadata, has to be non-null if token type is OAuth2, refactor once we get https://github.com/graphql/graphql-spec/pull/825'
    }
  })
})

export default UpdateIntegrationProviderInput
