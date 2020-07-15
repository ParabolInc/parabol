import {TierEnum} from 'parabol-client/types/graphql'
import getRethink from '../../../database/rethinkDriver'
import segmentIo from '../../../utils/segmentIo'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
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

  const {teamIds} = await r({
    org: r
      .table('Organization')
      .get(orgId)
      .update({
        tier: TierEnum.personal,
        periodEnd: now,
        stripeSubscriptionId: null,
        updatedAt: now
      }),
    teamIds: (r
      .table('Team')
      .getAll(orgId, {index: 'orgId'})
      .update(
        {
          tier: TierEnum.personal,
          isPaid: true,
          updatedAt: now
        },
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default([]) as unknown) as string[]
  }).run()

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])
  segmentIo.track({
    userId,
    event: 'Downgrade to personal',
    properties: {
      orgId
    }
  })
  return {teamIds}
}

export default resolveDowngradeToPersonal
