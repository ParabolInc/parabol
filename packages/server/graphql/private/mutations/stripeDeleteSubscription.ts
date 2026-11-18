import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getStripeManager} from '../../../utils/stripe'
import type {MutationResolvers} from '../resolverTypes'

const stripeDeleteSubscription: MutationResolvers['stripeDeleteSubscription'] = async (
  _source,
  {customerId, subscriptionId},
  {dataLoader}
) => {
  // RESOLUTION
  const manager = getStripeManager()
  const stripeCustomer = await manager.retrieveCustomer(customerId)
  if (stripeCustomer.deleted) {
    throw new GraphQLError('Customer was deleted', {extensions: {code: 'NOT_FOUND'}})
  }

  const {
    metadata: {orgId}
  } = stripeCustomer
  if (!orgId) {
    throw new GraphQLError(`orgId not found on metadata for customer ${customerId}`, {
      extensions: {code: 'NOT_FOUND'}
    })
  }
  const org = await dataLoader.get('organizations').load(orgId)
  if (!org) {
    throw new GraphQLError(`Organization not found for orgId ${orgId}`, {
      extensions: {code: 'NOT_FOUND'}
    })
  }

  const {stripeSubscriptionId} = org
  if (!stripeSubscriptionId) return false

  if (stripeSubscriptionId !== subscriptionId) {
    throw new GraphQLError(
      `Subscription ID does not match: ${stripeSubscriptionId} vs ${subscriptionId}`,
      {extensions: {code: 'CONFLICT'}}
    )
  }
  await getKysely()
    .updateTable('Organization')
    .set({stripeSubscriptionId: null})
    .where('id', '=', orgId)
    .execute()

  return true
}

export default stripeDeleteSubscription
