import stripe from 'server/billing/stripe';
import handleFailedPayment from './handlers/handleFailedPayment';
import handleUpdatedSource from './handlers/handleUpdatedSource';
import handleInvoiceItemCreated from './handlers/handleInvoiceItemCreated';
import handleInvoiceCreated from './handlers/handleInvoiceCreated';

export default async function stripeWebhookHandler(req, res) {
  const event = req.body;
  const {type} = event;
  const objectId = event.data.object.id;
  let success;
  if (type === 'invoice.created') {
    success = await handleInvoiceCreated(objectId);
  } else if (type === 'invoiceitem.created') {
    success = await handleInvoiceItemCreated(objectId);
  } else if (type === 'customer.source.updated') {
    const customerId = event.data.object.customer;
    success = await handleUpdatedSource(objectId, customerId);
  } else if (type === 'invoice.payment_failed') {
    success = await handleFailedPayment(objectId);
  }
  if (success) {
    res.sendStatus(200);
  }
};
