import makeAppURL from '../../../../client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import {getUserId, isUserBillingLeader} from '../../../utils/authorization'
import {fromEpochSeconds} from '../../../utils/epochTime'
import {getStripeManager} from '../../../utils/stripe'
import {Invoice, InvoiceStatusEnum, UserResolvers} from '../resolverTypes'

export const invoices: NonNullable<UserResolvers['invoices']> = async (
  _source,
  {orgId},
  {authToken, dataLoader}
) => {
  // AUTH
  const viewerId = getUserId(authToken)
  if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  }

  // RESOLUTION
  const org = await dataLoader.get('organizations').loadNonNull(orgId)
  const {stripeId} = org
  if (!stripeId) return {edges: [], pageInfo: {hasNextPage: false, hasPreviousPage: false}}
  const manager = getStripeManager()

  const [session, upcomingInvoice, invoices] = await Promise.all([
    manager.stripe.billingPortal.sessions.create({
      customer: stripeId,
      return_url: makeAppURL(appOrigin, `me/organizations/${orgId}/billing`)
    }),
    manager.retrieveUpcomingInvoice(stripeId),
    manager.listInvoices(stripeId)
  ])
  const parabolUpcomingInvoice: Invoice = {
    id: `upcoming_${orgId}`,
    dueAt: fromEpochSeconds(upcomingInvoice.due_date!),
    total: upcomingInvoice.total,
    payUrl: session.url,
    status: 'UPCOMING'
  }

  const parabolPastInvoices: Invoice[] = invoices.data.map((stripeInvoice) => {
    const {id, due_date, total, status: stripeStatus} = stripeInvoice
    const status: InvoiceStatusEnum =
      stripeStatus === 'uncollectible' ? 'FAILED' : stripeStatus === 'paid' ? 'PAID' : 'PENDING'
    return {
      id,
      dueAt: fromEpochSeconds(due_date!),
      total,
      payUrl: session.url,
      status
    }
  })
  const edges = [parabolUpcomingInvoice, ...parabolPastInvoices].map((node) => ({
    cursor: node.dueAt,
    node
  }))
  const firstEdge = edges[0]
  return {
    edges,
    pageInfo: {
      startCursor: firstEdge && firstEdge.cursor,
      endCursor: firstEdge && edges[edges.length - 1]!.cursor,
      hasNextPage: invoices.has_more,
      hasPreviousPage: false
    }
  }
}
