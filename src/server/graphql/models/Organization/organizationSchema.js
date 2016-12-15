import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLInputObjectType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {GraphQLURLType} from '../types';

export const Organization = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique organization ID'},
    // billingLeaders: {
    //   type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
    //   description: 'The userId of the person who pays for the org'
    // },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the organization was created'
    },
    isTrial: {
      type: GraphQLBoolean,
      description: 'true if the org is still in the trial period'
    },
    members: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
      description: 'a list of all members in the org, denormalized from org->team->teamMember->user'
    },
    memberCount: {
      type: GraphQLInt,
      description: 'The length of the members array'
    },
    name: {type: GraphQLString, description: 'The name of the organization'},
    picture: {
      type: GraphQLURLType,
      description: 'The org avatar'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the organization was last updated'
    },
    validUntil: {
      type: GraphQLISO8601Type,
      description: 'The datetime the trial is up (if isTrial) or money is due (if !isTrial)'
    },
    /* GraphQL sugar */
    activeUserCount: {
      type: GraphQLInt,
      description: 'The count of active members that the org is charged for'
    },
    inactiveUserCount: {
      type: GraphQLInt,
      description: 'The count of inactive members that the org is not charged for'
    }
  })
});

export const UpdateOrgInput = new GraphQLInputObjectType({
  name: 'UpdateOrgInput',
  fields: () => ({
    id: {type: GraphQLID, description: 'The unique action ID'},
    name: {
      type: GraphQLString,
      description: 'The name of the org'
    },
    picture: {
      type: GraphQLURLType,
      description: 'The org avatar'
    }
  })
});
