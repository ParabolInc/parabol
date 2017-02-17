import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql';
import {TRIAL_EXTENSION} from 'server/utils/serverConstants';
import {TRIAL_EXPIRES_SOON} from 'universal/utils/constants';
import {getUserId, getUserOrgDoc, requireOrgLeader, requireWebsocket} from 'server/utils/authorization';
import stripe from 'server/billing/stripe';
import {toEpochSeconds} from 'server/utils/epochTime';
import getCCFromCustomer from 'server/graphql/models/Organization/addBilling/getCCFromCustomer';

export default {
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
    const now = new Date();

    // AUTH
    requireWebsocket(socket);
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    // RESOLUTION
    const {creditCard, stripeId, stripeSubscriptionId, periodEnd} = await r.table('Organization')
      .get(orgId)
      .pluck('creditCard', 'periodEnd', 'stripeId', 'stripeSubscriptionId');
    const promises = [stripe.customers.update(stripeId, {source: stripeToken})];
    let extendedPeriodEnd;
    if (creditCard && periodEnd > now) {
      // extend the trial in stripe
      extendedPeriodEnd = new Date(periodEnd.setMilliseconds(0) + TRIAL_EXTENSION);
      promises.push(stripe.subscriptions.update(stripeSubscriptionId, {
        trial_end: toEpochSeconds(extendedPeriodEnd)
      }));
      // remove the oustanding notifications
      promises.push(r.table('Notification')
        .getAll(orgId, {index: 'orgId'})
        .filter({
          type: TRIAL_EXPIRES_SOON
        })
        .delete());
    }
    const [customer] = await Promise.all(promises);
    const orgUpdates = {
      creditCard: getCCFromCustomer(customer)
    };
    if (extendedPeriodEnd !== undefined) {
      orgUpdates.periodEnd = extendedPeriodEnd;
    }
    return await r.table('Organization').get(orgId).update(orgUpdates);
  }
};
