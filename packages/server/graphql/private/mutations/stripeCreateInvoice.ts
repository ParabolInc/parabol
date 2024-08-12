import updateSubscriptionQuantity from '../../../billing/helpers/updateSubscriptionQuantity'
import {isSuperUser} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const stripeCreateInvoice: MutationResolvers['stripeCreateInvoice'] = async (
  _source,
  {invoiceId},
  {authToken}
) => {
  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }

  // RESOLUTION
  const manager = getStripeManager()
  const invoice = await manager.retrieveInvoice(invoiceId)
  const stripeCustomer = await manager.retrieveCustomer(invoice.customer as string)
  if (stripeCustomer.deleted) {
    throw new Error('Customer was deleted')
  }
  const {
    metadata: {orgId}
  } = stripeCustomer
  if (!orgId) throw new Error(`orgId not found on metadata for invoice ${invoiceId}`)

  await updateSubscriptionQuantity(orgId, true)
  await manager.updateInvoice(invoiceId, orgId)
  return true
}

export default stripeCreateInvoice
