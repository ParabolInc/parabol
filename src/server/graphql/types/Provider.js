import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {connectionDefinitions, globalIdField} from 'graphql-relay';
import {nodeInterface} from 'server/graphql/models/Node/nodeQuery';
import IntegrationService from 'server/graphql/types/IntegrationService';

const Provider = new GraphQLObjectType({
  name: 'Provider',
  description: 'A token for a user to be used on 1 or more teams',
  interfaces: () => [nodeInterface],
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
    providerUserId: {
      type: GraphQLID,
      description: '*The id for the user used by the provider, eg SlackTeamId, GoogleUserId'
    },
    providerUserName: {
      type: GraphQLString,
      description: 'The username (or email) attached to the provider'
    },
    service: {
      type: IntegrationService,
      description: 'The name of the service'
    },
    teamIds: {
      type: new GraphQLList(GraphQLID),
      description: '*The teams that the token is linked to, if any'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the project was updated'
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
