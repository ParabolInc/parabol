import getRethink from '../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql/graphql'
import {getStripeManager} from '../../utils/stripe'
import insertStripeQuantityMismatchLogging from '../../postgres/queries/insertStripeQuantityMismatchLogging'
import sendToSentry from '../../utils/sendToSentry'
import RedisLockQueue from '../../utils/RedisLockQueue'

/**
 * Check and update if necessary the subscription quantity
 * @param logMismatch Pass true if a quantity mismatch should be logged
 */
const updateSubscriptionQuantity = async (
  orgId: string,
  dataLoader: DataLoaderWorker,
  logMismatch?: boolean
) => {
  const r = await getRethink()
  const manager = getStripeManager()

  const org = await dataLoader.get('organizations').load(orgId)
  if (!org) throw new Error(`org not found for invoice`)
  const {stripeSubscriptionId} = org
  if (!stripeSubscriptionId) return

  const redisLock = new RedisLockQueue(`updateSubscriptionQuantity:${orgId}`, 5000)
  try {
    await redisLock.lock(10000)

    const [orgUserCount, teamSubscription] = await Promise.all([
      r
        .table('OrganizationUser')
        .getAll(orgId, {index: 'orgId'})
        .filter({removedAt: null, inactive: false})
        .count()
        .run(),
      await manager.getSubscriptionItem(stripeSubscriptionId)
    ])
    if (
      teamSubscription &&
      teamSubscription.quantity !== undefined &&
      teamSubscription.quantity !== orgUserCount
    ) {
      await manager.updateSubscriptionItemQuantity(teamSubscription.id, orgUserCount)
      if (logMismatch) {
        insertStripeQuantityMismatchLogging(
          orgId,
          null,
          new Date(),
          'invoice.created',
          teamSubscription.quantity,
          orgUserCount,
          []
        )
        sendToSentry(new Error('Stripe Quantity Mismatch'), {
          tags: {
            quantity: orgUserCount,
            subscriptionQuantity: teamSubscription.quantity,
            stripeSubscriptionId
          }
        })
      }
    }
  } finally {
    await redisLock.unlock()
  }
}

export default updateSubscriptionQuantity
