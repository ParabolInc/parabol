import {GraphQLID, GraphQLNonNull} from 'graphql';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import getCCFromCustomer from 'server/graphql/mutations/helpers/getCCFromCustomer';
import UpgradeToProPayload from 'server/graphql/types/UpgradeToProPayload';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import {fromEpochSeconds} from 'server/utils/epochTime';
import publish from 'server/utils/publish';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import {ACTION_MONTHLY} from 'server/utils/serverConstants';
import {ORGANIZATION, PRO, TEAM, UPDATED} from 'universal/utils/constants';

export default {
  type: UpgradeToProPayload,
  description: 'Upgrade an account to the paid service',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org requesting the upgrade'
    },
    stripeToken: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The token that came back from stripe'
    }
  },
  async resolve(source, {orgId, stripeToken}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    const {orgUsers, stripeSubscriptionId: startingSubId, stripeId} = await r.table('Organization')
      .get(orgId)
      .pluck('orgUsers', 'stripeId', 'stripeSubscriptionId');

    if (startingSubId) {
      throw new Error('You are already pro!');
    }

    // RESOLUTION
    // if they downgrade & are re-upgrading, they'll already have a stripeId
    const customer = stripeId ?
      await stripe.customers.update(stripeId, {source: stripeToken}) :
      await stripe.customers.create({
        source: stripeToken,
        metadata: {
          orgId
        }
      });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      metadata: {
        orgId
      },
      plan: ACTION_MONTHLY,
      quantity: orgUsers.length,
      trial_period_days: 0
    });

    const {current_period_end, current_period_start} = subscription;
    const creditCard = getCCFromCustomer(customer);
    const {teamIds} = await r({
      updatedOrg: r.table('Organization').get(orgId).update({
        creditCard,
        tier: PRO,
        periodEnd: fromEpochSeconds(current_period_end),
        periodStart: fromEpochSeconds(current_period_start),
        stripeId: customer.id,
        stripeSubscriptionId: subscription.id,
        updatedAt: now
      }),
      teamIds: r.table('Team')
        .getAll(orgId, {index: 'orgId'})
        .update({
          isPaid: true,
          tier: PRO,
          updatedAt: now
        }, {returnChanges: true})('changes')('new_val')('id').default([])
    });
    sendSegmentEvent('Upgrade to Pro', userId, {orgId});
    publish(ORGANIZATION, orgId, UPDATED, {orgId}, subOptions);
    teamIds.forEach((teamId) => {
      publish(TEAM, teamId, UPDATED, {teamId}, subOptions);
    });
    return {
      orgId,
      teamIds
    };
  }
};
