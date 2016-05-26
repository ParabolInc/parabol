import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLID,
} from 'graphql';

export const UserProfile = new GraphQLObjectType({
  name: 'UserProfile',
  description: 'User-level Action application profile info and preferences',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'The primary key'
    },
    emailWelcomed: {
      type: GraphQLBoolean,
      description: 'Have we sent the user a welcome email?'
    }
  })
});
