import r from '../../../database/rethinkDriver';
import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {CachedUser} from '../CachedUser/cachedUserSchema';
import {TeamMember} from '../TeamMember/teamMemberSchema';
import {nonnullifyInputThunk} from '../utils';

export const UserProfile = new GraphQLObjectType({
  name: 'UserProfile',
  description: 'User-level Action application profile info and preferences',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The primary key'
    },
    isNew: {
      type: GraphQLBoolean,
      description: 'Has the user ever been associated with a meeting'
    },
    welcomeSentAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime that we sent them a welcome email'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    },
    cachedUser: {
      type: CachedUser,
      description: 'A cached version of the user profile from auth0',
      resolve({id}) {
        return r.table('CachedUser').get(id);
      }
    },
    memberships: {
      type: new GraphQLList(TeamMember),
      description: 'The memberships to different teams that the user has',
      async resolve({id}) {
        return await r.table('TeamMember').getAll(id, {index: 'userId'});
      }
    }
  })
});

const profileInputThunk = () => ({
  id: {type: GraphQLID, description: 'The unique userId'},
  preferredName: {
    type: GraphQLString,
    description: 'The name, as confirmed by the user'
  }
});

export const UpdateProfileInput = nonnullifyInputThunk('UpdateProfileInput', profileInputThunk, ['id']);
