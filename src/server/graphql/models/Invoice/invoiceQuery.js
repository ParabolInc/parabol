import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLList
} from 'graphql';
import {Invoice} from './invoiceSchema';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import {UPCOMING} from 'universal/utils/constants';
import stripe from 'server/billing/stripe';
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
        return r.table('Invoice')
          .get(invoiceId)
          .run();
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
      // after: {type: GraphQLString, description: 'the cursor coming from the front'},
      // purposefully ignore pagination until we get cashay working correctly
      count: {type: GraphQLInt, description: 'Limit the invoices from the front'},
    },
    async resolve(source, {orgId, count}, {authToken}) {
      const r = getRethink();

      // AUTH
      const userId = getUserId(authToken);
      const userOrgDoc = await getUserOrgDoc(userId, orgId);
      requireOrgLeader(userOrgDoc);

      // RESOLUTION

      // if (after) {
      //   const dbAfter = after === 0 ? r.minval : after;
      //   return r.table('Invoice')
      //     .between([orgId, dbAfter], [orgId, r.maxval], {index: 'orgIdStartAt', leftBound: 'open'})
      //     .orderBy(r.desc('startAt'))
      //     .limit(count)
      //     .merge((doc) => ({
      //       cursor: doc('startAt')
      //     }));
      // }
      return r.table('Invoice')
        .between([orgId, r.minval], [orgId, r.maxval], {index: 'orgIdStartAt', leftBound: 'open'})
        .orderBy(r.desc('startAt'))
        // remove upcoming & trial invoices
        .filter((invoice) => invoice('status').ne(UPCOMING).and(invoice('total').ne(0)))
        .limit(count)
        .run();
    }
  }
};
