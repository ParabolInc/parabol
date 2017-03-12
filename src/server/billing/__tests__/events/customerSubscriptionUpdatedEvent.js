export default {
  created: 1326853478,
  livemode: false,
  id: 'evt_00000000000000',
  type: 'customer.subscription.updated',
  object: 'event',
  request: null,
  pending_webhooks: 1,
  api_version: '2016-10-19',
  data: {
    object: {
      id: 'sub_00000000000000',
      object: 'subscription',
      application_fee_percent: null,
      cancel_at_period_end: false,
      canceled_at: null,
      created: 1488909033,
      current_period_end: 1491501033,
      current_period_start: 1488909033,
      customer: 'cus_00000000000000',
      discount: null,
      ended_at: null,
      items: [Object],
      livemode: false,
      metadata: [Object],
      plan: [Object],
      quantity: 1,
      start: 1488909033,
      status: 'trialing',
      tax_percent: null,
      trial_end: 1491501033,
      trial_start: 1488909033
    },
    previous_attributes: {
      plan: {
        id: 'OLD_PLAN_ID',
        object: 'plan',
        amount: 19999900,
        created: 1486937722,
        currency: 'usd',
        interval: 'month',
        interval_count: 1,
        livemode: false,
        metadata: {},
        name: 'Old plan',
        statement_descriptor: null,
        // Matt added this one
        status: 'trialing',
        trial_period_days: null
      }
    }
  }
};
