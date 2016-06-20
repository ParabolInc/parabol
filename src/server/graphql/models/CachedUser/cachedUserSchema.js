import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLID,
  GraphQLInt
} from 'graphql';
import {GraphQLEmailType, GraphQLURLType} from '../types';
import {UserProfile} from '../UserProfile/userProfileSchema';
import {TeamMember} from '../TeamMember/teamMemberSchema';
import r from '../../../database/rethinkDriver';

const IdentityType = new GraphQLObjectType({
  name: 'IdentityType',
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

const BlockedUserType = new GraphQLObjectType({
  name: 'BlockedUserType',
  description: 'Identifier and IP address blocked',
  fields: () => ({
    identifier: {
      type: GraphQLString,
      description: 'The identifier (usually email) of blocked user'
    },
    id: {
      type: GraphQLString,
      description: 'The IP address of the blocked user'
    }
  })
});

export const CachedUser = new GraphQLObjectType({
  name: 'CachedUser',
  description: 'The user account profile',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'The userId provided by auth0'
    },
    cachedAt: {
      type: GraphQLString,
      description: 'The timestamp of the user was cached'
    },
    cacheExpiresAt: {
      type: GraphQLString,
      description: 'The timestamp when the cached user expires'
    },
    createdAt: {
      type: GraphQLString,
      description: 'The datetime the user was created'
    },
    updatedAt: {
      type: GraphQLString,
      description: 'The datetime the user was last updated'
    },
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The user email'
    },
    emailVerified: {
      type: GraphQLBoolean,
      description: 'true if email is verified, false otherwise'
    },
    picture: {
      type: GraphQLURLType,
      description: 'url of user\'s profile picture'
    },
    name: {
      type: GraphQLString,
      description: 'Name associated with the user'
    },
    nickname: {
      type: GraphQLString,
      description: 'Nickname associated with the user'
    },
    identities: {
      type: new GraphQLList(IdentityType),
      description: `An array of objects with information about the user's identities.
      More than one will exists in case accounts are linked`
    },
    loginsCount: {
      type: GraphQLInt,
      description: 'The number of logins for this user'
    },
    blockedFor: {
      type: new GraphQLList(BlockedUserType),
      description: 'Array of identifier + ip pairs'
    },
    profile: {
      type: UserProfile,
      description: 'The associated user profile, stored locally in our database.',
      resolve({id}) {
        return r.table('UserProfile').get(id);
      }
    },
    memberships: {
      type: new GraphQLList(TeamMember),
      description: 'The memberships to different teams that the user has',
      resolve({id}) {
        return r.table('TeamMember').getAll(id, {index: 'cachedUserId'});
      }
    }
  })
});

export const CachedUserAndToken = new GraphQLObjectType({
  name: 'CachedUserAndToken',
  description: 'The user account profile + JWT',
  fields: () => ({
    user: {
      type: CachedUser,
      description: 'The user account profile'
    },
    authToken: {
      type: GraphQLString,
      description: 'The JWT that comes from auth0'
    }
  })
});
