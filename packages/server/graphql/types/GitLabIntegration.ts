import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import GitLabIntegrationId from 'parabol-client/shared/gqlIds/GitLabIntegrationId'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'

const GitLabIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'GitLabIntegration',
  description: 'Gitlab integration data for a given user',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'composite key',
      resolve: ({teamId, userId}) => GitLabIntegrationId.join(teamId, userId)
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the token was updated at'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the provider was created'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team that the token is linked to'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The user that the access token is attached to'
    },
    isActive: {
      description: 'true if an access token exists, else false',
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({tokenMetadata}) => !!tokenMetadata?.accessToken
    },
    accessToken: {
      type: GraphQLID,
      description: 'The OAuth2 access token, typically a JWT',
      resolve: ({accessToken, userId}, _args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return viewerId === userId ? accessToken : null
      }
    },
    scopes: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The OAuth2 scopes this token is valid for'
    },
    cloudProvider: {
      description: 'The provider to connect to GitLab cloud',
      type: IntegrationProviderOAuth2
    },
    selfHostedProvider: {
      description: 'The provider to connect to a self-hosted GitLab instance',
      type: IntegrationProviderOAuth2
    }
  })
})

export default GitLabIntegration
