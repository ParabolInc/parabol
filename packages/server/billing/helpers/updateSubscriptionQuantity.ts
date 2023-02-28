import getRethink from '../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql/graphql'
import {getStripeManager} from '../../utils/stripe'
import insertStripeQuantityMismatchLogging from '../../postgres/queries/insertStripeQuantityMismatchLogging'
import sendToSentry from '../../utils/sendToSentry'

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
}

export default updateSubscriptionQuantity
