import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLID,
} from 'graphql';
import {CachedUser} from '../CachedUser/cachedUserSchema';

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
