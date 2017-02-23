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

      // AUTH
      const userId = getUserId(authToken);
      const invoice = await r.table('Invoice').get(invoiceId);
      const {orgId} = invoice;
      const userOrgDoc = await getUserOrgDoc(userId, orgId);
      requireOrgLeader(userOrgDoc);

      // RESOLUTION
      return invoice;
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
      first: {type: GraphQLInt, description: "Limit the invoices from the front"},
    },
    async resolve(source, {orgId, after, first}, {authToken}) {
      const r = getRethink();

      // AUTH
      const userId = getUserId(authToken);
      const userOrgDoc = await getUserOrgDoc(userId, orgId);
      requireOrgLeader(userOrgDoc);

      // RESOLUTION

      if (after) {
        return r.table('Invoice')
          .between([orgId, after], [orgId, r.maxval], {index: 'orgIdStartAt', leftBound: 'open'})
          .orderBy(r.desc('startAt'))
          .limit(first)
          .merge((doc) => ({
            cursor: doc('startAt')
          }))
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
        id: `in_${stripeInvoice.date}`,
        amountDue: stripeInvoice.amount_due,
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
