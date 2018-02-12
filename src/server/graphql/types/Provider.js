import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {connectionDefinitions, globalIdField} from 'graphql-relay';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import IntegrationService from 'server/graphql/types/IntegrationService';

const Provider = new GraphQLObjectType({
  name: 'Provider',
  description: 'A token for a user to be used on 1 or more teams',
  fields: () => ({
    // shortid
    id: globalIdField('Provider', ({id}) => id),
    accessToken: {
      description: 'The access token to the service',
      type: new GraphQLNonNull(GraphQLID)
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the provider was created'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'True if the Provider is active. else false'
    },
    providerUserId: {
      type: GraphQLID,
      description: '*The id for the user used by the provider, eg SlackTeamId, GoogleUserId, githubLogin'
    },
    providerUserName: {
      type: GraphQLString,
      description: 'The username (or email) attached to the provider'
    },
    service: {
      type: IntegrationService,
      description: 'The name of the service'
    },
    teamId: {
      type: GraphQLID,
      description: '*The team that the token is linked to'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the task was updated'
    },
    userId: {
      type: GraphQLID,
      description: 'The user that the access token is attached to'
    }
  })
});

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: Provider
});

export const ProviderConnection = connectionType;
export const ProviderEdge = edgeType;
export default Provider;
