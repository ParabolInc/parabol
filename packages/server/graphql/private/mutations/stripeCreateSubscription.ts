import {GraphQLError} from 'graphql'
import type Stripe from 'stripe'
import getKysely from '../../../postgres/getKysely'
import {getStripeManager} from '../../../utils/stripe'
import type {MutationResolvers} from '../resolverTypes'

const stripeCreateSubscription: MutationResolvers['stripeCreateSubscription'] = async (
  _source,
  {customerId, subscriptionId}
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

  const subscription = await manager.retrieveSubscription(subscriptionId)
  const invalidStatuses: Stripe.Subscription.Status[] = [
    'canceled',
    'incomplete',
    'incomplete_expired'
  ]
  const isSubscriptionInvalid = invalidStatuses.some((status) => (subscription.status = status))
  if (isSubscriptionInvalid) return false

  await getKysely()
    .updateTable('Organization')
    .set({
      stripeSubscriptionId: subscriptionId
    })
    .where('id', '=', orgId)
    .execute()

  return true
}

export default stripeCreateSubscription
