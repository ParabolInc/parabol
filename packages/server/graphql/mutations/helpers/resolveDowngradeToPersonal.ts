import getRethink from '../../../database/rethinkDriver'
import segmentIo from '../../../utils/segmentIo'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import StripeManager from '../../../utils/StripeManager'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'

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

  await Promise.all([
    r({
      org: r.table('Organization').get(orgId).update({
        tier: 'personal',
        periodEnd: now,
        stripeSubscriptionId: null,
        updatedAt: now
      })
    }).run(),
    updateTeamByOrgId(
      {
        tier: 'personal',
        isPaid: true,
        updatedAt: now
      },
      orgId
    )
  ])

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])
  segmentIo.track({
    userId,
    event: 'Downgrade to personal',
    properties: {
      orgId
    }
  })
}

export default resolveDowngradeToPersonal
