export default (invoiceItemId, customer, subscription) => ({
  created: 1326853478,
  livemode: false,
  id: 'evt_00000000000000',
  type: 'invoiceitem.created',
  object: 'event',
  request: null,
  pending_webhooks: 1,
  api_version: '2016-10-19',
  data: {
    object: {
      id: invoiceItemId,
      object: 'invoiceitem',
      amount: -500,
      currency: 'usd',
      customer,
      date: 1488299133,
      description: 'Unused time on Parabol Monthly Subscription after 28 Feb 2017',
      discountable: false,
      invoice: null,
      livemode: false,
      metadata: {},
      period: [Object],
      plan: [Object],
      proration: true,
      quantity: 1,
      subscription,
      subscription_item: 'si_00000000000000'
    }
  }
});
