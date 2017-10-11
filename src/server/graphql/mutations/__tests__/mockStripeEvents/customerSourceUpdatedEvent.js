export default (stripeId) => ({
  created: 1326853478,
  livemode: false,
  id: 'evt_00000000000000',
  type: 'customer.source.updated',
  object: 'event',
  request: null,
  pending_webhooks: 1,
  api_version: '2016-10-19',
  data: {
    object: {
      id: 'card_00000000000000',
      object: 'card',
      address_city: null,
      address_country: null,
      address_line1: null,
      address_line1_check: null,
      address_line2: null,
      address_state: null,
      address_zip: null,
      address_zip_check: null,
      brand: 'Visa',
      country: 'US',
      customer: stripeId,
      cvc_check: 'unchecked',
      dynamic_last4: null,
      exp_month: 1,
      exp_year: 2020,
      funding: 'unknown',
      last4: '1111',
      metadata: {},
      name: null,
      tokenization_method: null
    },
    previous_attributes: {exp_year: '2013'}
  }
});
