import getRethink from '../../../database/rethinkDriver'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import {isSuperUser} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const stripeInvoicePaid: MutationResolvers['stripeInvoicePaid'] = async (
  _source,
  {invoiceId},
  {authToken}
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

  const stripeCustomer = await manager.retrieveCustomer(customerId)
  if (stripeCustomer.deleted) {
    throw new Error('Customer was deleted')
  }
  const {
    livemode,
    metadata: {orgId}
  } = stripeCustomer
  const org = await r.table('Organization').get(orgId).run()
  if (!org || !orgId) {
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
      invoice: r.table('Invoice').get(invoiceId).update({
        creditCard,
        paidAt: now,
        status: 'PAID'
      }),
      org: r
        .table('Organization')
        .get(orgId)
        .update({
          stripeSubscriptionId: invoice.subscription as string
        })
    }).run(),
    updateTeamByOrgId(teamUpdates, orgId)
  ])
  return true
}

export default stripeInvoicePaid
