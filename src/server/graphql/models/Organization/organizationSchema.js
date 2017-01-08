import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {GraphQLURLType} from '../types';

const CreditCard = new GraphQLObjectType({
  name: 'CreditCard',
  description: 'A credit card',
  fields: () => ({
    brand: {
      type: GraphQLString,
      description: 'The brand of the credit card, as provided by skype'
    },
    expiry: {
      type: GraphQLString,
      description: 'The MM/YY string of the expiration date'
    },
    last4: {
      type: GraphQLInt,
      description: 'The last 4 digits of a credit card'
    }
  })
});

export const Organization = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique organization ID'},
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the organization was created'
    },
    creditCard: {
      type: CreditCard,
      description: 'The safe credit card details'
    },
    isTrial: {
      type: GraphQLBoolean,
      description: 'true if the org is still in the trial period'
    },
    name: {type: GraphQLString, description: 'The name of the organization'},
    picture: {
      type: GraphQLURLType,
      description: 'The org avatar'
    },
    stripeId: {
      type: GraphQLID,
      description: 'The customerId from stripe'
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
