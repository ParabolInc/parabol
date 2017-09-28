import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {InvoiceConnection} from 'server/graphql/types/Invoice';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import {UPCOMING} from 'universal/utils/constants';
import {forwardConnectionArgs} from 'graphql-relay';
import makeUpcomingInvoice from 'server/graphql/queries/helpers/makeUpcomingInvoice';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';

export default {
  type: InvoiceConnection,
  args: {
    ...forwardConnectionArgs,
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the organization'
    },
  },
  async resolve(source, {orgId, first, after}, {authToken}) {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    // RESOLUTION
    const {stripeId, stripeSubscriptionId} = await r.table('Organization')
      .get(orgId)
      .pluck('stripeId', 'stripeSubscriptionId');
    const dbAfter = after || r.minval;
    const {tooManyInvoices, upcomingInvoice} = await resolvePromiseObj({
      tooManyInvoices: r.table('Invoice')
        .between([orgId, dbAfter], [orgId, r.maxval], {index: 'orgIdStartAt', leftBound: 'open'})
        .orderBy(r.desc('startAt'))
        // remove upcoming invoices
        .filter((invoice) => invoice('status').ne(UPCOMING).and(invoice('total').ne(0)))
        .limit(first + 1),
      upcomingInvoice: after ? Promise.resolve(undefined) : makeUpcomingInvoice(orgId, stripeId, stripeSubscriptionId)
    });

    const allInvoices = upcomingInvoice ? [upcomingInvoice].concat(tooManyInvoices) : tooManyInvoices;
    const nodes = allInvoices.slice(first);
    const edges = nodes.map((node) => ({
      cursor: node.startAt,
      node
    }));
    const firstEdge = edges[0];
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        hasNextPage: allInvoices.length > nodes.length
      }
    };
  }
}