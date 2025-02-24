import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getKysely from '../../../postgres/getKysely'
import {toCreditCard} from '../../../postgres/helpers/toCreditCard'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import getCCFromCustomer from '../../mutations/helpers/getCCFromCustomer'
import {MutationResolvers} from '../resolverTypes'

// included here to codegen has access to it
export type UpgradeToTeamTierSuccessSource = {
  orgId: string
  teamIds: string[]
}

const upgradeToTeamTier: MutationResolvers['upgradeToTeamTier'] = async (
  _source,
  {invoiceId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const userId = getUserId(authToken)
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
    return standardError(new Error('Customer does not have an orgId'), {userId})
  }

  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  const [organization, viewer] = await Promise.all([
    dataLoader.get('organizations').loadNonNull(orgId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])

  const {tier, activeDomain, name: orgName, trialStartDate} = organization

  if (tier === 'enterprise') {
    return standardError(new Error("Can not change an org's plan from enterprise to team"), {
      userId: viewerId
    })
  } else if (tier === 'team') {
    return standardError(new Error('Org is already on team tier'), {
      userId: viewerId
    })
  }

  // RESOLUTION
  const creditCard = await getCCFromCustomer(customer)
  await Promise.all([
    pg
      .updateTable('Organization')
      .set({
        creditCard: toCreditCard(creditCard),
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
  organization.tier = 'team'

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])

  await pg
    .updateTable('OrganizationUser')
    .set({role: 'BILLING_LEADER'})
    .where('userId', '=', viewerId)
    .where('orgId', '=', orgId)
    .where('removedAt', 'is', null)
    .execute()

  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)
  analytics.organizationUpgraded(viewer, {
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
