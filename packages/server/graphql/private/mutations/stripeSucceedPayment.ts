import getRethink from '../../../database/rethinkDriver'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import {isSuperUser} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const stripeSucceedPayment: MutationResolvers['stripeSucceedPayment'] = async (
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
  const {creditCard} = org

  // RESOLUTION
  const teamUpdates = {
    isPaid: true,
    updatedAt: now
  }
  await Promise.all([
    r({
      invoice: r
        .table('Invoice')
        .get(invoiceId)
        .update({
          creditCard: creditCard
            ? {
                ...creditCard,
                last4: String(creditCard.last4)
              }
            : undefined,
          paidAt: now,
          status: 'PAID'
        })
    }).run(),
    updateTeamByOrgId(teamUpdates, orgId)
  ])
  return true
}

export default stripeSucceedPayment
