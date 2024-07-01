import getRethink from '../../../database/rethinkDriver'
import Organization from '../../../database/types/Organization'
import {isSuperUser} from '../../../utils/authorization'
import {getStripeManager} from '../../../utils/stripe'
import {MutationResolvers} from '../resolverTypes'

const stripeDeleteSubscription: MutationResolvers['stripeDeleteSubscription'] = async (
  _source,
  {customerId, subscriptionId},
  {authToken, dataLoader}
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
  const org: Organization = await dataLoader.get('organizations').load(orgId)

  const {stripeSubscriptionId} = org
  if (!stripeSubscriptionId) return false

  if (stripeSubscriptionId !== subscriptionId) {
    throw new Error(`Subscription ID does not match: ${stripeSubscriptionId} vs ${subscriptionId}`)
  }

  await r
    .table('Organization')
    .get(orgId)
    .update({
      stripeSubscriptionId: r.literal()
    })
    .run()

  return true
}

export default stripeDeleteSubscription
