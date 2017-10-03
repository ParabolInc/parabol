import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import getCCFromCustomer from 'server/graphql/mutations/helpers/getCCFromCustomer';


export default {
  name: 'StripeUpdateCreditCard',
  description: 'When stripe tells us a credit card was updated, update the details in our own DB',
  type: GraphQLBoolean,
  args: {
    customerId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe customer ID, or stripeId'
    }
  },
  resolve: async (source, {customerId}, {serverSecret}) => {
    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Don’t be rude.');
    }
    const r = getRethink();
    const customer = await stripe.customers.retrieve(customerId);
    const creditCard = getCCFromCustomer(customer);
    const {metadata: {orgId}} = customer;
    await r.table('Organization').get(orgId)
      .update({creditCard});
    return true;
  }
};
