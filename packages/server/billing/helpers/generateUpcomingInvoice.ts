import fetchAllLines from './fetchAllLines'
import generateInvoice from './generateInvoice'
import getRethink from '../../database/rethinkDriver'
import getUpcomingInvoiceId from '../../utils/getUpcomingInvoiceId'
import StripeManager from '../../utils/StripeManager'
import {DataLoaderWorker} from '../../graphql/graphql'

const generateUpcomingInvoice = async (orgId: string, dataLoader: DataLoaderWorker) => {
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
  return generateInvoice(upcomingInvoice, stripeLineItems, orgId, invoiceId, dataLoader)
}

export default generateUpcomingInvoice
