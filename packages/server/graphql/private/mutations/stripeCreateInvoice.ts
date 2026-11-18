import {GraphQLError} from 'graphql'
import updateSubscriptionQuantity from '../../../billing/helpers/updateSubscriptionQuantity'
import {getStripeManager} from '../../../utils/stripe'
import type {MutationResolvers} from '../resolverTypes'

const stripeCreateInvoice: MutationResolvers['stripeCreateInvoice'] = async (
  _source,
  {invoiceId}
) => {
  // RESOLUTION
  const manager = getStripeManager()
  const invoice = await manager.retrieveInvoice(invoiceId)
  const stripeCustomer = await manager.retrieveCustomer(invoice.customer as string)
  if (stripeCustomer.deleted) {
    throw new GraphQLError('Customer was deleted', {extensions: {code: 'NOT_FOUND'}})
  }
  const {
    metadata: {orgId}
  } = stripeCustomer
  if (!orgId)
    throw new GraphQLError(`orgId not found on metadata for invoice ${invoiceId}`, {
      extensions: {code: 'NOT_FOUND'}
    })

  await updateSubscriptionQuantity(orgId, true)
  await manager.updateInvoice(invoiceId, orgId)
  return true
}

export default stripeCreateInvoice
