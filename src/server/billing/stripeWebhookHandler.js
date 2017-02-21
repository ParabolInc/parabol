import stripe from 'server/billing/stripe';
import invoicePaymentFailed from './handlers/invoicePaymentFailed';
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
  try {

    if (type === 'invoice.created') {
      success = await invoiceCreated(objectId);
    } else if (type === 'invoiceitem.created') {
      success = await invoiceItemCreated(objectId);
    } else if (type === 'customer.source.updated') {
      const customerId = event.data.object.customer;
      success = await customerSourceUpdated(objectId, customerId);
    } else if (type === 'invoice.payment_failed') {
      success = await invoicePaymentFailed(objectId);
    } else if (type === 'invoice.payment_failed') {
      success = await invoicePaymentSucceeded(objectId);
    } else if (type === 'customer.subscription.updated') {
      const oldStatus = event.data.previous_attributes.status;
      success = await customerSubscriptionUpdated(objectId, oldStatus);
    }
  } catch(e) {
    console.log(`Webhook error for ${type}: ${e}`);
    // TODO report to server logs
  } finally {
    res.sendStatus(200);
  }
};
