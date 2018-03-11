import {GraphQLID, GraphQLNonNull} from 'graphql';
import generateUpcomingInvoice from 'server/billing/helpers/generateUpcomingInvoice';
import getRethink from 'server/database/rethinkDriver';
import Invoice from 'server/graphql/types/Invoice';
import {getUserId, getUserOrgDoc, sendOrgLeadAccessError} from 'server/utils/authorization';
import {UPCOMING_INVOICE_TIME_VALID} from 'server/utils/serverConstants';
import isBillingLeader from 'server/graphql/queries/isBillingLeader';

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
    if (!isBillingLeader(userOrgDoc)) return sendOrgLeadAccessError(authToken, userOrgDoc, null);

    // RESOLUTION
    if (!isUpcoming || (currentInvoice && currentInvoice.createdAt.getTime() + UPCOMING_INVOICE_TIME_VALID > now)) {
      return currentInvoice;
    }
    return generateUpcomingInvoice(orgId);
  }
};
