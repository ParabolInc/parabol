import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import {errorObj} from 'server/utils/utils';
import {PAID} from 'universal/utils/constants';


export default {
  name: 'StripeSucceedPayment',
  description: 'When stripe tells us an invoice payment was successful, update it in our DB',
  type: GraphQLBoolean,
  args: {
    invoiceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe invoice ID'
    }
  },
  resolve: async (source, {invoiceId}, {serverSecret}) => {
    const r = getRethink();
    const now = new Date();

    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Don’t be rude.');
    }

    // VALIDATION
    const {customer: customerId} = await stripe.invoices.retrieve(invoiceId);
    const {metadata: {orgId}} = await stripe.customers.retrieve(customerId);
    const org = await r.table('Organization').get(orgId);
    if (!org) {
      throw errorObj({_error: `Payment cannot succeed. Org ${orgId} does not exist for invoice ${invoiceId}`});
    }
    const {creditCard} = org;

    // RESOLUTION
    await r.table('Invoice').get(invoiceId).update({
      creditCard,
      paidAt: now,
      status: PAID
    });
  }
};
