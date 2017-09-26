import {GraphQLID, GraphQLNonNull} from 'graphql';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import makeUpcomingInvoice from 'server/graphql/models/Invoice/makeUpcomingInvoice';
import getCCFromCustomer from 'server/graphql/mutations/helpers/getCCFromCustomer';
import UpdateCreditCardPayload from 'server/graphql/types/UpdateCreditCardPayload';
import {getUserId, getUserOrgDoc, requireOrgLeader, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {INVOICES, UPDATE} from 'universal/utils/constants';

export default {
  type: UpdateCreditCardPayload,
  description: 'Update an existing credit card on file',
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
  async resolve(source, {orgId, stripeToken}, {authToken, socketId}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    requireWebsocket(socketId);
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    const {stripeId, stripeSubscriptionId} = await r.table('Organization')
      .get(orgId)
      .pluck('stripeId', 'stripeSubscriptionId');
    if (!stripeSubscriptionId) {
      throw new Error('Cannot call this without an active stripe subscription');
    }

    // RESOLUTION
    const customer = await stripe.customers.update(stripeId, {source: stripeToken});
    const creditCard = getCCFromCustomer(customer);
    await r({
      updatedCC: r.table('Organization').get(orgId).update({
        creditCard,
        updatedAt: now
      }),
      updatedTeam: r.table('Team')
        .getAll(orgId, {index: 'orgId'})
        .update({
          isPaid: true,
          updatedAt: now
        })
    });
    const upcomingInvoice = await makeUpcomingInvoice(orgId, stripeId, stripeSubscriptionId);

    const invoices = {
      type: UPDATE,
      fields: upcomingInvoice
    };

    getPubSub().publish(`${INVOICES}.${orgId}`, {invoices, mutatorId: socketId});
    return {
      creditCard,
      upcomingInvoice
    };

    //if (periodEnd > now) {
    //  // 1) Updating to a new credit card
    //  if (creditCard.last4) {
    //    await
    //    sendSegmentEvent('Update Payment Success', userId, {orgId});
    //    // 2) Adding to extend the free trial
    //  } else {
    //    const extendedPeriodEnd = new Date(periodStart.setMilliseconds(0) + TRIAL_PERIOD + TRIAL_EXTENSION);
    //    stripe.subscriptions.update(stripeSubscriptionId, {
    //      trial_end: toEpochSeconds(extendedPeriodEnd)
    //    });
    //    const {removedNotification} = await r({
    //      orgUpdated: r.table('Organization').get(orgId).update({
    //        creditCard: getCCFromCustomer(customer),
    //        periodEnd: extendedPeriodEnd
    //      }),
    //      removedNotification: r.table('Notification')
    //        .getAll(orgId, {index: 'orgId'})
    //        .filter({
    //          type: TRIAL_EXPIRES_SOON
    //        })
    //        .delete({returnChanges: true})('changes')(0)('old_val').pluck('id', 'userIds').default(null)
    //    });
    //    if (removedNotification) {
    //      const notificationsCleared = {deletedIds: [removedNotification.id]};
    //      removedNotification.userIds.forEach((notifiedUserId) => {
    //        getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${notifiedUserId}`, {notificationsCleared});
    //      });
    //    }
    //    sendSegmentEvent('addBilling Free Trial Extended', userId, {orgId});
    //  }
    //} else {
    //  // 3) Converting after the trial ended
    //  // 4) Payment was rejected and they're adding a new source
    //  const quantity = orgUsers.reduce((count, orgUser) => orgUser.inactive ? count : count + 1, 0);
    //  const subscription = await stripe.subscriptions.create({
    //    customer: stripeId,
    //    metadata: {
    //      orgId
    //    },
    //    plan: ACTION_MONTHLY,
    //    quantity
    //  });
    //  const {id, current_period_end, current_period_start} = subscription;
    //  await r({
    //    updatedOrg: r.table('Organization').get(orgId).update({
    //      creditCard: getCCFromCustomer(customer),
    //      periodEnd: fromEpochSeconds(current_period_end),
    //      periodStart: fromEpochSeconds(current_period_start),
    //      stripeSubscriptionId: id
    //    }),
    //    updatedTeam: r.table('Team')
    //      .getAll(orgId, {index: 'orgId'})
    //      .update({
    //        isPaid: true
    //      })
    //  });
    //}
    // nuke the upcoming invoice if it existed
  }
};
