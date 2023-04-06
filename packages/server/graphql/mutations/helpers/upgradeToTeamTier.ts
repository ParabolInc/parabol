import {MONTHLY_PRICE} from 'parabol-client/utils/constants'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getRethink from '../../../database/rethinkDriver'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import {fromEpochSeconds} from '../../../utils/epochTime'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import {getStripeManager} from '../../../utils/stripe'
import {DataLoaderWorker} from '../../graphql'
import getCCFromCustomer from './getCCFromCustomer'

const upgradeToTeamTier = async (
  orgId: string,
  paymentMethodId: string,
  email: string,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
  const now = new Date()

  const organization = await r.table('Organization').get(orgId).run()
  if (!organization) throw new Error('Bad orgId')

  const {stripeId, stripeSubscriptionId} = organization
  const quantity = await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null, inactive: false})
    .count()
    .run()

  const manager = getStripeManager()

  const customers = await manager.getCustomersByEmail(email)
  // console.log('🚀 ~ customers:', customers)
  const existingCustomer = customers.data.find((customer) => customer.metadata.orgId === orgId)
  const customer = existingCustomer ?? (await manager.createCustomer(orgId, email))
  console.log('🚀 ~ customer:', {customer, paymentMethodId, existingCustomer})
  const {id: customerId} = customer
  const res = await manager.attachPaymentToCustomer(customerId, paymentMethodId)
  console.log('🚀 ~ res:', res)
  const resDos = await manager.updateDefaultPaymentMethod(customerId, paymentMethodId)
  console.log('🚀 ~ resDos:', resDos)

  // const customer = stripeId
  //   ? await manager.updatePayment(stripeId, source)
  //   : await manager.createCustomer(orgId, email, source)

  let subscriptionFields = {}
  // if (!stripeSubscriptionId) {
  const subscription = await manager.createTeamSubscription(customer.id, orgId, quantity)
  console.log('🚀 ~ subscription:', subscription)
  subscriptionFields = {
    periodEnd: fromEpochSeconds(subscription.current_period_end),
    periodStart: fromEpochSeconds(subscription.current_period_start),
    stripeSubscriptionId: subscription.id
  }
  // }

  await Promise.all([
    r({
      updatedOrg: r
        .table('Organization')
        .get(orgId)
        .update({
          ...subscriptionFields,
          // creditCard: await getCCFromCustomer(customer),
          tier: 'team',
          stripeId: customer.id,
          tierLimitExceededAt: null,
          scheduledLockAt: null,
          lockedAt: null,
          updatedAt: now
        })
    }).run(),
    updateTeamByOrgId(
      {
        isPaid: true,
        tier: 'team'
      },
      orgId
    ),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])
}

export default upgradeToTeamTier
