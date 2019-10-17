exports.up = (r) => {
  const billingFields = ['stripeId', 'stripeSubscriptionId', 'periodEnd', 'periodStart']
  return r
    .table('Organization')
    .filter({tier: 'personal'})
    .replace((org) => org.without(...billingFields).merge({creditCard: {}}))
    .run()
}

exports.down = () => {
  // noop
}
