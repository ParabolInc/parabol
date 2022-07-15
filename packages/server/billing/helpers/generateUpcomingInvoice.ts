import getRethink from '../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql/graphql'
import getUpcomingInvoiceId from '../../utils/getUpcomingInvoiceId'
import {getStripeManager} from '../../utils/stripe'
import fetchAllLines from './fetchAllLines'
import generateInvoice from './generateInvoice'

const generateUpcomingInvoice = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const invoiceId = getUpcomingInvoiceId(orgId)
  const {stripeId, stripeSubscriptionId} = await r
    .table('Organization')
    .get(orgId)
    .pluck('stripeId', 'stripeSubscriptionId')
    .run()
  const manager = getStripeManager()
  const [stripeLineItems, upcomingInvoice] = await Promise.all([
    fetchAllLines('upcoming'),
    manager.retrieveUpcomingInvoice(stripeId!, stripeSubscriptionId!)
  ])
  return generateInvoice(upcomingInvoice, stripeLineItems, orgId, invoiceId, dataLoader)
}

export default generateUpcomingInvoice
