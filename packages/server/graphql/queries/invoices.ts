import {GraphQLID, GraphQLNonNull} from 'graphql'
import {forwardConnectionArgs} from 'graphql-relay'
import getRethink from '../../database/rethinkDriver'
import makeUpcomingInvoice from './helpers/makeUpcomingInvoice'
import GraphQLISO8601Type from '../types/GraphQLISO8601Type'
import {InvoiceConnection} from '../types/Invoice'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import {InvoiceStatusEnum} from 'parabol-client/types/graphql'

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
  async resolve(_source, {orgId, first, after}, {authToken, dataLoader}) {
    const r = await getRethink()

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
      // standardError(new Error('Not organization lead'), {userId: viewerId})
      return null
    }

    // RESOLUTION
    const {stripeId, stripeSubscriptionId} = await r
      .table('Organization')
      .get(orgId)
      .pluck('stripeId', 'stripeSubscriptionId')
      .run()
    const dbAfter = after ? new Date(after) : r.maxval
    const [tooManyInvoices, upcomingInvoice] = await Promise.all([
      r
        .table('Invoice')
        .between([orgId, r.minval], [orgId, dbAfter], {
          index: 'orgIdStartAt',
          leftBound: 'open',
          rightBound: 'closed'
        })
        .filter((invoice) =>
          invoice('status')
            .ne(InvoiceStatusEnum.UPCOMING)
            .and(invoice('total').ne(0))
        )
        // it's possible that stripe gives the same startAt to 2 invoices (the first $5 charge & the next)
        // break ties based on when created. In the future, we might want to consider using the created_at provided by stripe instead of our own
        .orderBy(r.desc('startAt'), r.desc('createdAt'))
        .limit(first + 1)
        .run(),
      after
        ? Promise.resolve(undefined)
        : makeUpcomingInvoice(orgId, stripeId, stripeSubscriptionId)
    ])
    const paginatedInvoices = after ? tooManyInvoices.slice(1) : tooManyInvoices
    const allInvoices = upcomingInvoice
      ? [upcomingInvoice].concat(paginatedInvoices)
      : paginatedInvoices
    const nodes = allInvoices.slice(0, first)
    const edges = nodes.map((node) => ({
      cursor: node.startAt,
      node
    }))
    const firstEdge = edges[0]
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        endCursor: firstEdge && edges[edges.length - 1].cursor,
        hasNextPage: tooManyInvoices.length + (upcomingInvoice ? 1 : 0) > first
      }
    }
  }
}
