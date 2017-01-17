import stripe from 'stripe';
import getRethink from 'server/database/rethinkDriver';

export default async function handleInvoiceCreated(invoiceId) {
  const r = getRethink();

  // big picture: create our own personal invoice
  // group each invoice item by metadata.userId, metadata.type, period.start
  // verify that there are exactly 2 items in each group
  // map over the group turning them into 1 item -> reducedItem
  // group by userId, type, results in an array of eg PAUSED_USER types for a particular user
  // for ADD, REMOVE, and UNAPUSE where UNPAUSE[0] < PAUSE[0] || Infinity, create a line item
  // for each PAUSED_USER[i] link it with UNPAUSE[i]. shift both
  // if UNAPUSE.length, create another item
  // sort the new array by start
  const invoice = await stripe.invoices.retrieve(invoiceId);
  const customer = await stripe.customers.retrieve(invoice.customer);
  const {current_period_start: startAt, current_period_end: endAt, metadata: {orgId}} = customer;
  await r.table('InvoiceItemHook')
    .between([startAt, orgId], [endAt, orgId])
  const lineItems = invoice.lines.data;
  const invoiceLineItems = [];
  for (let i = 0; i < lineItems.length; i++) {
    const lineItem = lineItems[i];
    const {type, userId} = lineItem.metadata;
    if (!userId) {
      // this must be the next month's charge
      invoiceLineItems.push({
        id: shortid.generate()
      })
    }
  }
  // r.db('actionDevelopment').table('User').getAll(r.args(ids), {index: 'id'}).pluck('id', 'email')

  const cards = customer.sources.data;
  const card = cards.find((card) => card.id === cardId);
  if (!card) return undefined;
  const {brand, last4, exp_month: expMonth, exp_year: expYear} = card;
  const expiry = `${expMonth}/${expYear.substr(2)}`;
  await r.table('Organization').get(orgId)
    .update({
      creditCard: {
        brand,
        last4,
        expiry
      },
    });
  return undefined;
}
