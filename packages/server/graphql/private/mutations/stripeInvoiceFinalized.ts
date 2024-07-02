import getRethink from '../../../database/rethinkDriver'
import {isSuperUser} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const stripeInvoiceFinalized: MutationResolvers['stripeInvoiceFinalized'] = async (
  _source,
  {invoiceId},
  {authToken, dataLoader}
) => {
  const r = await getRethink()
  const now = new Date()

  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }

  // VALIDATION
  const manager = getStripeManager()
  const invoice = await manager.retrieveInvoice(invoiceId)
  const customerId = invoice.customer as string

  const customer = await manager.retrieveCustomer(customerId)
  if (customer.deleted) {
    return false
  }
  const {
    livemode,
    metadata: {orgId}
  } = customer
  const org = await dataLoader.get('organizations').load(orgId!)
  if (!org) {
    if (livemode) {
      throw new Error(
        `Payment sent cannot be handled. Org ${orgId} does not exist for invoice ${invoiceId}`
      )
    }
    return false
  }

  const {collection_method, hosted_invoice_url} = invoice
  if (collection_method !== 'send_invoice') return false
  // RESOLUTION
  await r
    .table('Invoice')
    .get(invoiceId)
    .update({
      payUrl: hosted_invoice_url,
      updatedAt: now
    })
    .run()
  return true
}

export default stripeInvoiceFinalized
