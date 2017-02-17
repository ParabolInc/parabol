import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {BILLING_LEADER, PAYMENT_REJECTED, TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';

export default async function handleFailedPayment(customerId) {
  const r = getRethink();
  const customer = await stripe.customers.retrieve(customerId);
  const {metadata: {orgId}} = customer;
  const now = new Date();

  // flag teams as unpaid
  const orgDoc = await r.table('Team')
    .getAll(orgId, {index: 'orgId'})
    .update({
      isPaid: false
    })
    .do(() => {
      return r.table('Organization')
        .get(orgId)
        .replace((row) => row.without('stripeSubscriptionId'), {returnChanges: true});
    })('changes')(0)('old_val');
  const userIds = orgDoc.orgUsers.reduce((billingLeaders, orgUser) => {
    if (orgUser.role === BILLING_LEADER) {
      billingLeaders.push(orgUser.id);
    }
    return billingLeaders;
  }, []);

  if (!orgDoc.creditCard) {
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
          .filter({TRIAL_EXPIRES_SOON})
          .delete()
      })
  } else {
    const {last4, brand} = orgDoc.creditCard;
    await r.table('Notification').insert({
      id: shortid.generate(),
      type: PAYMENT_REJECTED,
      startAt: now,
      orgId,
      userIds,
      varList: [last4, brand]
    });
  }
  // stripe already deletes the subscription so we're good
  // await stripe.subscriptions.del(orgDoc.stripeSubscriptionId);
  return true;
}
