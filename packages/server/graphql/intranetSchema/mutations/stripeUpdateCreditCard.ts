import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {InternalContext} from '../../graphql'
import {isSuperUser} from '../../../utils/authorization'
import getRethink from '../../../database/rethinkDriver'
import getCCFromCustomer from '../../mutations/helpers/getCCFromCustomer'
import StripeManager from '../../../utils/StripeManager'

export default {
  name: 'StripeUpdateCreditCard',
  description: 'When stripe tells us a credit card was updated, update the details in our own DB',
  type: GraphQLBoolean,
  args: {
    customerId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe customer ID, or stripeId'
    }
  },
  resolve: async (
    _source: unknown,
    {customerId}: {customerId: string},
    {authToken}: InternalContext
  ) => {
    // AUTH
    if (!isSuperUser(authToken)) {
      throw new Error('Don’t be rude.')
    }
    const r = await getRethink()
    const manager = new StripeManager()
    const customer = await manager.retrieveCustomer(customerId)
    const creditCard = getCCFromCustomer(customer)
    const {
      metadata: {orgId}
    } = customer
    await r.table('Organization').get(orgId).update({creditCard}).run()
    return true
  }
}
