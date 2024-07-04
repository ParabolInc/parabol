import {DataLoaderWorker} from '../../graphql/graphql'
import getUpcomingInvoiceId from '../../utils/getUpcomingInvoiceId'
import {getStripeManager} from '../../utils/stripe'
import fetchAllLines from './fetchAllLines'
import generateInvoice from './generateInvoice'

const generateUpcomingInvoice = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const invoiceId = getUpcomingInvoiceId(orgId)
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  const {stripeId} = organization
  const manager = getStripeManager()
  const [stripeLineItems, upcomingInvoice] = await Promise.all([
    fetchAllLines('upcoming', stripeId),
    manager.retrieveUpcomingInvoice(stripeId!)
  ])
  return generateInvoice(upcomingInvoice, stripeLineItems, orgId, invoiceId, dataLoader)
}

export default generateUpcomingInvoice
