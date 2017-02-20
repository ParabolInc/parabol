import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {BILLING_LEADER, TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';
import terminateSubscription from 'server/billing/helpers/terminateSubscription';

/*
 * Used as a pseudo hook for trial ending. We could use payment_failed, but that hook is sent 1 hr after this one
 */

export default async function customerSubscriptionUpdated(subscriptionId, oldStatus) {
  const r = getRethink();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const {metadata: {orgId}, status} = subscription;
  const now = new Date();
  if (oldStatus === 'trialing' && status === 'active') {
    // their trial probably just expired. if they have a CC, we know they converted
    const creditCard = await r.table('Organization').get(orgId)('creditCard').default(null);
    // they converted! (or someone was sending a phony event to our webhook)
    if (creditCard) return true;
    const orgDoc = await terminateSubscription(orgId);
    const userIds = orgDoc.orgUsers.reduce((billingLeaders, orgUser) => {
      if (orgUser.role === BILLING_LEADER) {
        billingLeaders.push(orgUser.id);
      }
      return billingLeaders;
    }, []);
    await r.table('Notification').insert({
      id: shortid.generate(),
      type: TRIAL_EXPIRED,
      startAt: now,
      orgId,
      userIds,
      varList: [now]
    })
      .do(() => {
        return r.table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter({type: TRIAL_EXPIRES_SOON})
          .delete()
      })
  }
  return true;
}
