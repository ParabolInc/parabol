import getKysely from '../../../postgres/getKysely'
import {isSuperUser} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import type {MutationResolvers} from '../resolverTypes'

const stripeInvoicePaid: MutationResolvers['stripeInvoicePaid'] = async (
  _source,
  {invoiceId},
  {authToken, dataLoader}
) => {
  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }

  // VALIDATION
  const manager = getStripeManager()
  const invoice = await manager.retrieveInvoice(invoiceId)
  const customerId = invoice.customer as string

  const stripeCustomer = await manager.retrieveCustomer(customerId)
  if (stripeCustomer.deleted) {
    throw new Error('Customer was deleted')
  }
  const {
    livemode,
    metadata: {orgId}
  } = stripeCustomer
  if (!orgId) {
    throw new Error(`Payment cannot succeed. Org ${orgId} does not exist for invoice ${invoiceId}`)
  }
  const org = await dataLoader.get('organizations').load(orgId)
  if (!org) {
    if (livemode) {
      throw new Error(
        `Payment cannot succeed. Org ${orgId} does not exist for invoice ${invoiceId}`
      )
    }
    return false
  }

  // RESOLUTION
  const pg = getKysely()
  await pg
    .updateTable('Organization')
    .set({
      isPaid: true
    })
    .where('id', '=', orgId)
    .execute()

  org.isPaid = true
  return true
}

export default stripeInvoicePaid
