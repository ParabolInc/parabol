import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';

export default {
  name: 'StripeUpdateInvoiceItem',
  description: 'When a new invoiceitem is sent from stripe, tag it with metadata',
  type: GraphQLBoolean,
  args: {
    invoiceItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe invoice ID'
    }
  },
  resolve: async (source, {invoiceItemId}, {serverSecret}) => {
    const r = getRethink();

    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Don’t be rude.');
    }

    const invoiceItem = await stripe.invoiceItems.retrieve(invoiceItemId);
    const {subscription, period: {start}} = invoiceItem;
    const hook = await r.table('InvoiceItemHook')
      .getAll(start, {index: 'prorationDate'})
      .filter({stripeSubscriptionId: subscription})
      .nth(0)
      .default(null);

    if (!hook) return false;

    const {type, userId} = hook;
    await stripe.invoiceItems.update(invoiceItemId, {
      metadata: {
        type,
        userId
      }
    });
    return true;
  }
};
