import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {getOldVal} from '../../utils/utils'
import {PAYMENT_REJECTED, TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';
import ms from 'ms';

export default async function handleFailedPayment(customerId) {
  const r = getRethink();
  const customer = await stripe.customers.retrieve(customerId);
  const {metadata: {orgId}} = customer;
  const now = new Date();

  // flag teams as unpaid
  const orgRes = await r.table('Team')
    .getAll(orgId, {index: 'orgId'})
    .update({
      isPaid: false
    })
    // don't adjust isTrial since we need that for the front-end callout
    .do(() => {
      return r.table('Organization')
        .get(orgId)
        .replace((row) => row.without('stripeSubscriptionId'), {returnChanges: true});
    });
  const orgDoc = getOldVal(orgRes);
  const userIds = orgDoc.orgUsers.map(({id}) => id);
  if (orgDoc.isTrial) {
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
    const {last4, brand} = orgDoc.creditCard || {};
    await r.table('Notification').insert({
      id: shortid.generate(),
      type: PAYMENT_REJECTED,
      startAt: now,
      orgId,
      userIds,
      varList: [last4, brand]
    });
  }
  // stripe already does this for us (per account settings)
  // await stripe.subscriptions.del(orgDoc.stripeSubscriptionId);
  return true;
}
