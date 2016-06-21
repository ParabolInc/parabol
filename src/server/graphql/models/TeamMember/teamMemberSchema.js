import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList
} from 'graphql';

import {GraphQLEmailType} from '../types';

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

const EmailAndTask = new GraphQLInputObjectType({
  email: {
    type: new GraphQLNonNull(GraphQLEmailType),
    description: 'The email address of the invitee'
  },
  task: {
    type: GraphQLString,
    description: 'The current task the invitee is working on'
  }
});

export const InviteesInput = new GraphQLInputObjectType({
  name: 'InviteesInput',
  description: 'The list of invitees and their tasks for a given team',
  fields: () => ({
    invitees: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(EmailAndTask))),
      description: 'A list of invitees and the task that that the team lead assigned them'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
});

export const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team this member belongs to'},
    cachedUserId: {
      type: GraphQLID,
      description: 'Active user\'s CachedUser ID. Will be blank if invitee has not accepted'
    },
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
