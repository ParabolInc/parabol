import getRethink from '../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql/graphql'
import {getStripeManager} from '../../utils/stripe'

const updateSubscriptionQuantity = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const manager = getStripeManager()

  const [org, orgUserCount] = await Promise.all([
    dataLoader.get('organizations').load(orgId),
    r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null, inactive: false})
      .count()
      .run()
  ])
  if (!org) throw new Error(`org not found for invoice`)
  const {stripeSubscriptionId} = org
  if (!stripeSubscriptionId) return

  const subscription = await manager.retrieveSubscription(stripeSubscriptionId)
  const {id: subscriptionId} = subscription
  const teamSubscription = await manager.getSubscriptionItem(subscriptionId)
  if (teamSubscription && teamSubscription.quantity !== orgUserCount) {
    await manager.updateSubscriptionItemQuantity(teamSubscription.id, orgUserCount)
  }
}

export default updateSubscriptionQuantity
