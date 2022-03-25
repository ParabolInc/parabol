import getRethink from '../../../database/rethinkDriver'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import IUser from '../../../postgres/types/IUser'
import {requireSU} from '../../../utils/authorization'
import {fromEpochSeconds} from '../../../utils/epochTime'
import segmentIo from '../../../utils/segmentIo'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import StripeManager from '../../../utils/StripeManager'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import hideConversionModal from '../../mutations/helpers/hideConversionModal'
import {MutationResolvers} from '../resolverTypes'

const getBillingLeaderUser = async (
  email: string | null | undefined,
  orgId: string,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
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
    await r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null, orgId})
      .update({role: 'BILLING_LEADER'})
      .run()
    return user
  }
  const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  const billingLeaders = organizationUsers.filter(
    (organizationUser) => organizationUser.role === 'BILLING_LEADER'
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
  {authToken, dataLoader}
) => {
  const r = await getRethink()
  const now = new Date()
  // const operationId = dataLoader.share()

  // AUTH
  requireSU(authToken)

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
  if (tier !== 'personal') {
    return {error: {message: 'Upgrading from PRO not supported. requires PR'}}
  }
  if (stripeSubscriptionId) {
    return {error: {message: 'Tier not PRO but subscription ID found. Big Error.'}}
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
  const manager = new StripeManager()
  let customerId
  if (!stripeId) {
    // create the customer
    const customer = await manager.createCustomer(orgId, apEmail || user.email)
    await r.table('Organization').get(orgId).update({stripeId: customer.id}).run()
    customerId = customer.id
  } else {
    customerId = stripeId
  }

  const subscription = await manager.createEnterpriseSubscription(customerId, orgId, quantity, plan)

  await Promise.all([
    r({
      updatedOrg: r
        .table('Organization')
        .get(orgId)
        .update({
          periodEnd: fromEpochSeconds(subscription.current_period_end),
          periodStart: fromEpochSeconds(subscription.current_period_start),
          stripeSubscriptionId: subscription.id,
          tier: 'enterprise',
          updatedAt: now
        })
    }).run(),
    updateTeamByOrgId(
      {
        isPaid: true,
        tier: 'enterprise',
        updatedAt: now
      },
      orgId
    )
  ])

  await Promise.all([
    setUserTierForOrgId(orgId),
    setTierForOrgUsers(orgId),
    hideConversionModal(orgId, dataLoader)
  ])
  segmentIo.track({
    userId: user.id,
    event: 'Enterprise invoice drafted',
    properties: {orgId}
  })
  dataLoader.get('organizations').clear(orgId)
  return {orgId}
}

export default draftEnterpriseInvoice
