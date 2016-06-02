import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team this member belongs to'},
    active: {type: GraphQLBoolean, description: 'Is user active?'},
    userCacheId: {type: GraphQLID, description: 'Active user\'s UserCache ID'},
    inviteId: {type: GraphQLString, description: 'Token used when inviting a user'},
    name: {
      type: GraphQLString,
      description: 'The name of the team member, preferred over a value from UserCache'
    },
    email: {
      type: GraphQLString,
      description: 'User\'s email, only used if user is not active; else refer to UserCache'
    }
  })
});
