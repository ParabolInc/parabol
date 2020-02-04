import {GraphQLID, GraphQLNonNull} from 'graphql'
import generateUpcomingInvoice from '../../billing/helpers/generateUpcomingInvoice'
import getRethink from '../../database/rethinkDriver'
import Invoice from '../types/Invoice'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import {UPCOMING_INVOICE_TIME_VALID} from '../../utils/serverConstants'
import standardError from '../../utils/standardError'

export default {
  type: Invoice,
  args: {
    invoiceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the invoice'
    }
  },
  async resolve(_source, {invoiceId}, {authToken, dataLoader}) {
    const r = await getRethink()
    const now = new Date()

    // AUTH
    const viewerId = getUserId(authToken)
    const isUpcoming = invoiceId.startsWith('upcoming_')
    const currentInvoice = await r
      .table('Invoice')
      .get(invoiceId)
      .default(null)
      .run()
    const orgId = (currentInvoice && currentInvoice.orgId) || invoiceId.substring(9) // remove 'upcoming_'
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
      standardError(new Error('Not organization lead'), {userId: viewerId})
      return null
    }

    // RESOLUTION
    if (
      !isUpcoming ||
      (currentInvoice &&
        new Date(currentInvoice.createdAt.getTime() + UPCOMING_INVOICE_TIME_VALID) > now)
    ) {
      return currentInvoice
    }
    return generateUpcomingInvoice(orgId)
  }
}
