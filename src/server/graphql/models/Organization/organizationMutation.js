import getRethink from 'server/database/rethinkDriver';
import {UpdateOrgInput} from './organizationSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireOrgLeader, requireOrgLeaderOfUser, requireWebsocket} from '../authorization';
import updateOrgSchema from 'universal/validation/updateOrgSchema';
import {errorObj, handleSchemaErrors, getOldVal} from '../utils';
import stripe from 'server/billing/stripe';
import {TRIAL_EXTENSION} from 'server/utils/serverConstants';
import {TRIAL_EXPIRES_SOON} from 'universal/utils/constants';
import {
  ADD_USER,
  PAUSE_USER,
  REMOVE_USER,
  UNPAUSE_USER,
  MAX_MONTHLY_PAUSES
} from 'server/utils/serverConstants';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';

export default {
  updateOrg: {
    type: GraphQLBoolean,
    description: 'Update an with a change in name, avatar',
    args: {
      updatedOrg: {
        type: new GraphQLNonNull(UpdateOrgInput),
        description: 'the updated org including the id, and at least one other field'
      }
    },
    async resolve(source, {updatedOrg}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      await requireOrgLeader(authToken, updatedOrg.id);

      // VALIDATION
      const schema = updateOrgSchema();
      const {errors, data: {id: orgId, ...org}} = schema(updatedOrg);
      handleSchemaErrors(errors);

      // RESOLUTION
      const now = new Date();
      const newAction = {
        ...org,
        updatedAt: now
      };
      await r.table('Organization').get(orgId).update(newAction);
      return true;
    }
  },
  removeBillingLeader: {
    type: GraphQLBoolean,
    description: 'Remove a billing leader from an org',
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the org to remove the billing leader from'
      },
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The billing leader userId to remove from the org'
      }
    },
    async resolve(source, {orgId, userId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      await requireOrgLeader(authToken, orgId);

      // RESOLUTION
      const now = new Date();
      await r.table('User').get(orgId)
        .update((user) => {
          return user.merge({
            billingLeaderOrgs: user('billingLeaderOrgs').filter((id) => id.ne(orgId)),
            updatedAt: now
          });
        });
      return true;
    }
  },
  addBilling: {
    type: GraphQLBoolean,
    description: 'Add a credit card by passing in a stripe token encoded with all the billing details',
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the org requesting the changed billing'
      },
      stripeToken: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The token that came back from stripe'
      }
    },
    async resolve(source, {orgId, stripeToken}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      const userId = await requireOrgLeader(authToken, orgId);

      // RESOLUTION
      const now = new Date();
      const {stripeId, trialExpiresAt} = await r.table('Organization').get(userId)
        .pluck('stripeId', 'trialExpiresAt');
      const stripeRequests = [
        stripe.customers.update(stripeId, {source: stripeToken}),
        stripe.tokens.retrieve(stripeToken)
      ];

      const [, token] = await Promise.all(stripeRequests);
      const {brand, last4, exp_month: expMonth, exp_year: expYear} = token.card;
      const expiry = `${expMonth}/${expYear.substr(2)}`;
      const {isTrial, stripeSubscriptionId, validUntil} = await r.table('Organization')
        .get(orgId)
        .pluck('isTrial', 'validUntil', 'stripeSubscriptionId');

      let nowValidUntil = validUntil;
      const promises = [];
      if (isTrial && validUntil > now) {
        nowValidUntil = new Date(nowValidUntil.setMilliseconds(0) + TRIAL_EXTENSION);
        const extendTrial = stripe.subscriptions.update(stripeSubscriptionId, {
          trial_end: nowValidUntil / 1000
        });
        promises.push(extendTrial);
      }
      const updateOrg = r.table('Organization').get(orgId)
        .update({
          creditCard: {
            brand,
            last4,
            expiry
          },
          validUntil: nowValidUntil
        });
      promises.push(updateOrg);


      if (validUntil !== nowValidUntil) {
        // remove the oustanding notifications
        promises.push(r.table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter({
            type: TRIAL_EXPIRES_SOON
          })
          .delete());
      }
      await Promise.all(promises);
    }
  },
  inactivateUser: {
    type: GraphQLBoolean,
    description: 'pauses the subscription for a single user',
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the user to pause'
      }
    },
    async resolve(source, {userId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      await requireOrgLeaderOfUser(authToken, userId);
      const res = await r.table('User').get(userId)
        .update({
          inactive: true
        }, {returnChanges: true});
      const userDoc = getOldVal(res);
      if (!userDoc) {
        // no userDoc means there were no changes, which means inactive was already true
        throw errorObj({_error: `${userId} is already inactive. cannot inactivate twice`})
      }
      const {orgs: orgIds} = userDoc;
      const orgDocs = await r.table('Organization').getAll(r.args(orgIds), {index: 'id'});

      const hookPromises = orgDocs.map((orgDoc) => {
        const {stripeSubscriptionId, id: orgId} = orgDoc;
        return stripe.subscriptions.retrieve(stripeSubscriptionId)
          .then((subscription) => {
            const {current_period_start: startAt, current_period_end: endAt} = subscription;
            return r.table('InvoiceItemHook')
              .between([startAt, orgId], [endAt, orgId])
              .filter({userId, type: PAUSE_USER})
              .count()
          })
      });
      const pausesByOrg = await Promise.all(hookPromises);
      const triggeredPauses = Math.max(...pausesByOrg);
      if (triggeredPauses >= MAX_MONTHLY_PAUSES) {
        throw errorObj({_error: 'Max monthly pauses exceeded for this user'});
      }

      // RESOLUTION
      await adjustUserCount(userId, orgIds, PAUSE_USER);
      return true;
    }
  },
  removeOrgUser: {
    type: GraphQLBoolean,
    description: 'Remove a user from an org',
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the user to remove'
      }
      ,
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the org that does not want them anymore'
      }
    },
    async resolve(source, {orgId, userId}, {authToken}){
      const r = getRethink();

      // AUTH
      await requireOrgLeader(authToken, orgId);

      // RESOLUTION
      const now = new Date();
      const userRes = await r.table('User').get(userId)
        .update((row) => ({
          orgs: row('orgs').filter((id) => id.ne(orgId)),
          billingLeaderOrgs: row('billingLeaderOrgs').filter((id) => id.ne(orgId))
        }), {returnChanges: true});

      const userDoc = getOldVal(userRes);
      if (!userDoc) {
        throw errorObj({_error: `${userId} does not exist`});
      }
      const {orgs} = userDoc;
      if (!orgs.includes(orgId)) {
        throw errorObj({_error: `${userId} is not a part of org ${orgId}`});
      }
      await adjustUserCount(userId, orgId, REMOVE_USER);
      return true;
    }
  }
};

