import type {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import {orgTierChanges} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import {Logger} from '../../../utils/Logger'
import {getStripeManager} from '../../../utils/stripe'
import clearSAMLConnection from './clearSAMLConnection'

const resolveDowngradeToStarter = async (
  orgId: string,
  stripeSubscriptionId: string,
  user: {id: string; email: string},
  dataLoader: DataLoaderInstance
) => {
  const now = new Date()
  const manager = getStripeManager()
  const pg = getKysely()
  try {
    await manager.deleteSubscription(stripeSubscriptionId)
  } catch (e) {
    Logger.log(e)
  }

  await Promise.all([
    pg
      .updateTable('Organization')
      .set({
        tier: 'starter',
        periodEnd: now,
        stripeSubscriptionId: null
      })
      .where('id', '=', orgId)
      .execute(),
    clearSAMLConnection('orgId', orgId, user.id)
  ])
  dataLoader.get('organizations').clear(orgId)
  orgTierChanges.inc({from_tier: 'team', to_tier: 'starter'})
}

export default resolveDowngradeToStarter
