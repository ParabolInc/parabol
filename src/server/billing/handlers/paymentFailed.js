import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {BILLING_LEADER, PAYMENT_REJECTED} from 'universal/utils/constants';
import terminateSubscription from 'server/billing/helpers/terminateSubscription';

/*
 * Used for failed payments that are not trialing. Trialing orgs will not have a CC
 */
export default async function paymentFailed(subscriptionId) {
  const r = getRethink();
  const now = new Date();

  const {metadata: {orgId}} = await stripe.subscriptions.retrieve(subscriptionId);
  const creditCard = await r.table('Organization').get(orgId)('creditCard').default(null);
  // this must have not been a trial (or it was and they entered a card that got invalidated <1 hr after entering it)
  if (creditCard) {
    const orgDoc = await terminateSubscription(orgId);
    const userIds = orgDoc.orgUsers.reduce((billingLeaders, orgUser) => {
      if (orgUser.role === BILLING_LEADER) {
        billingLeaders.push(orgUser.id);
      }
      return billingLeaders;
    }, []);
    const {last4, brand} = creditCard;
    await r.table('Notification').insert({
      id: shortid.generate(),
      type: PAYMENT_REJECTED,
      startAt: now,
      orgId,
      userIds,
      varList: [last4, brand]
    });
    // stripe already does this for us (per account settings) but we do it here so we don't have to wait an hour
    await stripe.subscriptions.del(orgDoc.stripeSubscriptionId);
  }
  return true;
}
