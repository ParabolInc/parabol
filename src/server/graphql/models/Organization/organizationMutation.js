import getRethink from 'server/database/rethinkDriver';
import {UpdateOrgInput} from './organizationSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireOrgLeader, requireOrgLeaderOfUser, requireWebsocket} from '../authorization';
import updateOrgSchema from 'universal/validation/updateOrgSchema';
import {errorObj, handleSchemaErrors} from '../utils';
import stripe from 'server/utils/stripe';
import {ACTION_MONTHLY, TRIAL_EXTENSION} from 'server/utils/serverConstants';
import {TRIAL_EXPIRES_SOON} from 'universal/utils/constants';
import {
  ADD_USER,
  PAUSE_USER,
  REMOVE_USER,
  UNPAUSE_USER,
  MAX_MONTHLY_PAUSES
} from 'server/utils/serverConstants';

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
      const {stripeId, trialExpiresAt} = await r.table('User').get(userId)('stripeId', 'trialExpiresAt');
      const stripeRequests = [
        stripe.customers.update(stripeId, {source: stripeToken}),
        stripe.tokens.retrieve(stripeToken)
      ];

      const [customer, token] = await Promise.all(stripeRequests);
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
        // this is a hacky way of making sure that the user adding billing info is the one who created the org
        if (trialExpiresAt === validUntil) {
          promises.push(r.table('User').get(userId)
            .update({
              // not too useful (only used as a boolean) but good to keep it matching what's in the org
              trialExpiresAt: nowValidUntil
            }));
        }
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
      const {inactive: isInactive, orgs: orgIds} = await r.table('User').get(userId);
      if (isInactive) {
        throw errorObj({_error: `${userId} is already inactive. cannot inactivate twice`})
      }
      const orgDocs = await r.table('Organization')
        .getAll(r.args(orgIds), {index: 'id'}).pluck('stripeId', 'stripeSubscriptionId');

      const upcomingInvoicesPromises = orgDocs.map(({stripeId}) => stripe.invoices.retrieveUpcoming(stripeId));
      const upcomingInvoices = await Promise.all(upcomingInvoicesPromises);
      for (let i = 0; i < upcomingInvoices.length; i++) {
        const invoice = upcomingInvoices[i];
        const invoiceLines = invoice.lines.data;
        let previousPauses = 0;
        for (let j = 0; j < invoiceLines.length; j++) {
          const lineItem = invoiceLines[j];
          if (lineItem.metadata.userId === userId && lineItem.metadata.type === PAUSE_USER) {
            if (++previousPauses >= MAX_MONTHLY_PAUSES) {
              throw errorObj({_error: 'Max monthly pauses exceeded for this user'});
            }
          }
        }
      }

      // RESOLUTION
      const subPromises = orgDocs.map(({stripeSubscriptionId}) => stripe.subscriptions.retrieve(stripeSubscriptionId));
      const subscriptions = await Promise.all(subPromises);
      const updatePromises = subscriptions.map((sub) => stripe.subscriptions.update(sub.id, {
        quantity: sub.quantity - 1,
        metadata: {
          type: PAUSE_USER,
          automatic: true,
          userId
        }
      }));
      const now = new Date();
      updatePromises.push(r.table('User')
        .get(userId)
        .update({
          inactive: true,
          updatedAt: now
        }));
      await Promise.all(updatePromises);
      return true;
    }
  }
};
