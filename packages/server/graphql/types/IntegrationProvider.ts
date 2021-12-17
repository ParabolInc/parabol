import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import GraphQLURLType from './GraphQLURLType'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import {
  IntegrationProviderTypesEnum as DBIntegrationProviderTypesEnum,
  IntegrationProviderScopesEnum as DBIntegrationProviderScopesEnum,
  IntegrationProviderTokenTypeEnum as DBIntegrationProviderTokenTypeEnum
} from '../../postgres/types/IntegrationProvider'

export const IntegrationProviderTypeEnum = new GraphQLEnumType({
  name: 'IntegrationProviderTypeEnum',
  description: 'The type of Integration Provider service',
  values: {
    gitlab: {},
    mattermost: {}
  } as {[P in DBIntegrationProviderTypesEnum]: any}
})

export const IntegrationProviderTokenTypeEnum = new GraphQLEnumType({
  name: 'IntegrationProviderTokenTypeEnum',
  description: 'The kind of token provided by the service',
  values: {
    oauth2: {},
    pat: {},
    webhook: {}
  } as {[P in DBIntegrationProviderTokenTypeEnum]: any}
})

export const IntegrationProviderScopesEnum = new GraphQLEnumType({
  name: 'IntegrationProviderScopesEnum',
  description: 'The scope this provider was created on (globally, org-wide, or on the team)',
  values: {
    global: {},
    org: {},
    team: {}
  } as {[P in DBIntegrationProviderScopesEnum]: any}
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
    type: {
      description: 'The service this provider is associated with',
      type: new GraphQLNonNull(IntegrationProviderTypeEnum),
      resolve: ({type}) => type.toLowerCase()
    },
    tokenType: {
      description: 'The kind of token used by this provider',
      type: new GraphQLNonNull(IntegrationProviderTokenTypeEnum),
      resolve: ({tokenType}) => tokenType.toLowerCase()
    },
    scope: {
      description:
        'The scope this provider configuration was created at (globally, org-wide, or by the team)',
      type: new GraphQLNonNull(IntegrationProviderScopesEnum),
      resolve: ({scope}) => scope.toLowerCase()
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the provider configuration should be used'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the provider, suitable for display on a user interface'
    },
    oauthScopes: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLString))),
      description: 'A list of scope strings that should be requested from the provider'
    },
    serverBaseUri: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The base URI used to access the provider'
    },
    oauthClientId: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The client id to give to the provider'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The org that the access token is attached to'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team that the token is linked to'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the token was updated at'
    }
  })
})

export default IntegrationProvider