// stripe.customers.create({
//   metadata: {
//     orgId: 'org123'
//   },
//   source: {
//     object: 'card',
//     exp_month: 12,
//     exp_year: 2019,
//     number: '4242424242424242'
//   }
// }).then(res => console.log(res.id))

// stripe.customers.update("cus_9wYZniZh21oSvj", {
//   source: {
//     object: 'card',
//     exp_month: 12,
//     exp_year: 2019,
//     number: '4242424242424242'
//   }
// })
// stripe.subscriptions.create({
//   customer: "cus_9wYZniZh21oSvj",
//   plan: '3',
// }).then(res => console.log(res.id))
//
// stripe.invoices.retrieveUpcoming("cus_9wYZniZh21oSvj").then(res => console.log(res.lines.data))
// stripe.subscriptions.update('sub_9wYZtzgKY3PUir', {
//   quantity: 2,
//   metadata: {
//     type: 'addUser',
//     userId: 'foo123'
//   },
//   proration_date: 1484594697
// })
//
// stripe.subscriptions.update('sub_9wYZtzgKY3PUir', {
//   quantity: 1,
//   metadata: {
//     type: 'pauseUser',
//     userId: 'foo100'
//   }
// })
//
// stripe.subscriptions.update('sub_9wYZtzgKY3PUir', {
//   quantity: 0,
//   metadata: {
//     type: 'removeUser',
//     userId: 'foo123'
//   }
// })
//
// stripe.subscriptions.update('sub_9wYZtzgKY3PUir', {
//   quantity: 2,
//   proration_date: 1484592888
// }).then(res => console.log(res))
//
// const obj = {
//   id: prorationDate,
//   userId,
//   type
// }
