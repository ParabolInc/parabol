import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLEnumType
} from 'graphql';
import {nonnullifyInputThunk} from '../utils';
import GraphQLISO8601Type from 'graphql-custom-datetype';

export const Organization = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique organization ID'},
    billingLeader: {
      type: GraphQLID,
      description: 'The userId of the person who pays for the org'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the organization was created'
    },
    isTrial: {
      type: GraphQLBoolean,
      description: 'true if the org is still in the trial period'
    },
    name: {type: GraphQLString, description: 'The name of the organization'},
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the organization was last updated'
    },
    validUntil: {
      type: GraphQLISO8601Type,
      description: 'The datetime the trial is up (if isTrial) or is money is due (if !isTrial)'
    }
    /* GraphQL sugar */
    // organizationMembers: {
    //   type: new GraphQLList(OrgMember),
    //   description: 'All the organization members associated who can join this organization',
    //   async resolve({id}) {
    //     const r = getRethink();
    //     return await r.table('OrgMember').getAll(id, {index: 'organizationId'});
    //   }
    // }
  })
});

const organizationInputThunk = () => ({
  id: {type: GraphQLID, description: 'The unique organization ID'},
  name: {type: GraphQLString, description: 'The name of the organization'},
});

export const CreateTeamInput = nonnullifyInputThunk('CreateTeamInput', organizationInputThunk, ['id', 'name']);
export const UpdateTeamInput = nonnullifyInputThunk('UpdateTeamInput', organizationInputThunk, ['id']);
