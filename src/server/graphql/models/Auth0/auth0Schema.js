import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

export const Auth0ClientOptions = new GraphQLObjectType({
  name: 'Auth0ClientOptions',
  description: 'The auth0 configuration parameters needed to authenticate a client',
  fields: () => ({
    clientId: {
      type: GraphQLString,
      description: 'The auth0 client id',
    },
    domain: {
      type: GraphQLString,
      description: 'The auth0 domain'
    },
  })
});
