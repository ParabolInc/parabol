import Stripe from 'stripe'
import getRethink from '../../../database/rethinkDriver'
import {isSuperUser} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const stripeUpdateSubscription: MutationResolvers['stripeUpdateSubscription'] = async (
  _source,
  {customerId, subscriptionId},
  {authToken}
) => {
  const r = await getRethink()
  // AUTH
  if (!isSuperUser(authToken)) {
    throw new Error('Don’t be rude.')
  }

  // RESOLUTION
  const manager = getStripeManager()
  const stripeCustomer = await manager.retrieveCustomer(customerId)
  if (stripeCustomer.deleted) {
    throw new Error('Customer was deleted')
  }

  const {
    metadata: {orgId}
  } = stripeCustomer
  if (!orgId) {
    throw new Error(`orgId not found on metadata for customer ${customerId}`)
  }

  const subscription = await manager.retrieveSubscription(subscriptionId)
  const invalidStatuses: Stripe.Subscription.Status[] = [
    'canceled',
    'incomplete',
    'incomplete_expired'
  ]
  const isSubscriptionInvalid = invalidStatuses.some((status) => (subscription.status = status))
  if (isSubscriptionInvalid) return false

  await r
    .table('Organization')
    .get(orgId)
    .update({
      stripeSubscriptionId: subscriptionId
    })
    .run()

  return true
}

export default stripeUpdateSubscription
