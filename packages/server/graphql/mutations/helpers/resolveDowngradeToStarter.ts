import getRethink from '../../../database/rethinkDriver'
import Organization from '../../../database/types/Organization'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import {analytics} from '../../../utils/analytics/analytics'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import {getStripeManager} from '../../../utils/stripe'
import {ReasonToDowngradeEnum} from '../../public/resolverTypes'

const resolveDowngradeToStarter = async (
  orgId: string,
  stripeSubscriptionId: string,
  userId: string,
  reasonsForLeaving?: ReasonToDowngradeEnum[],
  otherTool?: string
) => {
  const now = new Date()
  const manager = getStripeManager()
  const r = await getRethink()
  try {
    await manager.deleteSubscription(stripeSubscriptionId)
  } catch (e) {
    console.log(e)
  }

  const [org] = await Promise.all([
    r.table('Organization').get(orgId).run() as unknown as Organization,
    r({
      orgUpdate: r.table('Organization').get(orgId).update({
        tier: 'starter',
        periodEnd: now,
        stripeSubscriptionId: null,
        updatedAt: now
      })
    }).run(),
    updateTeamByOrgId(
      {
        tier: 'starter',
        isPaid: true
      },
      orgId
    )
  ])

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])
  analytics.organizationDowngraded(userId, {
    orgId,
    domain: org.activeDomain,
    orgName: org.name,
    oldTier: 'team',
    newTier: 'starter',
    reasonsForLeaving,
    otherTool
  })
}

export default resolveDowngradeToStarter
