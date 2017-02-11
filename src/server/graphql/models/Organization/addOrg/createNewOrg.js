import getRethink from 'server/database/rethinkDriver';
import stripe from 'server/billing/stripe';
import {ACTION_MONTHLY, TRIAL_PERIOD_DAYS} from 'server/utils/serverConstants';
import {fromStripeDate} from 'server/billing/stripeDate';
import {BILLING_LEADER} from 'universal/utils/constants';
import getCCFromCustomer from 'server/graphql/models/Organization/addBilling/getCCFromCustomer';

export default async function createNewOrg(orgId, orgName, leaderUserId, stripeToken) {
  const r = getRethink();
  const now = new Date();

  const customer = await stripe.customers.create({
    source: stripeToken,
    metadata: {
      orgId
    }
  });

  const creditCard = stripeToken && getCCFromCustomer(customer);
  const {id: stripeId} = customer;
  const {id: stripeSubscriptionId, current_period_end} = await stripe.subscriptions.create({
    customer: stripeId,
    metadata: {
      orgId
    },
    plan: ACTION_MONTHLY,
    // if a payment token is provided, this isn't a trial
    trial_period_days: stripeToken ? 0 : TRIAL_PERIOD_DAYS
  });
  const validUntil = fromStripeDate(current_period_end);

  return await r.table('Organization').insert({
    id: orgId,
    creditCard,
    createdAt: now,
    isTrial: true,
    name: orgName,
    orgUsers: [{ id: leaderUserId, role: BILLING_LEADER}],
    stripeId,
    stripeSubscriptionId,
    updatedAt: now,
    validUntil
  }, {returnChanges: true})('changes')(0)('new_val');
}
