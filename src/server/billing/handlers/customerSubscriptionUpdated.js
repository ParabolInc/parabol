import terminateSubscription from 'server/billing/helpers/terminateSubscription';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import makeUpcomingInvoice from 'server/graphql/models/Invoice/makeUpcomingInvoice';
import getPubSub from 'server/utils/getPubSub';
import shortid from 'shortid';
import {
  BILLING_LEADER,
  NOTIFICATIONS_ADDED,
  NOTIFICATIONS_CLEARED,
  TRIAL_EXPIRED,
  TRIAL_EXPIRES_SOON
} from 'universal/utils/constants';

/*
 * Used as a pseudo hook for trial ending. We could use payment_failed, but that hook is sent 1 hr after this one
 */

export default async function customerSubscriptionUpdated(subscriptionId, oldStatus, exchange) {
  const r = getRethink();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (!subscription) return;
  const {customer, metadata: {orgId}, status} = subscription;
  const now = new Date();
  if (oldStatus === 'trialing' && status === 'active') {
    // their trial probably just expired. if they have a CC, we know they converted
    const hasCreditCard = await r.table('Organization').get(orgId)('creditCard')('last4').default(null);
    if (hasCreditCard) {
      // they already converted! (or someone was sending a phony event to our webhook)
      return;
    }
    const orgDoc = await terminateSubscription(orgId);
    const userIds = orgDoc.orgUsers.reduce((billingLeaders, orgUser) => {
      if (orgUser.role === BILLING_LEADER) {
        billingLeaders.push(orgUser.id);
      }
      return billingLeaders;
    }, []);
    const notification = {
      id: shortid.generate(),
      type: TRIAL_EXPIRED,
      startAt: now,
      orgId,
      userIds,
      expiresAt: now
    };
    const {deletedId} = await r({
      insert: r.table('Notification').insert(notification),
      deletedId: r.table('Notification')
        .getAll(orgId, {index: 'orgId'})
        .filter({type: TRIAL_EXPIRES_SOON})
        .delete({returnChanges: true})('changes')(0)('old_val')('id')
        .default(null)
    });
    const notificationsAdded = {notifications: [notification]};
    const notificationsCleared = {deletedIds: [deletedId]};
    userIds.forEach((userId) => {
      getPubSub().publish(`${NOTIFICATIONS_ADDED}.${userId}`, {notificationsAdded});
      getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared});
    });
  }
  // invalidate the upcomingInvoice
  const channel = `upcomingInvoice/${orgId}`;
  const upcomingInvoice = await makeUpcomingInvoice(orgId, customer, subscriptionId);
  const payload = {
    type: 'update',
    fields: upcomingInvoice
  };
  exchange.publish(channel, payload);
}
