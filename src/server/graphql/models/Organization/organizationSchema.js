import {
  GraphQLList,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLEnumType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {GraphQLURLType} from 'server/graphql/types';
import {BILLING_LEADER} from 'universal/utils/constants';
import getRethink from 'server/database/rethinkDriver';
import {User} from 'server/graphql/models/User/userSchema';

// const RemovedUser = new GraphQLObjectType({
//   name: 'RemovedUser',
//   description: 'A user removed from the org',
//   fields: () => ({
//     removedAt: {
//       type: new GraphQLNonNull(GraphQLISO8601Type),
//       description: 'The datetime the user was removed from the org'
//     },
//     userId: {
//       type: new GraphQLNonNull(GraphQLID),
//       description: 'The userId removed from the org'
//     }
//   })
// });

export const CreditCard = new GraphQLObjectType({
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

export const OrgUserRole = new GraphQLEnumType({
  name: 'OrgUserRole',
  description: 'The role of the org user',
  values: {
    [BILLING_LEADER]: {}
  }
});

const OrgUser = new GraphQLObjectType({
  name: 'OrgUser',
  description: 'The user/org M:F join, denormalized on the user/org tables',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'The userId'
    },
    role: {
      type: OrgUserRole,
      description: 'role of the user in the org'
    },
    inactive: {
      type: GraphQLBoolean,
      description: 'true if the user is paused and the orgs are not being billed'
    }
  })
});

export const Organization = new GraphQLObjectType({
  name: 'Organization',
  description: 'An organization',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique organization ID'},
    activeUserCount: {
      type: GraphQLInt,
      description: 'The number of orgUsers who do not have an inactive flag'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the organization was created'
    },
    creditCard: {
      type: CreditCard,
      description: 'The safe credit card details'
    },
    inactiveUserCount: {
      type: GraphQLInt,
      description: 'The number of orgUsers who have an inactive flag'
    },
    name: {type: GraphQLString, description: 'The name of the organization'},
    picture: {
      type: GraphQLURLType,
      description: 'The org avatar'
    },
    periodEnd: {
      type: GraphQLISO8601Type,
      description: 'THe datetime the current billing cycle ends',
    },
    periodStart: {
      type: GraphQLISO8601Type,
      description: 'The datetime the current billing cycle starts'
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
    orgUsers: {
      type: new GraphQLList(OrgUser),
      description: 'The users that belong to this org'
    },
    /* GraphQL Sugar */
    billingLeaders: {
      type: new GraphQLList(User),
      description: 'The leaders of the org',
      resolve: async ({id}) => {
        const r = getRethink();
        return r.table('User')
          .getAll(id, {index: 'userOrgs'})
          .filter((user) => user('userOrgs')
            .contains((userOrg) => userOrg('id').eq(id).and(userOrg('role').eq(BILLING_LEADER))))
          .run();
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
