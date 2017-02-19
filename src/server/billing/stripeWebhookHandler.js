import stripe from 'server/billing/stripe';
import paymentFailed from './handlers/paymentFailed';
import customerSourceUpdated from './handlers/customerSourceUpdated';
import invoiceItemCreated from './handlers/invoiceItemCreated';
import invoiceCreated from './handlers/invoiceCreated';
import customerSubscriptionUpdated from './handlers/customerSubscriptionUpdated';

export default async function stripeWebhookHandler(req, res) {
  const event = req.body;
  const {type} = event;
  const objectId = event.data.object.id;
  let success = true;
  console.log('webhook received', type, objectId);
  if (type === 'invoice.created') {
    success = await invoiceCreated(objectId);
  } else if (type === 'invoiceitem.created') {
    success = await invoiceItemCreated(objectId);
  } else if (type === 'customer.source.updated') {
    const customerId = event.data.object.customer;
    success = await customerSourceUpdated(objectId, customerId);
  } else if (type === 'invoice.payment_failed') {
    const subscriptionId = event.data.object.subscription;
    success = await paymentFailed(subscriptionId);
  } else if (type === 'customer.subscription.updated') {
    const oldStatus = event.data.previous_attributes.status;
    success = await customerSubscriptionUpdated(objectId, oldStatus);
  }
  res.sendStatus(200);
  // if (!success) {
    // TODO report to server logs
  // }
};
