import getRethink from '../../../database/rethinkDriver'
import {isSuperUser} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import getCCFromCustomer from '../../mutations/helpers/getCCFromCustomer'
import {MutationResolvers} from '../resolverTypes'

const stripeUpdateCreditCard: MutationResolvers['stripeUpdateCreditCard'] = async (
  _source,
  {customerId},
  {authToken}
) => {
  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }
  const r = await getRethink()
  const manager = getStripeManager()
  const customer = await manager.retrieveCustomer(customerId)
  if (customer.deleted) {
    throw new Error('Unable to update credit card as customer has been deleted')
  }
  const creditCard = await getCCFromCustomer(customer)
  const {
    metadata: {orgId}
  } = customer
  await r.table('Organization').get(orgId).update({creditCard}).run()
  return true
}

export default stripeUpdateCreditCard
