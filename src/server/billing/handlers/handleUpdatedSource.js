import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import {getNewVal} from '../../utils/utils';
import {ACTION_MONTHLY} from 'server/utils/serverConstants';
import {TRIAL_EXPIRED} from 'universal/utils/constants';

export default async function handleUpdatedSource(cardId, customerId) {
  const r = getRethink();
  const customer = await stripe.customers.retrieve(customerId);
  const {orgId} = customer.metadata;
  const cards = customer.sources.data;
  const card = cards.find((card) => card.id === cardId);
  if (!card) {
    console.warn(`No Credit card found! cardId: ${cardId}, customerId: ${customerId}`)
    return false;
  }
  const {brand, last4, exp_month: expMonth, exp_year: expYear} = card;
  const expiry = `${expMonth}/${expYear.substr(2)}`;
  const orgRes = await r.table('Organization').get(orgId)
    .update({
      creditCard: {
        brand,
        last4,
        expiry
      },
    }, {returnChanges: true});
  const {activeUsers, stripeSubscriptionId, stripeId} = getNewVal(orgRes);
  if (!stripeSubscriptionId) {
    // Their subscription was cancelled due to nonpayment, and they just updated payment. Let's make a new subscription for them!
    const {id: stripeSubscriptionId, period_end} = await stripe.subscriptions.create({
      customer: stripeId,
      metadata: {
        orgId
      },
      plan: ACTION_MONTHLY,
      quantity: activeUsers.length
    });
    // if this was a trial, make it legit now
    await r.table('Organization').get(orgId).update({
      stripeSubscriptionId,
      validUntil: period_end,
      isTrial: false
    })
      .do(() => {
        return r.table('Notification')
          .getAll(orgId, {index: orgId})
          .filter({type: TRIAL_EXPIRED})
          .delete()
      })
  }
  return true;
}
