import {GraphQLID, GraphQLNonNull} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import makeUpcomingInvoice from 'server/graphql/queries/helpers/makeUpcomingInvoice';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {InvoiceConnection} from 'server/graphql/types/Invoice';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import {UPCOMING} from 'universal/utils/constants';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';

export default {
  type: InvoiceConnection,
  args: {
    ...forwardConnectionArgs,
    after: {
      type: GraphQLISO8601Type,
      description: 'the datetime cursor'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the organization'
    }
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
    const dbAfter = after ? new Date(after) : r.maxval;
    const {tooManyInvoices, upcomingInvoice} = await resolvePromiseObj({
      tooManyInvoices: r.table('Invoice')
        .between([orgId, r.minval], [orgId, dbAfter], {index: 'orgIdStartAt', leftBound: 'open'})
        .filter((invoice) => invoice('status').ne(UPCOMING).and(invoice('total').ne(0)))
        .orderBy(r.desc('startAt'))
        .limit(first + 1),
      upcomingInvoice: after ? Promise.resolve(undefined) : makeUpcomingInvoice(orgId, stripeId, stripeSubscriptionId)
    });

    const allInvoices = upcomingInvoice ? [upcomingInvoice].concat(tooManyInvoices) : tooManyInvoices;
    const nodes = allInvoices.slice(0, first);
    const edges = nodes.map((node) => ({
      cursor: node.startAt,
      node
    }));
    const firstEdge = edges[0];
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        endCursor: firstEdge && edges[edges.length - 1].cursor,
        hasNextPage: allInvoices.length > nodes.length
      }
    };
  }
};
