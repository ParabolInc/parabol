import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} from 'graphql';
import {Invoice} from './invoiceSchema';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import {UPCOMING} from 'universal/utils/constants';
import stripe from 'server/billing/stripe';
import {fromEpochSeconds} from 'server/utils/epochTime';
import fetchAllLines from 'server/billing/helpers/fetchAllLines';
import generateInvoice from 'server/billing/helpers/generateInvoice';
import {UPCOMING_INVOICE_TIME_VALID} from 'server/utils/serverConstants';

export default {
  invoiceDetails: {
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
        const stripeId = await r.table('Organization').get(orgId)('stripeId');
        const stripeLineItems = await fetchAllLines('upcoming', stripeId);
        const upcomingInvoice = await stripe.invoices.retrieveUpcoming(stripeId);
        await generateInvoice(upcomingInvoice, stripeLineItems, orgId, invoiceId);
        return await r.table('Invoice').get(invoiceId);
      }
      return currentInvoice;
    }
  },
  invoiceList: {
    type: new GraphQLList(new GraphQLNonNull(Invoice)),
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the organization'
      },
      after: {type: GraphQLString, description: 'the cursor coming from the front'},
      first: {type: GraphQLInt, description: 'Limit the invoices from the front'},
    },
    async resolve(source, {orgId, after, first}, {authToken}) {
      const r = getRethink();

      // AUTH
      const userId = getUserId(authToken);
      const userOrgDoc = await getUserOrgDoc(userId, orgId);
      requireOrgLeader(userOrgDoc);

      // RESOLUTION

      if (after) {
        const dbAfter = after === 0 ? r.minval : after;
        return r.table('Invoice')
          .between([orgId, dbAfter], [orgId, r.maxval], {index: 'orgIdStartAt', leftBound: 'open'})
          .orderBy(r.desc('startAt'))
          .limit(first)
          .merge((doc) => ({
            cursor: doc('startAt')
          }));
      }
      const stripeId = await r.table('Organization').get(orgId)('stripeId');
      const promises = [
        stripe.invoices.retrieveUpcoming(stripeId),
        r.table('Invoice')
          .between([orgId, r.minval], [orgId, r.maxval], {index: 'orgIdStartAt', leftBound: 'open'})
          .orderBy(r.desc('startAt'))
          .limit(first - 1)
          .merge((doc) => ({
            cursor: doc('startAt')
          }))
      ];
      const [stripeInvoice, pastInvoices] = await Promise.all(promises);
      const upcomingInvoice = {
        id: `upcoming_${orgId}`,
        amountDue: stripeInvoice.amount_due,
        cursor: 0,
        total: stripeInvoice.total,
        endAt: fromEpochSeconds(stripeInvoice.period_end),
        invoiceDate: fromEpochSeconds(stripeInvoice.date),
        orgId,
        startAt: fromEpochSeconds(stripeInvoice.period_start),
        startingBalance: stripeInvoice.startingBalance,
        status: UPCOMING
      };
      return [
        upcomingInvoice,
        ...pastInvoices
      ];
    }
  }
};
