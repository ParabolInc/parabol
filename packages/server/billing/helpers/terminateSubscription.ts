import getRethink from '../../database/rethinkDriver'
import Organization from '../../database/types/Organization'
import getKysely from '../../postgres/getKysely'
import {Logger} from '../../utils/Logger'
import sendToSentry from '../../utils/sendToSentry'
import {getStripeManager} from '../../utils/stripe'

const terminateSubscription = async (orgId: string) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  // flag teams as unpaid
  const [pgOrganization, organization] = await Promise.all([
    pg
      .with('OldOrg', (qc) =>
        qc.selectFrom('Organization').select('stripeSubscriptionId').where('id', '=', orgId)
      )
      .updateTable('Organization')
      .set({periodEnd: now, stripeSubscriptionId: null})
      .where('id', '=', orgId)
      .returning((qc) =>
        qc.selectFrom('OldOrg').select('stripeSubscriptionId').as('stripeSubscriptionId')
      )
      .executeTakeFirst(),
    r
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
      .default(null)
      .run() as unknown as Organization
  ])
  const {stripeSubscriptionId} = organization
  if (stripeSubscriptionId !== pgOrganization?.stripeSubscriptionId) {
    sendToSentry(new Error(`stripeSubscriptionId mismatch for orgId ${orgId}`))
  }
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
