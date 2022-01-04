import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLUnionType
} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {
  IntegrationProviderScopeEnum as DBIntegrationProviderScopeEnum,
  IntegrationProvidersEnum as DBIntegrationProvidersEnum,
  IntegrationProviderTypeEnum as DBIntegrationProviderTypeEnum,
  isOAuth2ProviderMetadata,
  isWebHookProviderMetadata
} from '../../postgres/types/IntegrationProvider'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'

export const IntegrationProvidersEnum = new GraphQLEnumType({
  name: 'IntegrationProvidersEnum',
  description: 'The name of the service of the Integration Provider',
  values: {
    gitlab: {},
    mattermost: {}
  } as {[P in DBIntegrationProvidersEnum]: any}
})

export const IntegrationProviderTypeEnum = new GraphQLEnumType({
  name: 'IntegrationProviderTypeEnum',
  description: 'The kind of token provided by the service',
  values: {
    oauth2: {},
    pat: {},
    webhook: {}
  } as {[P in DBIntegrationProviderTypeEnum]: any}
})

export const IntegrationProviderScopeEnum = new GraphQLEnumType({
  name: 'IntegrationProviderScopeEnum',
  description: 'The scope this provider was created on (globally, org-wide, or on the team)',
  values: {
    global: {},
    org: {},
    team: {}
  } as {[P in DBIntegrationProviderScopeEnum]: any}
})

const OAuth2ProviderMetadata = new GraphQLObjectType<any, GQLContext>({
  name: 'OAuth2ProviderMetadata',
  description: 'OAuth2 metadata for an Integration Provider, excluding the client secret',
  fields: () => ({
    serverBaseUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The base URL of the OAuth2 server'
    },
    clientId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The OAuth2 client id'
    },
    scopes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      description: 'The OAuth2 scopes'
    }
  })
})

const WebHookProviderMetadata = new GraphQLObjectType<any, GQLContext>({
  name: 'WebHookProviderMetadata',
  description: 'WebHook metadata for an Integration Provider',
  fields: () => ({
    webhookUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The webhook URL'
    }
  })
})

const ProviderMetadata = new GraphQLUnionType({
  name: 'ProviderMetadata',
  types: [OAuth2ProviderMetadata, WebHookProviderMetadata],
  resolveType(value) {
    if (isOAuth2ProviderMetadata(value)) {
      return OAuth2ProviderMetadata
    }
    if (isWebHookProviderMetadata(value)) {
      return WebHookProviderMetadata
    }

    return null
  }
})

const IntegrationProvider = new GraphQLObjectType<any, GQLContext>({
  name: 'IntegrationProvider',
  description: 'An authentication provider configuration',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "The provider's unique identifier",
      resolve: ({id}) => IntegrationProviderId.join(id)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that the token is linked to'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the token was updated at'
    },
    provider: {
      description: 'The service this provider is associated with',
      type: new GraphQLNonNull(IntegrationProvidersEnum)
    },
    type: {
      description: 'The kind of token used by this provider',
      type: new GraphQLNonNull(IntegrationProviderTypeEnum)
    },
    scope: {
      description:
        'The scope this provider configuration was created at (globally, org-wide, or by the team)',
      type: new GraphQLNonNull(IntegrationProviderScopeEnum)
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the provider configuration should be used'
    },
    providerMetadata: {
      type: new GraphQLNonNull(ProviderMetadata),
      description:
        'The metadata associated with the provider, depending on the provider token type (OAuth2 or WebHook), different metadata will be provided'
    }
  })
})

export default IntegrationProvider
