import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getStripeManager} from '../../../utils/stripe'
import type {MutationResolvers} from '../resolverTypes'

const stripeInvoicePaid: MutationResolvers['stripeInvoicePaid'] = async (
  _source,
  {invoiceId},
  {dataLoader}
) => {
  // VALIDATION
  const manager = getStripeManager()
  const invoice = await manager.retrieveInvoice(invoiceId)
  const customerId = invoice.customer as string

  const stripeCustomer = await manager.retrieveCustomer(customerId)
  if (stripeCustomer.deleted) {
    throw new GraphQLError('Customer was deleted', {extensions: {code: 'NOT_FOUND'}})
  }
  const {
    livemode,
    metadata: {orgId}
  } = stripeCustomer
  if (!orgId) {
    throw new GraphQLError(
      `Payment cannot succeed. Org ${orgId} does not exist for invoice ${invoiceId}`,
      {extensions: {code: 'NOT_FOUND'}}
    )
  }
  const org = await dataLoader.get('organizations').load(orgId)
  if (!org) {
    if (livemode) {
      throw new GraphQLError(
        `Payment cannot succeed. Org ${orgId} does not exist for invoice ${invoiceId}`,
        {extensions: {code: 'NOT_FOUND'}}
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
