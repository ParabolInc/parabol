import fetchAllLines from './fetchAllLines'
import generateInvoice from './generateInvoice'
import stripe from '../stripe'
import getRethink from '../../database/rethinkDriver'
import resolvePromiseObj from '../../../client/utils/resolvePromiseObj'
import getUpcomingInvoiceId from '../../utils/getUpcomingInvoiceId'

const generateUpcomingInvoice = async (orgId) => {
  const r = getRethink()
  const invoiceId = getUpcomingInvoiceId(orgId)
  const {stripeId, stripeSubscriptionId} = await r
    .table('Organization')
    .get(orgId)
    .pluck('stripeId', 'stripeSubscriptionId')
  const {stripeLineItems, upcomingInvoice} = await resolvePromiseObj({
    stripeLineItems: fetchAllLines('upcoming', stripeId),
    upcomingInvoice: stripe.invoices.retrieveUpcoming(stripeId, {
      subscription: stripeSubscriptionId
    })
  })
  return generateInvoice(upcomingInvoice, stripeLineItems, orgId, invoiceId)
}

export default generateUpcomingInvoice
