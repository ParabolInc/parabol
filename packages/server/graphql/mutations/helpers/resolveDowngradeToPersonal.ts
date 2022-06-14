import getRethink from '../../../database/rethinkDriver'
import Organization from '../../../database/types/Organization'
import User from '../../../database/types/User'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import {analytics} from '../../../utils/analytics/analytics'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import StripeManager from '../../../utils/StripeManager'

const resolveDowngradeToPersonal = async (
  orgId: string,
  stripeSubscriptionId: string,
  userId: string
) => {
  const now = new Date()
  const manager = new StripeManager()
  const r = await getRethink()
  try {
    await manager.deleteSubscription(stripeSubscriptionId)
  } catch (e) {
    console.log(e)
  }

  const [org, user] = await Promise.all([
    r.table('Organization').get(orgId).run() as unknown as Organization,
    r.table('User').get(userId).run() as unknown as User,
    r({
      orgUpdate: r.table('Organization').get(orgId).update({
        tier: 'personal',
        periodEnd: now,
        stripeSubscriptionId: null,
        updatedAt: now
      }),
      teamIds: r
        .table('Team')
        .getAll(orgId, {index: 'orgId'})
        .update(
          {
            tier: 'personal',
            isPaid: true,
            updatedAt: now
          },
          {returnChanges: true}
        )('changes')('new_val')('id')
        .default([]) as unknown as string[]
    }).run(),
    updateTeamByOrgId(
      {
        tier: 'personal',
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
    oldTier: 'pro',
    newTier: 'personal',
    billingLeaderEmail: user.email
  })
}

export default resolveDowngradeToPersonal
