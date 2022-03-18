import getRethink from '../../database/rethinkDriver'
import updateTeamByOrgId from '../../postgres/queries/updateTeamByOrgId'
import StripeManager from '../../utils/StripeManager'

const terminateSubscription = async (orgId: string) => {
  const r = await getRethink()
  const now = new Date()
  // flag teams as unpaid
  const [rethinkResult] = await Promise.all([
    r({
      updateTeam: r.table('Team').getAll(orgId, {index: 'orgId'}).update({
        isPaid: false
      }),
      stripeSubscriptionId: r
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
        .default(null) as unknown as string
    }).run(),
    updateTeamByOrgId({isPaid: false, updatedAt: now}, orgId)
  ])
  const {stripeSubscriptionId} = rethinkResult

  // stripe already does this for us (per account settings) but we do it here so we don't have to wait an hour
  // if this function is called by a paymentFailed hook, then the sub may not exist, so catch and release
  if (stripeSubscriptionId) {
    const manager = new StripeManager()
    try {
      await manager.deleteSubscription(stripeSubscriptionId)
    } catch (e) {
      // noop
    }
  }
  return stripeSubscriptionId
}

export default terminateSubscription
