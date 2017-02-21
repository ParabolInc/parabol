import invoicePaymentFailed from './handlers/invoicePaymentFailed';
import customerSourceUpdated from './handlers/customerSourceUpdated';
import invoiceItemCreated from './handlers/invoiceItemCreated';
import invoiceCreated from './handlers/invoiceCreated';
import customerSubscriptionUpdated from './handlers/customerSubscriptionUpdated';
import invoicePaymentSucceeded from './handlers/invoicePaymentSucceeded';

export default async function stripeWebhookHandler(req, res) {
  const event = req.body;
  const {type} = event;
  const objectId = event.data.object.id;
  console.log('webhook received', type, objectId);
  try {
    if (type === 'invoice.created') {
      await invoiceCreated(objectId);
    } else if (type === 'invoiceitem.created') {
      await invoiceItemCreated(objectId);
    } else if (type === 'customer.source.updated') {
      const customerId = event.data.object.customer;
      await customerSourceUpdated(objectId, customerId);
    } else if (type === 'invoice.payment_failed') {
      await invoicePaymentFailed(objectId);
    } else if (type === 'invoice.payment_succeeded') {
      await invoicePaymentSucceeded(objectId);
    } else if (type === 'customer.subscription.updated') {
      const oldStatus = event.data.previous_attributes.status;
      await customerSubscriptionUpdated(objectId, oldStatus);
    }
  } catch (e) {
    console.log(`Webhook error for ${type}: ${e}`);
    // TODO report to server logs
  } finally {
    res.sendStatus(200);
  }
};
