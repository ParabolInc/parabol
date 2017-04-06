import getRethink from 'server/database/rethinkDriver';
import stripe from 'server/billing/stripe';
import {ACTION_MONTHLY, TRIAL_PERIOD_DAYS} from 'server/utils/serverConstants';
import {fromEpochSeconds} from 'server/utils/epochTime';
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

  const creditCard = stripeToken ? getCCFromCustomer(customer) : {};
  const {id: stripeId} = customer;
  const {id: stripeSubscriptionId, current_period_end, current_period_start} =
    await stripe.subscriptions.create({
      customer: stripeId,
      metadata: {
        orgId
      },
      plan: ACTION_MONTHLY,
      quantity: 1,
      // if a payment token is provided, this isn't a trial
      trial_period_days: stripeToken ? 0 : TRIAL_PERIOD_DAYS
    });

  return r.table('Organization').insert({
    id: orgId,
    creditCard,
    createdAt: now,
    name: orgName,
    orgUsers: [{id: leaderUserId, role: BILLING_LEADER, inactive: false}],
    stripeId,
    stripeSubscriptionId,
    updatedAt: now,
    periodEnd: fromEpochSeconds(current_period_end),
    periodStart: fromEpochSeconds(current_period_start),
  }, {returnChanges: true})('changes')(0)('new_val')
    .run();
}
