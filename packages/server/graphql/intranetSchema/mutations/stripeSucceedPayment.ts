import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import StripeManager from '../../../utils/StripeManager'
import {isSuperUser} from '../../../utils/authorization'
import {InternalContext} from '../../graphql'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'

export default {
  name: 'StripeSucceedPayment',
  description: 'When stripe tells us an invoice payment was successful, update it in our DB',
  type: GraphQLBoolean,
  args: {
    invoiceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe invoice ID'
    }
  },
  resolve: async (
    _source: unknown,
    {invoiceId}: {invoiceId: string},
    {authToken}: InternalContext
  ) => {
    const r = await getRethink()
    const now = new Date()

    // AUTH
    if (!isSuperUser(authToken)) {
      throw new Error('Don’t be rude.')
    }

    // VALIDATION
    const manager = new StripeManager()
    const invoice = await manager.retrieveInvoice(invoiceId)
    const customerId = invoice.customer as string

    const {
      livemode,
      metadata: {orgId}
    } = await manager.retrieveCustomer(customerId)
    const org = await r.table('Organization').get(orgId).run()
    if (!org || !orgId) {
      if (livemode) {
        throw new Error(
          `Payment cannot succeed. Org ${orgId} does not exist for invoice ${invoiceId}`
        )
      }
      return
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
        teams: r.table('Team').getAll(orgId, {index: 'orgId'}).update(teamUpdates),
        org: r
          .table('Organization')
          .get(orgId)
          .update({
            stripeSubscriptionId: invoice.subscription as string
          })
      }).run(),
      updateTeamByOrgId(teamUpdates, orgId)
    ])
  }
}
