import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import {getOldVal} from 'server/graphql/models/utils';
import shortid from 'shortid';
import {PAYMENT_REJECTED, TRIAL_EXPIRED} from 'universal/utils/constants';

export default async function handleFailedPayment(invoiceId) {
  const r = getRethink();
  const invoice = await stripe.invoices.retrieve(invoiceId);
  const {metadata: {orgId}} = invoice;
  const now = new Date();

  // flag teams as unpaid
  const orgPromise = r.table('Team')
    .getAll(orgId, {index: 'orgId'})
    .update({
      isPaid: false
    })
    .do(() => {
      return r.table('Organization').get(orgId).update({
        isTrial: false
      }, {returnChanges: true})
    });
  const userPromise = r.table('User').getAll(orgId, {index: 'billingLeaderOrgs'})('id');
  const promises = [orgPromise, userPromise];
  const [orgRes, userIds] = await Promise.all(promises);
  const orgDoc = getOldVal(orgRes);
  const parentId = shortid.generate();
  if (orgDoc.isTrial) {
    const notifications = userIds.map((userId) => ({
      id: shortid.generate(),
      parentId,
      type: TRIAL_EXPIRED,
      trialExpiresAt: now,
      startAt: now,
      endAt: new Date(now.getTime() + ms('10y')),
      userId,
      orgId,
    }));
    await r.table('Notification').insert(notifications);
  } else {
    const {last4, brand} = orgDoc.creditCard || {};
    const errorMessage = last4 ? 'Credit card was declined' : 'Payment failed because no credit card is on file';
    const notifications = userIds.map((userId) => ({
      id: shortid.generate(),
      parentId,
      type: PAYMENT_REJECTED,
      errorMessage,
      brand,
      last4,
      startAt: now,
      endAt: new Date(now.getTime() + ms('10y')),
      userId,
      orgId,
    }));
    await r.table('Notification').insert(notifications);
    return true;
  }
}
