import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getKysely from '../../../postgres/getKysely'
import {toCreditCard} from '../../../postgres/helpers/toCreditCard'
import {analytics} from '../../../utils/analytics/analytics'
import {identifyHighestUserTierForOrgId} from '../../../utils/identifyHighestUserTierForOrgId'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import getCCFromCustomer from '../../mutations/helpers/getCCFromCustomer'
import type {MutationResolvers} from '../resolverTypes'

// included here to codegen has access to it
export type UpgradeToTeamTierSuccessSource = {
  orgId: string
  teamIds: string[]
}

const upgradeToTeamTier: MutationResolvers['upgradeToTeamTier'] = async (
  _source,
  {invoiceId, userId},
  {dataLoader, socketId: mutatorId}
) => {
  const manager = getStripeManager()
  const invoice = await manager.retrieveInvoice(invoiceId)
  const stripeId = invoice.customer as string
  const stripeSubscriptionId = invoice.subscription as string
  const customer = await manager.retrieveCustomer(stripeId)

  if (customer.deleted) {
    return standardError(new Error('Customer has been deleted'), {userId})
  }
  const orgId = customer.metadata.orgId
  if (!orgId) {
    return standardError(new Error('Customer does not have an orgId'), {
      userId
    })
  }

  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const [organization, billingLeader] = await Promise.all([
    dataLoader.get('organizations').loadNonNull(orgId),
    userId ? dataLoader.get('users').load(userId) : null
  ])

  const {tier, activeDomain, name: orgName, trialStartDate} = organization

  if (tier === 'enterprise') {
    return standardError(new Error("Can not change an org's plan from enterprise to team"), {
      userId
    })
  } else if (tier === 'team') {
    return standardError(new Error('Org is already on team tier'), {
      userId
    })
  }

  // RESOLUTION
  const creditCard = await getCCFromCustomer(customer)
  await Promise.all([
    pg
      .updateTable('Organization')
      .set({
        creditCard: toCreditCard(creditCard),
        isPaid: true,
        tier: 'team',
        tierLimitExceededAt: null,
        scheduledLockAt: null,
        lockedAt: null,
        trialStartDate: null,
        stripeId,
        stripeSubscriptionId
      })
      .where('id', '=', orgId)
      .execute(),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])
  organization.tier = 'team'

  if (userId) {
    await pg
      .updateTable('OrganizationUser')
      .set({role: 'BILLING_LEADER'})
      .where('userId', '=', userId)
      .where('orgId', '=', orgId)
      .where('removedAt', 'is', null)
      .execute()
  }
  // do this after the billing user update to avoid having to invalidate the dataloader
  await identifyHighestUserTierForOrgId(orgId, dataLoader)

  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)
  analytics.organizationUpgraded(billingLeader ?? {id: 'aGhostUser'}, {
    orgId,
    domain: activeDomain || undefined,
    isTrial: !!trialStartDate,
    orgName,
    oldTier: 'starter',
    newTier: 'team'
  })
  const data = {orgId, teamIds}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpgradeToTeamTierSuccess', data, subOptions)

  return data
}

export default upgradeToTeamTier
