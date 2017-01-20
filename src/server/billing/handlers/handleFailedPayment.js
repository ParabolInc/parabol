import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {PAYMENT_REJECTED, TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';
import ms from 'ms';

export default async function handleFailedPayment(customerId) {
  const r = getRethink();
  const customer = await stripe.customers.retrieve(customerId);
  const {metadata: {orgId}} = customer;
  const now = new Date();

  // flag teams as unpaid
  const orgPromise = r.table('Team')
    .getAll(orgId, {index: 'orgId'})
    .update({
      isPaid: false
    })
    // keep isTrial true since we'll use that for the callout
    .do(() => {
      return r.table('Organization').get(orgId)
    });
  const userPromise = r.table('User').getAll(orgId, {index: 'billingLeaderOrgs'})('id');
  const [orgDoc, userIds] = await Promise.all([orgPromise, userPromise]);
  const parentId = shortid.generate();
  if (orgDoc.isTrial) {
    const notifications = userIds.map((userId) => ({
      id: shortid.generate(),
      parentId,
      type: TRIAL_EXPIRED,
      startAt: now,
      endAt: new Date(now.getTime() + ms('10y')),
      orgId,
      userId,
      // trialExpiresAt
      varList: [now]
    }));
    await r.table('Notification').insert(notifications)
      .do(() => {
        return r.table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter({TRIAL_EXPIRES_SOON})
          .delete()
      })
  } else {
    const {last4, brand} = orgDoc.creditCard || {};
    const notifications = userIds.map((userId) => ({
      id: shortid.generate(),
      parentId,
      type: PAYMENT_REJECTED,
      startAt: now,
      endAt: new Date(now.getTime() + ms('10y')),
      orgId,
      userId,
      varList: [last4, brand]
    }));
    await r.table('Notification').insert(notifications);
    return true;
  }
}
