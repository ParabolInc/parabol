import getKysely from '../../../postgres/getKysely'
import {toCreditCard} from '../../../postgres/helpers/toCreditCard'
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
  const manager = getStripeManager()
  const customer = await manager.retrieveCustomer(customerId)
  if (customer.deleted) {
    throw new Error('Unable to update credit card as customer has been deleted')
  }
  const creditCard = await getCCFromCustomer(customer)
  const {
    metadata: {orgId}
  } = customer
  if (!orgId) {
    throw new Error('Unable to update credit card as customer does not have an orgId')
  }
  await getKysely()
    .updateTable('Organization')
    .set({creditCard: toCreditCard(creditCard)})
    .where('id', '=', orgId)
    .execute()
  return true
}

export default stripeUpdateCreditCard
