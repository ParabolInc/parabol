import {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {globalIdField} from 'graphql-relay';
import {nodeInterface} from 'server/graphql/models/Node/nodeQuery';

const Provider = new GraphQLObjectType({
  name: 'Provider',
  description: 'A token for a user to be used on 1 or more teams',
  interfaces: [nodeInterface],
  fields: () => ({
    // shortid
    id: globalIdField('Provider', ({id}) => id),
    accessToken: {
      description: 'The access token to the service. Not the ID because some tokens may be shared across teams (eg slack)',
      type: new GraphQLNonNull(GraphQLID)
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the provider was created'
    },
    providerUserId: {
      type: GraphQLID,
      description: '*The id for the user used by the provider, eg SlackUserId, GoogleUserId'
    },
    service: {
      type: GraphQLString,
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

export default Provider;