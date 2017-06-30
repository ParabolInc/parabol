import {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {globalIdField} from 'graphql-relay';
import {nodeInterface} from 'server/graphql/models/Node/nodeQuery';

const ProviderRow = new GraphQLObjectType({
  name: 'ProviderRow',
  description: 'All the details about a particular provider',
  fields: () => ({
    accessToken: {
      type: GraphQLID,
      description: 'The access token attached to the userId. null if user does not have a token for the provider'
    },
    linkedUserCount: {
      type: GraphQLInt,
      description: 'The count of all the people on the team that have linked their account to the provider'
    },
    integrationCount: {
      type: GraphQLInt,
      description: 'The number of integrations under this provider for the team'
    },
    providerUserName: {
      type: GraphQLString,
      description: 'The username according to the provider'
    }
  })
});

export const ProviderList = new GraphQLObjectType({
  name: 'ProviderList',
  description: 'A token for a user to be used on 1 or more teams',
  fields: () => ({
    slack: {
      description: 'All the big details associated with slack',
      type: ProviderRow
    },
    github: {
      description: 'All the big details associated with GitHub',
      type: ProviderRow
    }
  })
});


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
    providerUserName: {
      type: GraphQLString,
      description: 'The username (or email) attached to the provider'
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