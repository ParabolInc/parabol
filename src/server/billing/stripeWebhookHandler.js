import stripe from 'stripe';
import handleFailedPayment from './handlers/handleFailedPayment';

export default async function stripeWebhookHandler(req, res) {
  const event = req.body;
  const {type} = event;
  const objectId = event.data.object.id;
  if (type === 'invoice.created') {
    // request the object from stripe since the one sent to us could be a fake
    const invoiceId = event.data.object.id;
    const invoice = await stripe.invoices.retrieve(invoiceId);
    if (invoice.total === 0) {
      // it's probably a trial


    }

  } else if (event === 'customer.source.updated') {

  } else if (event === 'invoice.payment_failed') {
    await handleFailedPayment(objectId);
  }
  res.sendStatus(200);
};
