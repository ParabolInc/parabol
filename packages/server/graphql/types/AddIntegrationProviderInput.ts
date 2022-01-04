import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import GraphQLURLType from './GraphQLURLType'
import {
  IntegrationProviderScopeEnum,
  IntegrationProvidersEnum,
  IntegrationProviderTypeEnum
} from './IntegrationProvider'

export const WebhookProviderMetadataInput = new GraphQLInputObjectType({
  name: 'WebhookProviderMetadataInput',
  description: 'Webhook provider metadata',
  fields: () => ({
    webhookUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'Webhook URL to be used by the provider'
    }
  })
})

export const OAuth2ProviderMetadataInput = new GraphQLInputObjectType({
  name: 'OAuth2ProviderMetadataInput',
  description: 'OAuth2 provider metadata',
  fields: () => ({
    scopes: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      description: 'A list of scope strings that should be requested from the provider'
    },
    serverBaseUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The base URL used to access the provider'
    },
    clientId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The client id to give to the provider'
    },
    clientSecret: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The client id to give to the provider'
    }
  })
})

const AddIntegrationProviderInput = new GraphQLInputObjectType({
  name: 'AddIntegrationProviderInput',
  description: 'An Integration Provider configuration',
  fields: () => ({
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that the token is linked to'
    },
    provider: {
      type: IntegrationProvidersEnum,
      description: 'The service this provider is associated with'
    },
    type: {
      type: IntegrationProviderTypeEnum,
      description: 'The kind of token used by this provider'
    },
    scope: {
      type: IntegrationProviderScopeEnum,
      description:
        'The scope this provider configuration was created at (globally, org-wide, or by the team)'
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

export default AddIntegrationProviderInput
