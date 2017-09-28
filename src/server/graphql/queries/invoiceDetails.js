import {GraphQLID, GraphQLNonNull} from 'graphql';
import fetchAllLines from 'server/billing/helpers/fetchAllLines';
import generateInvoice from 'server/billing/helpers/generateInvoice';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import {UPCOMING_INVOICE_TIME_VALID} from 'server/utils/serverConstants';
import Invoice from 'server/graphql/types/Invoice';

export default {
  type: Invoice,
  args: {
    invoiceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the invoice'
    }
  },
  async resolve(source, {invoiceId}, {authToken}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    const userId = getUserId(authToken);
    const [type, maybeOrgId] = invoiceId.split('_');
    const isUpcoming = type === 'upcoming';
    const currentInvoice = await r.table('Invoice').get(invoiceId).default(null);
    const orgId = currentInvoice && currentInvoice.orgId || maybeOrgId;
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    // RESOLUTION
    if (isUpcoming) {
      // console.log('currentInvoice', currentInvoice, currentInvoice && 'foo', currentInvoice && currentInvoice.foo);
      // try using a recently cached version
      if (currentInvoice && currentInvoice.createdAt.getTime() + UPCOMING_INVOICE_TIME_VALID > now) {
        return currentInvoice;
      }
      const {stripeId, stripeSubscriptionId} = await r.table('Organization').get(orgId)
        .pluck('stripeId', 'stripeSubscriptionId');
      const stripeLineItems = await fetchAllLines('upcoming', stripeId);
      const upcomingInvoice = await stripe.invoices.retrieveUpcoming(stripeId, {subscription: stripeSubscriptionId});
      await generateInvoice(upcomingInvoice, stripeLineItems, orgId, invoiceId);
      return r.table('Invoice')
        .get(invoiceId)
        .run();
    }
    return currentInvoice;
  }
};
