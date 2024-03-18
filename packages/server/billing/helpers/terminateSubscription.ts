import getRethink from '../../database/rethinkDriver'
import Organization from '../../database/types/Organization'
import {Logger} from '../../utils/Logger'
import {getStripeManager} from '../../utils/stripe'

const terminateSubscription = async (orgId: string) => {
  const r = await getRethink()
  const now = new Date()
  // flag teams as unpaid
  const [rethinkResult] = await Promise.all([
    r({
      organization: r
        .table('Organization')
        .get(orgId)
        .update(
          {
            // periodEnd should always be redundant, but useful for testing purposes
            periodEnd: now,
            stripeSubscriptionId: null
          },
          {returnChanges: true}
        )('changes')(0)('old_val')
        .default(null) as unknown as Organization
    }).run()
  ])
  const {organization} = rethinkResult
  const {stripeSubscriptionId} = organization

  if (stripeSubscriptionId) {
    const manager = getStripeManager()
    try {
      await manager.deleteSubscription(stripeSubscriptionId)
    } catch (e) {
      Logger.error(`cannot delete subscription ${stripeSubscriptionId}`, e)
    }
  }
  return stripeSubscriptionId
}

export default terminateSubscription
