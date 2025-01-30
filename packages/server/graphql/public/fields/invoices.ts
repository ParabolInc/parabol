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
  const {stripeId, stripeSubscriptionId} = org
  if (!stripeId || !stripeSubscriptionId)
    // the subscription is necessary because if they downgraded we don't want to fetch invoices
    return {edges: [], pageInfo: {hasNextPage: false, hasPreviousPage: false}}
  const manager = getStripeManager()

  const [sessionRes, upcomingInvoiceRes, invoicesRes] = await Promise.allSettled([
    manager.stripe.billingPortal.sessions.create({
      customer: stripeId,
      return_url: makeAppURL(appOrigin, `me/organizations/${orgId}/billing`)
    }),
    manager.retrieveUpcomingInvoice(stripeId),
    manager.listInvoices(stripeId)
  ])
  if (
    sessionRes.status === 'rejected' ||
    upcomingInvoiceRes.status === 'rejected' ||
    invoicesRes.status === 'rejected'
  ) {
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  }
  const session = sessionRes.value
  const upcomingInvoice = upcomingInvoiceRes.value
  const invoices = invoicesRes.value
  const parabolUpcomingInvoice: Invoice = {
    id: `upcoming_${orgId}`,
    periodEndAt: fromEpochSeconds(upcomingInvoice.period_end!),
    total: upcomingInvoice.total,
    payUrl: session.url,
    status: 'UPCOMING'
  }

  const parabolPastInvoices: Invoice[] = invoices.data
    .filter(({status}) => {
      return status !== 'deleted' && status !== 'void'
    })
    .map((stripeInvoice) => {
      const {id, period_end, total, status: stripeStatus} = stripeInvoice
      const status: InvoiceStatusEnum =
        stripeStatus === 'uncollectible' ? 'FAILED' : stripeStatus === 'paid' ? 'PAID' : 'PENDING'
      return {
        id,
        periodEndAt: fromEpochSeconds(period_end!),
        total,
        payUrl: session.url,
        status
      }
    })
  const edges = [parabolUpcomingInvoice, ...parabolPastInvoices].map((node) => ({
    cursor: node.periodEndAt,
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
