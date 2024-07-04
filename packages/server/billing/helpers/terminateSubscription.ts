import {sql} from 'kysely'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../../utils/Logger'
import {getStripeManager} from '../../utils/stripe'

const terminateSubscription = async (orgId: string) => {
  const pg = getKysely()
  // flag teams as unpaid
  const organization = await pg
    .with('OldOrg', (qc) =>
      qc.selectFrom('Organization').select('stripeSubscriptionId').where('id', '=', orgId)
    )
    .updateTable('Organization')
    .set({periodEnd: sql`CURRENT_TIMESTAMP`, stripeSubscriptionId: null})
    .where('id', '=', orgId)
    .returning((qc) =>
      qc.selectFrom('OldOrg').select('stripeSubscriptionId').as('stripeSubscriptionId')
    )
    .executeTakeFirstOrThrow()
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
