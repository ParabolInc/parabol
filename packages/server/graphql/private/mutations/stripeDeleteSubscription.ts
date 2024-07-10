import getKysely from '../../../postgres/getKysely'
import {isSuperUser} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const stripeDeleteSubscription: MutationResolvers['stripeDeleteSubscription'] = async (
  _source,
  {customerId, subscriptionId},
  {authToken, dataLoader}
) => {
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
  const org = await dataLoader.get('organizations').load(orgId)
  if (!org) {
    throw new Error(`Organization not found for orgId ${orgId}`)
  }

  const {stripeSubscriptionId} = org
  if (!stripeSubscriptionId) return false

  if (stripeSubscriptionId !== subscriptionId) {
    throw new Error(`Subscription ID does not match: ${stripeSubscriptionId} vs ${subscriptionId}`)
  }
  await getKysely()
    .updateTable('Organization')
    .set({stripeSubscriptionId: null})
    .where('id', '=', orgId)
    .execute()

  return true
}

export default stripeDeleteSubscription
