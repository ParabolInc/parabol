import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import IUser from '../../../postgres/types/IUser'
import {analytics} from '../../../utils/analytics/analytics'
import {fromEpochSeconds} from '../../../utils/epochTime'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import {getStripeManager} from '../../../utils/stripe'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import {MutationResolvers} from '../resolverTypes'

const getBillingLeaderUser = async (
  email: string | null | undefined,
  orgId: string,
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()
  if (email) {
    const user = await getUserByEmail(email)
    if (!user) {
      throw new Error('User for email not found')
    }
    const {id: userId} = user
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({userId, orgId})
    if (!organizationUser) {
      throw new Error('Email not associated with a user on that org')
    }
    if (organizationUser.role !== 'ORG_ADMIN') {
      await pg
        .updateTable('OrganizationUser')
        .set({role: 'BILLING_LEADER'})
        .where('userId', '=', userId)
        .where('orgId', '=', orgId)
        .where('removedAt', 'is', null)
        .execute()
    }
    return user
  }
  const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  const billingLeaders = organizationUsers.filter(
    (organizationUser) =>
      organizationUser.role === 'BILLING_LEADER' || organizationUser.role === 'ORG_ADMIN'
  )

  const billingLeaderUserIds = billingLeaders.map(({userId}) => userId)
  const billingLeaderUsers = (await dataLoader.get('users').loadMany(billingLeaderUserIds)).filter(
    isValid
  )
  return billingLeaderUsers[0]
}

const draftEnterpriseInvoice: MutationResolvers['draftEnterpriseInvoice'] = async (
  _source,
  {orgId, quantity, email, apEmail, plan},
  {dataLoader}
) => {
  const pg = getKysely()
  const now = new Date()

  // VALIDATION
  if (quantity < 1) {
    return {error: {message: 'quantity must be a positive integer'}}
  }

  const org = await dataLoader.get('organizations').load(orgId)
  if (!org) {
    return {error: {message: 'Invalid orgId'}}
  }

  const {stripeId, stripeSubscriptionId, tier} = org
  if (tier === 'enterprise') {
    return {error: {message: 'Org is already enterprise'}}
  }
  // TODO handle upgrade from PRO to ENTERPRISE
  if (tier !== 'starter') {
    return {error: {message: 'Upgrading from Team not supported. requires PR'}}
  }
  if (stripeSubscriptionId) {
    return {error: {message: 'Tier not Team but subscription ID found. Big Error.'}}
  }

  // RESOLUTION
  let user: IUser | undefined
  try {
    user = await getBillingLeaderUser(email, orgId, dataLoader)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unable to get billing leader user'
    return {error: {message}}
  }
  if (!user) {
    return {error: {message: 'User not found'}}
  }
  const manager = getStripeManager()
  let customerId
  if (!stripeId) {
    // create the customer
    const customer = await manager.createCustomer(orgId, apEmail || user.email)
    if (customer instanceof Error) throw customer
    await getKysely()
      .updateTable('Organization')
      .set({stripeId: customer.id})
      .where('id', '=', orgId)
      .execute()
    customerId = customer.id
  } else {
    customerId = stripeId
  }

  const subscription = await manager.createEnterpriseSubscription(
    customerId,
    orgId,
    quantity,
    plan ?? undefined
  )

  await Promise.all([
    pg
      .updateTable('Organization')
      .set({
        periodEnd: fromEpochSeconds(subscription.current_period_end),
        periodStart: fromEpochSeconds(subscription.current_period_start),
        stripeSubscriptionId: subscription.id,
        tier: 'enterprise',
        tierLimitExceededAt: null,
        scheduledLockAt: null,
        lockedAt: null,
        updatedAt: now,
        trialStartDate: null
      })
      .where('id', '=', orgId)
      .execute(),
    pg
      .updateTable('Team')
      .set({
        isPaid: true,
        tier: 'enterprise',
        trialStartDate: null
      })
      .where('orgId', '=', orgId)
      .execute(),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])
  analytics.organizationUpgraded(user, {
    orgId,
    domain: org.activeDomain || undefined,
    orgName: org.name,
    isTrial: !!org.trialStartDate,
    oldTier: 'starter',
    newTier: 'enterprise',
    billingLeaderEmail: user.email
  })
  dataLoader.get('organizations').clear(orgId)
  return {orgId}
}

export default draftEnterpriseInvoice
