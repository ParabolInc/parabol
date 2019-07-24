import fetchAllLines from '../../billing/helpers/fetchAllLines'
import generateInvoice from '../../billing/helpers/generateInvoice'
import stripe from '../../billing/stripe'
import resolvePromiseObj from '../../../client/utils/resolvePromiseObj'
import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'

export default {
  name: 'StripeCreateInvoice',
  description: 'When stripe tells us an invoice is ready, create a pretty version',
  type: GraphQLBoolean,
  args: {
    invoiceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe invoice ID'
    }
  },
  resolve: async (source, {invoiceId}, {serverSecret}) => {
    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Don’t be rude.')
    }

    // RESOLUTION
    const stripeLineItems = await fetchAllLines(invoiceId)
    const invoice = await stripe.invoices.retrieve(invoiceId)
    const {
      metadata: {orgId}
    } = await stripe.customers.retrieve(invoice.customer)
    await resolvePromiseObj({
      newInvoice: generateInvoice(invoice, stripeLineItems, orgId, invoiceId),
      updatedStripeMetadata: stripe.invoices.update(invoiceId, {
        metadata: {orgId}
      })
    })
    return true
  }
}
