import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType
} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';

export const Invitation = new GraphQLObjectType({
  name: 'Invitation',
  description: 'An invitation to become a team member',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique invitation Id'},
    acceptedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the invitation was accepted'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the invitation was created'
    },
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The email of the invitee'
    },
    fullName: {
      type: GraphQLString,
      description: 'The name of the invitee, derived from the email address'
    },
    hashedToken: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Secret token used when inviting a user',
      // lock it down
      resolve: () => null
    },
    invitedBy: {type: GraphQLID, description: 'The teamMemberId of the person that sent the invitation'},
    inviteCount: {
      type: GraphQLInt,
      description: 'How many invites have been sent to this email address?'
    },
    task: {
      type: GraphQLString,
      description: 'The task that the invitee is currently working on'
    },
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team invited to'},
    tokenExpiration: {
      type: GraphQLISO8601Type,
      description: 'The datestamp of when the invitation will expire'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the invitation was last updated'
    }
  })
});

export const Invitee = new GraphQLInputObjectType({
  name: 'Invitee',
  description: 'The email and task of an invited team member',
  fields: () => ({
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The email address of the invitee'
    },
    fullName: {
      type: GraphQLString,
      description: 'The name derived from an RFC5322 email string'
    },
    task: {
      type: GraphQLString,
      description: 'The current task the invitee is working on'
    }
  })
});
