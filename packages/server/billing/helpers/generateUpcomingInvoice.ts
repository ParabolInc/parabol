import fetchAllLines from './fetchAllLines'
import generateInvoice from './generateInvoice'
import getRethink from '../../database/rethinkDriver'
import getUpcomingInvoiceId from '../../utils/getUpcomingInvoiceId'
import StripeManager from '../../utils/StripeManager'

const generateUpcomingInvoice = async (orgId: string) => {
  const r = await getRethink()
  const invoiceId = getUpcomingInvoiceId(orgId)
  const {stripeId, stripeSubscriptionId} = await r
    .table('Organization')
    .get(orgId)
    .pluck('stripeId', 'stripeSubscriptionId')
    .run()
  const manager = new StripeManager()
  const [stripeLineItems, upcomingInvoice] = await Promise.all([
    fetchAllLines('upcoming', stripeId),
    manager.retrieveUpcomingInvoice(stripeId!, stripeSubscriptionId!)
  ])
  return generateInvoice(upcomingInvoice, stripeLineItems, orgId, invoiceId)
}

export default generateUpcomingInvoice
