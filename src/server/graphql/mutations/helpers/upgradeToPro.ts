import getRethink from 'server/database/rethinkDriver'
import StripeManager from 'server/utils/StripeManager'
import {fromEpochSeconds} from 'server/utils/epochTime'
import {PRO} from 'universal/utils/constants'
import getCCFromCustomer from 'server/graphql/mutations/helpers/getCCFromCustomer'
import {IOrganization} from 'universal/types/graphql'

const upgradeToPro = async (orgId: string, source: string) => {
  const r = getRethink()
  const now = new Date()

  const organization = (await r.table('Organization').get(orgId)) as IOrganization
  if (!organization) throw new Error('Bad orgId')

  const {stripeId, stripeSubscriptionId} = organization
  const quantity = await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null, inactive: false})
    .count()

  const manager = new StripeManager()
  const customer = stripeId
    ? await manager.updatePayment(stripeId, source)
    : await manager.createCustomer(orgId, source)

  let subscriptionFields = {}
  if (!stripeSubscriptionId) {
    const subscription = await manager.createSubscription(customer.id, orgId, quantity)
    subscriptionFields = {
      periodEnd: fromEpochSeconds(subscription.current_period_end),
      periodStart: fromEpochSeconds(subscription.current_period_start),
      stripeSubscriptionId: subscription.id
    }
  }

  await r({
    updatedOrg: r
      .table('Organization')
      .get(orgId)
      .update({
        ...subscriptionFields,
        creditCard: getCCFromCustomer(customer),
        tier: PRO,
        stripeId: customer.id,
        updatedAt: now
      }),
    teamIds: r
      .table('Team')
      .getAll(orgId, {index: 'orgId'})
      .update({
        isPaid: true,
        tier: PRO,
        updatedAt: now
      })
  })
}

export default upgradeToPro
