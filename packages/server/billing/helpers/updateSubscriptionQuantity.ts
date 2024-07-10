import getRethink from '../../database/rethinkDriver'
import getKysely from '../../postgres/getKysely'
import insertStripeQuantityMismatchLogging from '../../postgres/queries/insertStripeQuantityMismatchLogging'
import RedisLockQueue from '../../utils/RedisLockQueue'
import sendToSentry from '../../utils/sendToSentry'
import {getStripeManager} from '../../utils/stripe'

/**
 * Check and update if necessary the subscription quantity
 * @param logMismatch Pass true if a quantity mismatch should be logged
 */
const updateSubscriptionQuantity = async (orgId: string, logMismatch?: boolean) => {
  const r = await getRethink()
  const manager = getStripeManager()

  const org = await getKysely()
    .selectFrom('Organization')
    .selectAll()
    .where('id', '=', orgId)
    .executeTakeFirst()

  if (!org) throw new Error(`org not found for invoice`)
  const {stripeSubscriptionId, tier} = org
  if (!stripeSubscriptionId || tier === 'enterprise') return

  // Hold the lock for 5s max and try to acquire the lock for 10s.
  // If there are lots of changes for the same orgId, then this can result in some of the updates timing out.
  // Because each locked section reads the lates org user count and the latest stripe subscription quantity, this should not result in a wrong final result.
  // If we have 50 changes for the given organization and the last update times out after 10s,
  // this means at least one update ran after the last change to the organization was done and thus read the latest data.
  const redisLock = new RedisLockQueue(`updateSubscriptionQuantity:${orgId}`, 5000)
  try {
    if (!(await redisLock.tryLock(10000))) {
      return
    }

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
