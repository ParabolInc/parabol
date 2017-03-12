import invoicePaymentFailed from './handlers/invoicePaymentFailed';
import customerSourceUpdated from './handlers/customerSourceUpdated';
import invoiceItemCreated from './handlers/invoiceItemCreated';
import invoiceCreated from './handlers/invoiceCreated';
import customerSubscriptionUpdated from './handlers/customerSubscriptionUpdated';
import invoicePaymentSucceeded from './handlers/invoicePaymentSucceeded';

export default (exchange) => async function stripeWebhookHandler(req, res) {
  // code defensively here because anyone can call this endpoint
  const event = req.body || {};
  const {data = {}, type} = event;
  const dataObject = data.object || {};
  const objectId = dataObject.id;
  console.log('webhook received', type, objectId);
  try {
    if (type === 'invoice.created') {
      await invoiceCreated(objectId);
    } else if (type === 'invoiceitem.created') {
      await invoiceItemCreated(objectId);
    } else if (type === 'customer.source.updated') {
      const customerId = dataObject.customer;
      await customerSourceUpdated(customerId);
    } else if (type === 'invoice.payment_failed') {
      await invoicePaymentFailed(objectId);
    } else if (type === 'invoice.payment_succeeded') {
      await invoicePaymentSucceeded(objectId);
    } else if (type === 'customer.subscription.updated') {
      const oldStatus = data.previous_attributes && data.previous_attributes.status;
      await customerSubscriptionUpdated(objectId, oldStatus, exchange);
    }
  } catch (e) {
    console.log(`Webhook error for ${type}`);
    throw e;
    // TODO report to server logs
  } finally {
    res.sendStatus(200);
  }
};
