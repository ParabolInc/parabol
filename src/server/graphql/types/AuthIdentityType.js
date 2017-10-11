import {GraphQLBoolean, GraphQLID, GraphQLObjectType, GraphQLString} from 'graphql';

const AuthIdentityType = new GraphQLObjectType({
  name: 'AuthIdentityType',
  fields: () => ({
    connection: {
      type: GraphQLString,
      description: `The connection name.
      This field is not itself updateable
      but is needed when updating email, email_verified, username or password.`
    },
    userId: {
      type: GraphQLID,
      description: 'The unique identifier for the user for the identity.'
    },
    provider: {
      type: GraphQLString,
      description: 'The type of identity provider.'
    },
    isSocial: {
      type: GraphQLBoolean,
      description: 'true if the identity provider is a social provider, false otherwise'
    }
  })
});

export default AuthIdentityType;
