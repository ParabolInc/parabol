import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {toCreditCard} from '../../../postgres/helpers/toCreditCard'
import {getStripeManager} from '../../../utils/stripe'
import getCCFromCustomer from '../../mutations/helpers/getCCFromCustomer'
import type {MutationResolvers} from '../resolverTypes'

const stripeUpdateCreditCard: MutationResolvers['stripeUpdateCreditCard'] = async (
  _source,
  {customerId}
) => {
  const manager = getStripeManager()
  const customer = await manager.retrieveCustomer(customerId)
  if (customer.deleted) {
    throw new GraphQLError('Unable to update credit card as customer has been deleted', {
      extensions: {code: 'NOT_FOUND'}
    })
  }
  const creditCard = await getCCFromCustomer(customer)
  const {
    metadata: {orgId}
  } = customer
  if (!orgId) {
    throw new GraphQLError('Unable to update credit card as customer does not have an orgId', {
      extensions: {code: 'NOT_FOUND'}
    })
  }
  await getKysely()
    .updateTable('Organization')
    .set({creditCard: toCreditCard(creditCard)})
    .where('id', '=', orgId)
    .execute()
  return true
}

export default stripeUpdateCreditCard
