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
import {toStripeDate} from 'server/billing/stripeDate';
import createStripeBilling from 'server/graphql/models/Organization/addBilling/createStripeBilling';

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
    const {isTrial, stripeSubscriptionId, validUntil} = await r.table('Organization')
      .get(orgId)
      .pluck('isTrial', 'validUntil', 'stripeSubscriptionId');
    const promises = [];
    let nowValidUntil;
    if (isTrial && validUntil > now) {
      // extend the trial in stripe
      nowValidUntil = new Date(validUntil.setMilliseconds(0) + TRIAL_EXTENSION);
      promises.push(stripe.subscriptions.update(stripeSubscriptionId, {
        trial_end: toStripeDate(nowValidUntil)
      }));
      // remove the oustanding notifications
      promises.push(r.table('Notification')
        .getAll(orgId, {index: 'orgId'})
        .filter({
          type: TRIAL_EXPIRES_SOON
        })
        .delete());
    }
    promises.push(createStripeBilling(orgId, stripeToken, nowValidUntil));
    await Promise.all(promises);
  }
};
