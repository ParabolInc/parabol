import getRethink from '../../../database/rethinkDriver'
import {isSuperUser} from '../../../utils/authorization'
import StripeManager from '../../../utils/StripeManager'
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
  const manager = new StripeManager()
  const customer = await manager.retrieveCustomer(customerId)
  const creditCard = getCCFromCustomer(customer)
  const {
    metadata: {orgId}
  } = customer
  await r.table('Organization').get(orgId).update({creditCard}).run()
  return true
}

export default stripeUpdateCreditCard
