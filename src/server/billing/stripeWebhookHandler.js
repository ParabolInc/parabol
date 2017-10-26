import schema from 'server/graphql/rootSchema';
import {graphql} from 'graphql';
import stripe from 'server/billing/stripe';

const eventLookup = {
  invoice: {
    created: {
      getVars: ({id: invoiceId}) => ({invoiceId}),
      query: `
        mutation StripeCreateInvoice($invoiceId: ID!) {
          stripeCreateInvoice(invoiceId: $invoiceId)
        }
      `
    },
    payment_failed: {
      getVars: ({id: invoiceId}) => ({invoiceId}),
      query: `
        mutation StripeFailPayment($invoiceId: ID!) {
          stripeFailPayment(invoiceId: $invoiceId)
        }
      `
    },
    payment_succeeded: {
      getVars: ({id: invoiceId}) => ({invoiceId}),
      query: `
        mutation StripeSucceedPayment($invoiceId: ID!) {
          stripeSucceedPayment(invoiceId: $invoiceId)
        }
      `
    }
  },
  invoiceitem: {
    created: {
      getVars: ({id: invoiceItemId}) => ({invoiceItemId}),
      query: `
        mutation StripeUpdateInvoiceItem($invoiceItemId: ID!) {
          stripeUpdateInvoiceItem(invoiceItemId: $invoiceItemId)
        }
      `
    }
  },
  customer: {
    source: {
      updated: {
        getVars: ({customer: customerId}) => ({customerId}),
        query: `
        mutation StripeUpdateCreditCard($customerId: ID!) {
          stripeUpdateCreditCard(customerId: $customerId)
        }
      `
      }
    }
  }
};

const splitType = (type = '') => {
  const names = type.split('.');
  return {
    event: names[0],
    subEvent: names.length === 3 ? names[1] : undefined,
    action: names[names.length - 1]
  };
};

const verifyBody = (req) => {
  const sig = req.get('stripe-signature');
  try {
    return stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return null;
  }
};

export default async function stripeWebhookHandler(req, res) {
  res.sendStatus(200);

  const verifiedBody = verifyBody(req);
  if (!verifiedBody) return;

  const {data: {object: payload}, type} = verifiedBody;
  const {event, subEvent, action} = splitType(type);

  const parentHandler = eventLookup[event];
  if (!parentHandler) return;

  const eventHandler = subEvent ? parentHandler[subEvent] : parentHandler;
  if (!eventHandler) return;

  const actionHandler = eventHandler[action];
  if (!actionHandler) return;

  const {getVars, query} = actionHandler;
  const variables = getVars(payload);
  const context = {serverSecret: process.env.AUTH0_CLIENT_SECRET};
  const result = await graphql(schema, query, {}, context, variables);
  if (result.errors) {
    console.log('Stripe GraphQL Error:', result.errors);
  }
};
