import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getKysely from '../../../postgres/getKysely'
import {fromEpochSeconds} from '../../../utils/epochTime'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import {getStripeManager} from '../../../utils/stripe'
import {DataLoaderWorker} from '../../graphql'

const oldUpgradeToTeamTier = async (
  orgId: string,
  source: string,
  email: string,
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()
  const now = new Date()

  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) throw new Error('Bad orgId')

  const {stripeId, stripeSubscriptionId} = organization
  const orgUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  const activeOrgUsers = orgUsers.filter(({inactive}) => !inactive)
  const quantity = activeOrgUsers.length

  const manager = getStripeManager()
  const customer = stripeId
    ? await manager.updatePayment(stripeId, source)
    : await manager.createCustomer(orgId, email, undefined, source)
  if (customer instanceof Error) throw customer
  let subscriptionFields = {}
  if (!stripeSubscriptionId) {
    const subscription = await manager.createTeamSubscriptionOld(customer.id, orgId, quantity)
    subscriptionFields = {
      periodEnd: fromEpochSeconds(subscription.current_period_end),
      periodStart: fromEpochSeconds(subscription.current_period_start),
      stripeSubscriptionId: subscription.id
    }
  }

  await getKysely()
    .updateTable('Organization')
    .set({
      ...subscriptionFields,
      tier: 'team',
      stripeId: customer.id,
      tierLimitExceededAt: null,
      scheduledLockAt: null,
      lockedAt: null,
      updatedAt: now,
      trialStartDate: null
    })
    .where('id', '=', orgId)
    .execute()

  // If subscription already exists and has open invoices, try to process them
  if (stripeSubscriptionId) {
    const invoices = (await manager.listSubscriptionOpenInvoices(stripeSubscriptionId)).data

    if (invoices.length) {
      for (const invoice of invoices) {
        const invoiceResult = await manager.payInvoice(invoice.id)
        // Unlock teams only if all invoices are paid
        if (invoiceResult.status !== 'paid') {
          throw new Error('Unable to process payment')
        }
      }
    }
  }

  await Promise.all([
    pg
      .updateTable('Team')
      .set({
        isPaid: true,
        tier: 'team',
        trialStartDate: null
      })
      .where('orgId', '=', orgId)
      .execute(),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])
}

export default oldUpgradeToTeamTier
