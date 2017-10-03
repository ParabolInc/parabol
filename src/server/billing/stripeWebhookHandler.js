import schema from 'server/graphql/rootSchema';
import {graphql} from 'graphql';

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
        mutation StripeUpdateInvoiceItem($invoiceId: ID!) {
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
        mutation StripeUpdateCreditCard($invoiceId: ID!) {
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

export default async function stripeWebhookHandler(req, res) {
  // TODO refactor using stripes newish secret hashes
  res.sendStatus(200);
  if (!req.body || !req.body.data || !req.body.type || !req.body.data.object) return;

  const {data: {object: payload}, type} = req.body;
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
    console.log('GITHUB GraphQL Error:', result.errors);
  }
};
