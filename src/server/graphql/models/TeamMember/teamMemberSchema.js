import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInputObjectType
} from 'graphql';

export const TeamMemberInput = new GraphQLInputObjectType({
  name: 'TeamMemberInput',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team this member belongs to'},
    // cachedUserId: {type: new GraphQLNonNull(GraphQLID), description: 'Active user\'s CachedUser ID'},
    isActive: {type: GraphQLBoolean, description: 'Is user active?', defaultValue: true},
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'}
  })
  // }
  // inviteId: {type: GraphQLString, description: 'Token used when inviting a user'},
  // name: {
  //   type: GraphQLString,
  //   description: 'The name of the team member, preferred over a value from UserCache'
  // },
  // email: {
  //   type: GraphQLString,
  //   description: 'User\'s email, only used if user is not active; else refer to UserCache'
  // }
});

export const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team. teamId and cachedUserId are a pseudo composite PK',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team this member belongs to'},
    cachedUserId: {type: new GraphQLNonNull(GraphQLID), description: 'Active user\'s CachedUser ID'},
    isActive: {type: GraphQLBoolean, description: 'Is user active?', defaultValue: true},
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'},
    inviteId: {type: GraphQLString, description: 'Token used when inviting a user'},
    // fullNameAlias: {
    //   type: GraphQLString,
    //   description: 'The name of the team member for this particular team'
    // },
    // emailAlias: {
    //   type: GraphQLString,
    //   description: 'User\'s email for this particular team'
    // }
  })
});
