import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';


const AuthTokenRole = new GraphQLEnumType({
  name: 'AuthTokenRole',
  description: 'A role describing super user privileges',
  values: {
    // superuser
    su: {}
  }
});

const AuthToken = new GraphQLObjectType({
  name: 'AuthToken',
  description: 'An auth token provided by Parabol to the client',
  fields: () => ({
    aud: {
      type: GraphQLString,
      description: 'audience'
    },
    bet: {
      type: GraphQLInt,
      description: 'beta. 1 if enrolled in beta features. else absent'
    },
    exp: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'expiration. Time since unix epoch / 1000'
    },
    iat: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'issued at. Time since unix epoch / 1000'
    },
    iss: {
      type: GraphQLString,
      description: 'issuer'
    },
    sub: {
      type: GraphQLID,
      description: 'subscriber. userId'
    },
    rol: {
      type: AuthTokenRole,
      description: 'Any privileges associated with the account'
    },
    tms: {
      type: new GraphQLList(GraphQLID),
      description: 'a list of teamIds where the user is active'
    }
  })
});

export default AuthToken;
