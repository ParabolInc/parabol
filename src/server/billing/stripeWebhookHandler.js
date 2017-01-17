import stripe from 'stripe';
import handleFailedPayment from './handlers/handleFailedPayment';
import handleUpdatedSource from './handlers/handleUpdatedSource';
import handleInvoiceItemCreated from './handlers/handleInvoiceItemCreated';
import handleInvoiceCreated from './handlers/handleInvoiceCreated';

export default async function stripeWebhookHandler(req, res) {
  const event = req.body;
  const {type} = event;
  const objectId = event.data.object.id;
  if (type === 'invoice.created') {
    await handleInvoiceCreated(objectId);
  } else if (type === 'invoiceitem.created') {
    await handleInvoiceItemCreated(objectId);
  } else if (type === 'customer.source.updated') {
    const customerId = event.data.object.customer;
    await handleUpdatedSource(objectId, customerId);
  } else if (type === 'invoice.payment_failed') {
    await handleFailedPayment(objectId);
  }
  res.sendStatus(200);
};
