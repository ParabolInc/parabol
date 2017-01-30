import {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {GraphQLURLType} from '../../types';
import {User} from 'server/graphql/models/User/userSchema';
import getRethink from 'server/database/rethinkDriver';

const RemovedUser = new GraphQLObjectType({
  name: 'RemovedUser',
  description: 'A user removed from the org',
  fields: () => ({
    removedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the user was removed from the org'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId removed from the org'
    }
  })
});

export const creditCardFields = {
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
};

const CreditCard = new GraphQLObjectType({
  name: 'CreditCard',
  description: 'A credit card',
  fields: () => ({
    ...creditCardFields
  })
});

export const Organization = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique organization ID'},
    // do this instead of activeUserCount so we can index on it & use that to subscribe to all the orgs for a user
    activeUsers: {
      type: GraphQLInt,
      description: 'The userIds that are active on this org'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the organization was created'
    },
    creditCard: {
      type: CreditCard,
      description: 'The safe credit card details'
    },
    inactiveUsers: {
      type: GraphQLInt,
      description: 'The userIds that are inactive on this org'
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
    stripeSubscriptionId: {
      type: GraphQLID,
      description: 'The subscriptionId from stripe'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the organization was last updated'
    },
    validUntil: {
      type: GraphQLISO8601Type,
      description: 'The datetime the trial is up (if isTrial) or money is due (if !isTrial)'
    },
    /* GraphQL Sugar */
    billingLeaders: {
      type: new GraphQLList(User),
      description: 'The leaders of the org',
      resolve: async ({id}) => {
        const r = getRethink();
        return r.table('User').getAll(id, {index: 'billingLeaderOrgs'});
      }
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
