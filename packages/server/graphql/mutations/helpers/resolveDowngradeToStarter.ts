import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import {analytics} from '../../../utils/analytics/analytics'
import {Logger} from '../../../utils/Logger'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import {getStripeManager} from '../../../utils/stripe'
import {ReasonToDowngradeEnum} from '../../public/resolverTypes'

const resolveDowngradeToStarter = async (
  orgId: string,
  stripeSubscriptionId: string,
  user: {id: string; email: string},
  dataLoader: DataLoaderInstance,
  reasonsForLeaving?: ReasonToDowngradeEnum[],
  otherTool?: string
) => {
  const now = new Date()
  const manager = getStripeManager()
  const pg = getKysely()
  try {
    await manager.deleteSubscription(stripeSubscriptionId)
  } catch (e) {
    Logger.log(e)
  }

  const [org] = await Promise.all([
    dataLoader.get('organizations').loadNonNull(orgId),
    pg
      .updateTable('Organization')
      .set({
        tier: 'starter',
        periodEnd: now,
        stripeSubscriptionId: null
      })
      .where('id', '=', orgId)
      .execute(),
    pg
      .updateTable('SAML')
      .set({metadata: null, metadataURL: null, lastUpdatedBy: user.id})
      .where('orgId', '=', orgId)
      .execute(),
    updateTeamByOrgId(
      {
        tier: 'starter',
        isPaid: true
      },
      orgId
    )
  ])
  dataLoader.get('organizations').clear(orgId)
  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])
  analytics.organizationDowngraded(user, {
    orgId,
    domain: org.activeDomain || undefined,
    orgName: org.name,
    oldTier: 'team',
    newTier: 'starter',
    reasonsForLeaving,
    otherTool
  })
}

export default resolveDowngradeToStarter
