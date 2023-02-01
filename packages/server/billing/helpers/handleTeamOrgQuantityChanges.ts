import getRethink from '../../database/rethinkDriver'
import Organization from '../../database/types/Organization'
import {getStripeManager} from '../../utils/stripe'

const handleTeamOrgQuantityChanges = async (paidOrgs: Organization[]) => {
  const teamOrgs = paidOrgs.filter((org) => org.tier === 'team')
  if (teamOrgs.length === 0) return

  const r = await getRethink()
  const manager = getStripeManager()

  await Promise.all(
    teamOrgs.map(async (org) => {
      const orgUserCount = await r
        .table('OrganizationUser')
        .getAll(org.id, {index: 'orgId'})
        .filter({removedAt: null, inactive: false})
        .count()
        .run()
      const {stripeSubscriptionId} = org
      if (!stripeSubscriptionId) return

      const subscription = await manager.retrieveSubscription(stripeSubscriptionId)
      const {id: subscriptionId} = subscription
      const teamSubscription = await manager.getSubscriptionItem(subscriptionId)
      if (teamSubscription && teamSubscription.quantity !== orgUserCount) {
        await manager.updateSubscriptionItemQuantity(teamSubscription.id, orgUserCount)
      }
    })
  )
}

export default handleTeamOrgQuantityChanges
