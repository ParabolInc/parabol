import getRethink from '../../../database/rethinkDriver'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import segmentIo from '../../../utils/segmentIo'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import {getStripeManager} from '../../../utils/stripe'

const resolveDowngradeToPersonal = async (
  orgId: string,
  stripeSubscriptionId: string,
  userId: string
) => {
  const now = new Date()
  const manager = getStripeManager()
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
  segmentIo.track({
    userId,
    event: 'Downgrade to personal',
    properties: {
      orgId
    }
  })
}

export default resolveDowngradeToPersonal
